import { usePage } from '@inertiajs/react';
import { AnimatePresence } from 'framer-motion';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { BottomNav } from '@/components/bottom-nav';
import { PageTransition } from '@/components/page-transition';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const { url } = usePage();

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="pb-16 lg:pb-0">
                    <AnimatePresence mode="wait">
                        <PageTransition key={url}>{children}</PageTransition>
                    </AnimatePresence>
                </div>
            </AppContent>
            <BottomNav />
        </AppShell>
    );
}
