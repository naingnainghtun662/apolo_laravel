import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    ConciergeBellIcon,
    // DollarSign,
    LayoutGrid,
    ListIcon,
    // MapPin,
    QrCodeIcon,
    Settings,
    Users2,
    UtensilsCrossed,
    WarehouseIcon,
} from 'lucide-react';
import AppLogo from './app-logo';
import NotificationsList from './cashier/Notifications';
import HasRole from './HasRole';

const adminNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Orders',
        href: route('admin.orders'),
        icon: ListIcon,
    },
    {
        title: 'Users List',
        href: route('users.index'),
        icon: Users2,
    },
    {
        title: 'Hot Action',
        href: route('request-actions.index'),
        icon: BookOpen,
    },
    {
        title: 'Tables & QR',
        href: route('tables.index'),
        icon: QrCodeIcon,
    },
    {
        title: 'Menus',
        href: route('menu_category.index'),
        icon: UtensilsCrossed,
    },
    // Collapsible Settings Group
    {
        title: 'Settings',
        icon: Settings,
        href: route('restaurant_setting.general'),
        children: [
            {
                title: 'General settings',
                href: route('restaurant_setting.general'),
                // icon: Settings,
            },
            {
                title: 'TAX, Currency, Language',
                href: route('restaurant_setting.tax_currency_language'),
                // icon: DollarSign,
            },
            {
                title: 'Location',
                href: route('restaurant_setting.location'),
                // icon: MapPin,
            },
        ],
    },
];

const cashierNavItems: NavItem[] = [
    {
        title: 'Orders',
        href: route('cashier.orders'),
        icon: ListIcon,
    },
    {
        title: 'Menus',
        href: route('cashier.menus'),
        icon: UtensilsCrossed,
    },

    {
        title: 'Stock',
        href: route('cashier.stocks'),
        icon: WarehouseIcon,
    },
    {
        title: 'Kitchen',
        href: route('kitchen.orders'),
        icon: ConciergeBellIcon,
    },
];

const kitchenNavItems: NavItem[] = [
    {
        title: 'Orders',
        href: route('kitchen.orders'),
        icon: ConciergeBellIcon,
    },
];

export function AppSidebar() {
    const { auth } = usePage().props;
    console.log({
        auth,
    });
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
                <HasRole role="admin">
                    <NavMain items={adminNavItems} />
                </HasRole>
                <HasRole role="cashier">
                    <NavMain items={cashierNavItems} />
                    <NotificationsList />
                </HasRole>
                <HasRole role="kitchen">
                    <NavMain items={kitchenNavItems} />
                </HasRole>
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
