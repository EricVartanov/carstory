import { Link, router } from '@inertiajs/react';
import { Car, LayoutGrid, LogOut, User } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { dashboard, logout } from '@/routes';
import { index } from '@/routes/garage';
import { edit as profileEdit } from '@/routes/profile';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Панель',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Гараж',
        href: index(),
        icon: Car,
    },
    {
        title: 'Профиль',
        href: profileEdit(),
        icon: User,
    },
];

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Репозиторий',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: FolderGit2,
    // },
];

export function AppSidebar() {
    const cleanup = useMobileNavigation();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                <SidebarGroup className="px-2">
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild tooltip={{ children: 'Выход' }}>
                                    <Link
                                        href={logout()}
                                        method="post"
                                        as="button"
                                        prefetch={false}
                                        onClick={handleLogout}
                                        className="cursor-pointer"
                                    >
                                        <LogOut />
                                        <span>Выход</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
