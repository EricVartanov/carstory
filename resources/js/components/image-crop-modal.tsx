import { useEffect, useMemo, useRef, useState } from 'react';
import type { Crop, PixelCrop } from 'react-image-crop';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogBody,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { TempUploadResult } from '@/lib/upload';
import { cn } from '@/lib/utils';

export type ImageCropModalProps = {
    open: boolean;
    uploading: boolean;
    tempResult: TempUploadResult | null;
    onClose: () => void;
    onSave: (blob: Blob, tempPath: string) => void | Promise<void>;
    aspect?: number;
    circularCrop?: boolean;
    title: string;
};

function createCenteredAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
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

const getCroppedBlob = async (imgEl: HTMLImageElement, pixelCrop: PixelCrop): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    const ctx = canvas.getContext('2d')!;

    const scaleX = imgEl.naturalWidth / imgEl.width;
    const scaleY = imgEl.naturalHeight / imgEl.height;

    ctx.drawImage(
        imgEl,
        pixelCrop.x * scaleX,
        pixelCrop.y * scaleY,
        pixelCrop.width * scaleX,
        pixelCrop.height * scaleY,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height,
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => (blob ? resolve(blob) : reject(new Error('Canvas empty'))),
            'image/jpeg',
            0.85,
        );
    });
};

export function ImageCropModal({
    open,
    uploading,
    tempResult,
    onClose,
    onSave,
    aspect = 1,
    circularCrop = false,
    title,
}: ImageCropModalProps) {
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [crop, setCrop] = useState<Crop>();
    const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
    const [saving, setSaving] = useState(false);
    const lastImageUrlRef = useRef<string | null>(null);
    const closingRef = useRef(false);

    useEffect(() => {
        const nextUrl = tempResult?.url ?? null;

        if (lastImageUrlRef.current !== nextUrl) {
            lastImageUrlRef.current = nextUrl;
            setCrop(undefined);
            setCompletedCrop(null);
        }
    }, [tempResult?.url]);

    useEffect(() => {
        if (open) {
            closingRef.current = false;
        }
    }, [open]);

    const canSave = useMemo(() => {
        return (
            !saving &&
            !uploading &&
            tempResult !== null &&
            completedCrop !== null &&
            completedCrop.width > 0 &&
            completedCrop.height > 0
        );
    }, [completedCrop, saving, tempResult, uploading]);

    async function confirm() {
        if (!tempResult || !imgRef.current || !completedCrop) {
            return;
        }

        setSaving(true);

        try {
            const blob = await getCroppedBlob(imgRef.current, completedCrop);
            await onSave(blob, tempResult.temp_path);
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                if (v) {
                    return;
                }

                if (closingRef.current) {
                    return;
                }

                closingRef.current = true;
                onClose();
            }}
        >
            <DialogContent className="p-0">
                <DialogHeader className="shrink-0 border-b px-5 py-4">
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <DialogBody className="px-5 py-4">
                    {uploading && !tempResult ? (
                        <div className="flex h-56 w-full flex-col items-center justify-center rounded-xl border bg-muted text-sm text-muted-foreground">
                            Подготовка изображения…
                        </div>
                    ) : tempResult ? (
                        <div
                            className={cn(
                                'grid gap-3',
                                saving ? 'opacity-70' : '',
                            )}
                        >
                            <ReactCrop
                                crop={crop}
                                onChange={(_, next) => setCrop(next)}
                                onComplete={(c) => setCompletedCrop(c)}
                                aspect={aspect}
                                circularCrop={circularCrop}
                                className="mx-auto max-w-full"
                            >
                                <img
                                    ref={imgRef}
                                    src={tempResult.url}
                                    alt=""
                                    className="max-h-[60dvh] w-full select-none rounded-md object-contain"
                                    draggable={false}
                                    onLoad={(e) => {
                                        const img = e.currentTarget;
                                        const next = createCenteredAspectCrop(
                                            img.width,
                                            img.height,
                                            aspect,
                                        );
                                        setCrop((prev) => prev ?? next);
                                    }}
                                />
                            </ReactCrop>
                        </div>
                    ) : (
                        <div className="flex h-56 w-full items-center justify-center rounded-xl border bg-muted text-sm text-muted-foreground">
                            Выберите изображение
                        </div>
                    )}
                </DialogBody>

                <DialogFooter className="shrink-0 border-t px-5 py-4">
                    <div className="grid w-full grid-cols-2 gap-2">
                        <Button
                            type="button"
                            variant="secondary"
                            className="h-12"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Отмена
                        </Button>
                        <Button
                            type="button"
                            className="h-12"
                            onClick={confirm}
                            disabled={!canSave}
                        >
                            Сохранить
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

