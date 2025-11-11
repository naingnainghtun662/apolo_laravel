import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

// Define NavItem interface directly here to avoid import issues
interface NavItem {
    title: string;
    href: string;
    icon?: React.ComponentType<any> | null;
    isActive?: boolean;
    children?: Omit<NavItem, 'icon'>[];
}

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    const { state } = useSidebar();
    const isSidebarClosed = state === 'collapsed';

    const isActive = (href: string) => {
        return href === page.url || page.url.startsWith(href + '/');
    };

    const isMenuActive = (item: NavItem) => {
        if (item.children) {
            return item.children.some((child: Omit<NavItem, 'icon'>) => isActive(child.href));
        }
        return isActive(item.href);
    };

    // Initialize openMenus with active menu items
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>(() => {
        const initialState: Record<string, boolean> = {};
        // Set initial state based on active menu items
        items.forEach((item) => {
            if (item.children && item.children.some((child) => isActive(child.href))) {
                initialState[item.title] = true;
            }
        });
        return initialState;
    });

    const toggleMenu = (title: string) => {
        setOpenMenus((prev) => {
            // Create a new state object to avoid reference issues
            const newState = { ...prev };
            // Toggle the state for this specific menu
            newState[title] = !prev[title];
            return newState;
        });
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        {item.children ? (
                            isSidebarClosed ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <SidebarMenuButton
                                            isActive={isMenuActive(item)}
                                            tooltip={{ children: item.title }}
                                            className="w-full justify-between"
                                        >
                                            <div className="flex items-center">
                                                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                                                <span className="text-sm">{item.title}</span>
                                            </div>
                                            <ChevronRight className="h-4 w-4" />
                                        </SidebarMenuButton>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side="right" align="start" className="w-48">
                                        {item.children.map((child: Omit<NavItem, 'icon'>) => (
                                            <DropdownMenuItem key={child.title} asChild>
                                                <Link
                                                    href={child.href}
                                                    prefetch
                                                    className={isActive(child.href) ? 'text-[13px] font-medium' : 'text-[13px]'}
                                                >
                                                    {child.title}
                                                </Link>
                                            </DropdownMenuItem>
                                        ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <Collapsible
                                    open={openMenus[item.title] !== undefined ? openMenus[item.title] : isMenuActive(item)}
                                    onOpenChange={() => toggleMenu(item.title)}
                                    className="w-full"
                                >
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton
                                            isActive={isMenuActive(item)}
                                            tooltip={{ children: item.title }}
                                            className="w-full justify-between"
                                        >
                                            <div className="flex items-center">
                                                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                                                <span className="text-sm">{item.title}</span>
                                            </div>
                                            {(openMenus[item.title] !== undefined ? openMenus[item.title] : isMenuActive(item)) ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="space-y-1 pt-1 pl-8">
                                        {item.children.map((child: Omit<NavItem, 'icon'>) => (
                                            <Link
                                                key={child.title}
                                                href={child.href}
                                                prefetch
                                                className={`flex items-center rounded-md px-2 py-1.5 text-[13px] hover:bg-accent ${isActive(child.href) ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground'}`}
                                            >
                                                <span>{child.title}</span>
                                            </Link>
                                        ))}
                                    </CollapsibleContent>
                                </Collapsible>
                            )
                        ) : (
                            <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={{ children: item.title }}>
                                <Link href={item.href} prefetch>
                                    {item.icon && <item.icon className="h-4 w-4" />}
                                    <span className="text-sm">{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        )}
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
