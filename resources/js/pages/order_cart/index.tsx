import Price from '@/components/common/Price';
import EmptyOrdersIcon from '@/components/EmptyOrder';
import BackToMenus from '@/components/menu_item/BackToMenus';
import OrderItem from '@/components/order_cart/OrderItem';
import { Button } from '@/components/ui/button';
import { useUserLocation } from '@/hooks/use-user-location';
import PublicLayout from '@/layouts/public-layout';
import { useOrderItemStore } from '@/store/useOrderItemsStore';
import { Branch } from '@/types/branch';
import { MenuItem } from '@/types/menu_item';
import { Table } from '@/types/table';
import { router, usePage } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export default function OrderItemsCart() {
    const { table, branch, items } = usePage<{
        table: Table;
        branch: Branch;
        items: MenuItem[];
    }>().props;

    // ✅ get user location
    const { lat, long, loading, error } = useUserLocation();

    // ✅ create a unique key for tenant + table
    const key = `${branch.id}-${table.id}`;

    // ✅ fetch scoped items
    const allSessionOrderItems = useOrderItemStore((store) => store.orders);
    const orderItems = allSessionOrderItems[key] ?? [];

    const handleOrderClick = () => {
        if (branch.radius > 0 && (!lat || !long)) {
            toast.error('Failed to get location');
        } // guard: no location
        if (table.publicToken && branch) {
            router.post(
                route('order.store'),
                {
                    branchId: branch.id,
                    tablePublicToken: table.publicToken,
                    items: orderItems,
                    orderType: 'dine_in',
                    lat,
                    long, // ✅ send GPS coordinates
                },
                {
                    onSuccess: () => {
                        useOrderItemStore.getState().clearOrder(key);
                        useOrderItemStore.getState().clearSession(key);
                        router.visit(route('branch_menu.index'));
                    },
                },
            );
        }
    };

    const totalPrice = orderItems.reduce((acc, item) => {
        const menuItem = items.find((i) => i.id === item.menuItemId);
        const variant = menuItem?.variants.find((v) => v.id === item.variantId);
        const price = Number(variant?.price ?? item.price ?? 0);
        return acc + price * item.quantity;
    }, 0);

    const disabled = orderItems.length === 0 || loading || (branch.radius > 0 ? !!error || !lat || !long : false);

    return (
        <PublicLayout>
            <div className="relative h-[100vh]">
                <div className="p-2">
                    <BackToMenus />
                </div>
                <div className="p-4">
                    <p className="mb-3 font-semibold">Your cart</p>
                    {orderItems?.map((item) => {
                        const menuItem = items.find((i) => i.id === item.menuItemId);
                        if (!menuItem) return null;
                        return <OrderItem key={item.variantId} orderItem={item} menuItem={menuItem} currency={branch.currency.toUpperCase()} />;
                    })}
                </div>

                {orderItems.length === 0 ? (
                    <div className="p-4">
                        <div className="flex flex-col items-center justify-center gap-4">
                            <EmptyOrdersIcon />
                            <p className="font-medium text-muted-foreground">Looks like your order's empty!</p>
                        </div>
                    </div>
                ) : (
                    <div className="absolute right-0 bottom-0 left-0 mt-3 rounded-t-md border bg-white p-4 shadow-md">
                        <Button className="flex w-full justify-between" onClick={handleOrderClick} disabled={disabled}>
                            <div className="flex items-center gap-1">
                                <ShoppingCart />
                                <span className="text-sm font-medium">
                                    {loading ? 'Checking location...' : error && branch.radius > 0 ? 'Location required' : 'Place order'}
                                </span>
                            </div>
                            <Price className="text-sm font-medium" amount={totalPrice} />
                        </Button>

                        {/* ✅ Show error if location blocked or failed */}
                        {branch.radius > 0 && error && <p className="mt-2 text-center text-xs text-red-500">{error}</p>}
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
