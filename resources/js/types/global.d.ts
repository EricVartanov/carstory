import type { Auth } from '@/types/auth';
import type { SharedEnums } from '@/types/enums';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            enums: SharedEnums;
            flash: {
                success: string | null;
                error: string | null;
            };
            sidebarOpen: boolean;
        };
    }
}
