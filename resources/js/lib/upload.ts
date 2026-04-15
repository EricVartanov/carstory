import { http } from '@inertiajs/react';
import { deleteTemp as deleteTempRoute, temp as tempRoute } from '@/routes/upload';

export type TempUploadResult = {
    temp_path: string;
    url: string;
};

export function useTempUpload(): {
    uploadTemp: (file: File) => Promise<TempUploadResult>;
    deleteTemp: (tempPath: string) => Promise<void>;
} {
    return buildTempUpload();
}

export function buildTempUpload(): {
    uploadTemp: (file: File) => Promise<TempUploadResult>;
    deleteTemp: (tempPath: string) => Promise<void>;
} {
    async function uploadTemp(file: File): Promise<TempUploadResult> {
        const form = new FormData();
        form.append('file', file);

        const response = await http.getClient().request({
            url: tempRoute.url(),
            method: 'post',
            data: form,
            headers: {
                Accept: 'application/json',
            },
        });

        const result = JSON.parse(response.data) as TempUploadResult;

        return result;
    }

    async function deleteTemp(tempPath: string): Promise<void> {
        await http.getClient().request({
            url: deleteTempRoute.url(),
            method: 'delete',
            data: { temp_path: tempPath },
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        });
    }

    return { uploadTemp, deleteTemp };
}

