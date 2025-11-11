import { useOrderItemStore } from '@/store/useOrderItemsStore';
import { Branch } from '@/types/branch';
import { MenuCategory } from '@/types/category';
import { MenuItem } from '@/types/menu_item';
import { Table } from '@/types/table';
import { router, usePage } from '@inertiajs/react';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import ImageView from '../ImageView';
import AddToCartButton from '../menu_item/AddToCartButton';
import ItemBadges from '../menu_item/ItemBadges';
import ItemPrices from '../menu_item/ItemPrices';
import { Badge } from '../ui/badge';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

export default function BrowseMenuItems() {
    const { menuItems, branch, category, list_view } = usePage<{
        menuItems: MenuItem[];
        branch: Branch;
        category: MenuCategory;
        list_view: string;
    }>().props;

    const [tab, setTab] = useState(list_view);

    const handleTabChange = (value: string) => {
        setTab(value);
        router.reload({
            data: {
                list_view: value,
            },
            only: ['menu_items'],
        });
    };

    return (
        <div>
            <div className="flex items-center justify-between p-4">
                <p className="text-sm font-semibold">{category?.name}</p>

                <div>
                    <Tabs value={tab} defaultValue={tab} onValueChange={handleTabChange}>
                        <TabsList>
                            <TabsTrigger value="list">
                                <LayoutList />
                            </TabsTrigger>
                            <TabsTrigger value="grid">
                                <LayoutGrid />
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </div>

            <div className="p-4">
                {menuItems.length > 0 ? (
                    <ItemsLayouts tab={tab} items={menuItems} currency={branch.currency.toUpperCase()} key={tab} />
                ) : (
                    <div className="flex items-center justify-center">
                        <p className="text-sm text-muted-foreground">No items found</p>
                    </div>
                )}
            </div>

            <DynamicBottomSpacing />
        </div>
    );
}

const ItemsLayouts = ({ tab, items, currency }: { tab: string; items: MenuItem[]; currency: string }) => {
    if (tab == 'list') {
        return <ListMenuItems items={items} currency={currency} />;
    } else {
        return <GridLayoutMenuItems items={items} currency={currency} />;
    }
};

const MenuItemItem = ({ item, currency }: { item: MenuItem; currency: string }) => {
    const { table, branch } = usePage<{
        table: Table;
        branch: Branch;
    }>().props;
    const handleItemClick = () => {
        router.visit(
            route('menu_item.show', {
                tenant_id: branch.tenantId,
                branch_id: branch.id,
                table_public_token: table.publicToken,
                id: item.id,
            }),
        );
    };
    return (
        <div className={twMerge('flex w-full cursor-pointer items-start gap-4 py-4', item.outOfStock ? 'opacity-50' : '')} onClick={handleItemClick}>
            <div className="relative flex-shrink-0">
                <ImageView className="h-[120px] w-[120px] rounded-lg" src={item.image} alt={item.translations[0]?.name} />
                {item.outOfStock ? (
                    <div className="absolute right-0 bottom-0 left-0 p-2">
                        <Badge className="capitalize" variant={'destructive'}>
                            out of stock
                        </Badge>
                    </div>
                ) : (
                    <div className="absolute right-0 bottom-0 pr-1 pb-1">{item.variants.length == 1 && <AddToCartButton menuItem={item} />}</div>
                )}
                <div className="absolute top-0 left-0 p-2">
                    <ItemBadges badges={item.badges} />
                </div>
            </div>
            <div className="flex min-h-[120px] flex-grow flex-col justify-between self-baseline border-b pb-4">
                <div>
                    <p className="text-lg font-bold">{item.translations[0]?.name}</p>
                    <p className="text-gray-500">{item.translations[0]?.description}</p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                    <div>
                        <ItemPrices variants={item.variants} currency={currency} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const DynamicBottomSpacing = () => {
    const { table, branch } = usePage<{
        table: Table;
        branch: Branch;
    }>().props;
    const allSessionOrderItems = useOrderItemStore((store) => store.orders);
    const currentOrderSessionOrders = allSessionOrderItems[`${branch.id}-${table.id}`] ?? [];

    return <div className={twMerge(currentOrderSessionOrders.length == 0 ? 'mt-0' : 'mt-10')}></div>;
};

const GridLayoutMenuItems = ({ items, currency }: { items: MenuItem[]; currency: string }) => {
    const { table, branch } = usePage<{
        table: Table;
        branch: Branch;
    }>().props;

    const handleItemClick = (item: MenuItem) => {
        router.visit(
            route('menu_item.show', {
                tenant_id: branch.tenantId,
                branch_id: branch.id,
                table_public_token: table.publicToken,
                id: item.id,
            }),
        );
    };
    return (
        <div className="grid grid-cols-2 gap-4">
            {items.map((item) => (
                <div
                    key={item.id}
                    className={twMerge('relative', item.outOfStock ? 'opacity-50' : '')}
                    onClick={() => {
                        handleItemClick(item);
                    }}
                >
                    <div className="relative flex-shrink-0">
                        <ImageView className="h-[177px] w-[177px] rounded-lg" src={item.image} alt={item.translations[0]?.name} />
                        {item.outOfStock ? (
                            <div className="absolute right-0 bottom-0 left-0 p-2">
                                <Badge className="capitalize" variant={'destructive'}>
                                    out of stock
                                </Badge>
                            </div>
                        ) : (
                            <div className="absolute right-0 bottom-0 pr-1 pb-1">
                                {item.variants.length == 1 && <AddToCartButton menuItem={item} />}
                            </div>
                        )}
                    </div>
                    <div className="mt-2">
                        <p>{item.translations[0]?.name}</p>
                        <ItemPrices className="text-sm text-gray-500" currency={currency} variants={item.variants} />
                    </div>
                    <div className="absolute top-[8px] left-[8px]">
                        <ItemBadges badges={item.badges} />
                    </div>
                </div>
            ))}
        </div>
    );
};

const ListMenuItems = ({ items, currency }: { items: MenuItem[]; currency: string }) => {
    return (
        <div className="flex flex-col gap-4">
            {items.map((item) => (
                <MenuItemItem key={item.id} item={item} currency={currency} />
            ))}
        </div>
    );
};
