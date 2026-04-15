import { useEffect, useMemo, useRef, useState } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

import type { Crop, PixelCrop } from 'react-image-crop';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    file: File | null;
    title: string;
    aspect: number; // width / height
    output: { width: number; height: number; quality?: number };
    onCropped: (file: File, previewUrl: string) => void;
};

function createCenteredAspectCrop(
    mediaWidth: number,
    mediaHeight: number,
    aspect: number,
): Crop {
    return centerCrop(
        makeAspectCrop(
            {
                unit: '%',
                width: 80,
            },
            aspect,
            mediaWidth,
            mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
    );
}

async function cropToJpeg(params: {
    img: HTMLImageElement;
    crop: PixelCrop;
    output: { width: number; height: number; quality: number };
    fileNameBase: string;
}): Promise<{ file: File; previewUrl: string }> {
    const { img, crop, output, fileNameBase } = params;

    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    const sourceX = Math.round(crop.x * scaleX);
    const sourceY = Math.round(crop.y * scaleY);
    const sourceW = Math.round(crop.width * scaleX);
    const sourceH = Math.round(crop.height * scaleY);

    const canvas = document.createElement('canvas');
    canvas.width = output.width;
    canvas.height = output.height;

    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Canvas context not available');
    }

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceW,
        sourceH,
        0,
        0,
        canvas.width,
        canvas.height,
    );

    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (b) => {
                if (!b) {
                    reject(new Error('JPEG export failed'));

                    return;
                }

                resolve(b);
            },
            'image/jpeg',
            output.quality,
        );
    });

    const file = new File([blob], `${fileNameBase}.jpg`, { type: 'image/jpeg' });
    const previewUrl = URL.createObjectURL(file);

    return { file, previewUrl };
}

export function ReactImageCropDialog({ open, onOpenChange, file, title, aspect, output, onCropped }: Props) {
    const imgRef = useRef<HTMLImageElement | null>(null);

    const [objectUrl, setObjectUrl] = useState<string | null>(null);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
    const [exporting, setExporting] = useState(false);

    const quality = output.quality ?? 0.9;
    const fileNameBase = useMemo(() => (file ? file.name.replace(/\.[^.]+$/, '') : 'image'), [file]);

    useEffect(() => {
        if (!open || !file) {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }

            setObjectUrl(null);
            setCrop(undefined);
            setCompletedCrop(null);

            return;
        }

        const url = URL.createObjectURL(file);
        setObjectUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, file]);

    async function confirm() {
        if (!imgRef.current || !completedCrop || completedCrop.width <= 0 || completedCrop.height <= 0) {
            return;
        }

        setExporting(true);

        try {
            const { file: croppedFile, previewUrl } = await cropToJpeg({
                img: imgRef.current,
                crop: completedCrop,
                output: { width: output.width, height: output.height, quality },
                fileNameBase,
            });

            onCropped(croppedFile, previewUrl);
            onOpenChange(false);
        } finally {
            setExporting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-0">
                <DialogHeader className="shrink-0 border-b px-6 py-4">
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <DialogBody className="px-6 py-4">
                    <div
                        className={cn(
                            'grid gap-3',
                            exporting ? 'opacity-70' : '',
                        )}
                    >
                        {objectUrl ? (
                            <ReactCrop
                                crop={crop}
                                onChange={(_, next) => setCrop(next)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={aspect}
                                className="mx-auto max-w-full"
                            >
                                <img
                                    ref={imgRef}
                                    src={objectUrl}
                                    alt=""
                                    className="max-h-[60dvh] w-full max-w-[min(90vw,720px)] select-none rounded-md object-contain"
                                    draggable={false}
                                    onLoad={(e) => {
                                        const img = e.currentTarget;
                                        const next =
                                            createCenteredAspectCrop(
                                                img.width,
                                                img.height,
                                                aspect,
                                            );
                                        setCrop(next);
                                    }}
                                />
                            </ReactCrop>
                        ) : (
                            <div className="flex h-48 w-full items-center justify-center rounded-xl border bg-muted text-sm text-muted-foreground">
                                Загрузка…
                            </div>
                        )}
                    </div>
                </DialogBody>

                <DialogFooter className="shrink-0 border-t px-6 py-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => onOpenChange(false)}
                        disabled={exporting}
                    >
                        Отмена
                    </Button>
                    <Button
                        type="button"
                        onClick={confirm}
                        disabled={
                            exporting ||
                            !completedCrop ||
                            completedCrop.width <= 0 ||
                            completedCrop.height <= 0
                        }
                    >
                        Сохранить
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

