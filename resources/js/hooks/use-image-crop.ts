import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import type { TempUploadResult } from '@/lib/upload';
import { useTempUpload } from '@/lib/upload';

export function useImageCrop(): {
    modalOpen: boolean;
    uploading: boolean;
    tempResult: TempUploadResult | null;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    openFilePicker: () => void;
    handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
    handleClose: () => Promise<void>;
    setModalOpen: (v: boolean) => void;
    setTempResult: (v: TempUploadResult | null) => void;
} {
    const [modalOpen, setModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [tempResult, setTempResult] = useState<TempUploadResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { uploadTemp, deleteTemp } = useTempUpload();

    const openFilePicker = useCallback(() => fileInputRef.current?.click(), []);

    const handleFileChange = useCallback(
        async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];

            if (!file) {
                return;
            }

            e.target.value = '';
            setUploading(true);
            setModalOpen(true);

            try {
                const result = await uploadTemp(file);
                setTempResult(result);
            } catch (err) {
                setModalOpen(false);
                setTempResult(null);
                // TODO: toast
                console.error('Upload failed', err);
            } finally {
                setUploading(false);
            }
        },
        [uploadTemp],
    );

    const handleClose = useCallback(async () => {
        if (tempResult) {
            await deleteTemp(tempResult.temp_path).catch(() => {});
            setTempResult(null);
        }

        setModalOpen(false);
    }, [deleteTemp, tempResult]);

    return {
        modalOpen,
        uploading,
        tempResult,
        fileInputRef,
        openFilePicker,
        handleFileChange,
        handleClose,
        setModalOpen,
        setTempResult,
    };
}

