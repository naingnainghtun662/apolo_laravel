import { useOrderItemStore } from '@/store/useOrderItemsStore';
import { Branch } from '@/types/branch';
import { Table } from '@/types/table';
import { router, usePage } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import Price from '../common/Price';
import { Button } from '../ui/button';

export default function OrderCart() {
    const { table, branch } = usePage<{
        table: Table;
        branch: Branch;
    }>().props;
    const contextKey = `${branch.id}-${table.id}`;
    const allSessionOrderItems = useOrderItemStore((store) => store.orders);
    const orderItems = allSessionOrderItems[contextKey] ?? [];
    const getTotalAmount = useOrderItemStore((store) => store.getTotalAmount);
    if (orderItems.length == 0) return null;

    const goToCart = () => {
        router.visit(
            route('order_cart.index', {
                tenant_id: branch.tenantId,
                public_token: table.publicToken,
                branch_id: branch.id,
            }),
            {
                data: {
                    items: orderItems.map((orderItem) => orderItem.menuItemId) || [],
                },
            },
        );
    };

    return (
        <div onClick={goToCart} className="w-full border-t bg-white p-4 shadow">
            <Button className="flex w-full items-center justify-between">
                <div className="flex items-center gap-1">
                    <ShoppingCart />
                    <span>{`Basket . ${orderItems.length} items`}</span>
                </div>
                <Price amount={getTotalAmount(contextKey)} className="font-medium" />
            </Button>
        </div>
    );
}
