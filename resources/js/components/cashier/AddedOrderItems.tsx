import { OrderItem, useCashierOrderItemStore } from '@/store/cashier/useCashierOrderItemsStore';
import { Branch } from '@/types/branch';
import { router, usePage } from '@inertiajs/react';
import { ImageOffIcon, Minus, Plus, Trash2Icon } from 'lucide-react';
import Price from '../common/Price';
import { Button } from '../ui/button';

export default function AddedOrderItems({ tableId, orderType }: { tableId?: string; orderType?: string }) {
    const {
        branch,
        filters: { table },
        flash,
    } = usePage<{
        branch: Branch;
        filters: {
            table: string;
        };
    }>().props;
    console.log({
        table,
        flash,
    });
    const allOrders = useCashierOrderItemStore((store) => store.orders);
    const uniqueKey = `${branch.id}-${tableId || table}`;
    console.log({
        uniqueKey,
    });
    const orders = allOrders[uniqueKey];
    console.log({ orders });
    const clearOrder = useCashierOrderItemStore((store) => store.clearOrder);
    const addOrUpdateOrderItem = useCashierOrderItemStore((store) => store.addOrUpdateOrderItem);
    const decreaseOrderItem = useCashierOrderItemStore((store) => store.decreaseOrderItem);
    const removeOrderItem = useCashierOrderItemStore((store) => store.removeOrderItem);
    const getTotalAmount = useCashierOrderItemStore((store) => store.getTotalAmount);
    const handleClearOrder = () => {
        clearOrder(uniqueKey);
    };
    const handleIncreaseOrderItem = (orderItem: OrderItem) => {
        addOrUpdateOrderItem(uniqueKey, {
            menuItem: orderItem.menuItem,
            quantity: 1,
            notes: orderItem.notes,
            variantId: orderItem.variantId,
            price: orderItem.price,
        });
    };
    const handleDecreaseOrderItem = (orderItem: OrderItem) => {
        decreaseOrderItem(uniqueKey, {
            menuItem: orderItem.menuItem,
            quantity: orderItem.quantity > 1 ? orderItem.quantity - 1 : 1,
            notes: orderItem.notes,
            variantId: orderItem.variantId,
            price: orderItem.price,
        });
    };

    const handleRemoveOrderItem = (orderItem: OrderItem) => {
        removeOrderItem(uniqueKey, orderItem.menuItem.id, orderItem.variantId);
    };

    const subtotal = getTotalAmount(uniqueKey);
    const vatAmount = subtotal * (branch.tax / 100);
    const total = subtotal + vatAmount;

    const handleSaveOrderItems = () => {
        const items = orders?.map((orderItem) => {
            return {
                menuItemId: orderItem.menuItem.id,
                variantId: orderItem.variantId,
                quantity: orderItem.quantity,
                notes: orderItem.notes,
            };
        });
        router.post(
            route('order.storeByCashier', {
                tableId: tableId || table,
                items: items,
                notes: '',
                orderType: orderType || 'dine_in',
            }),
        );
    };

    return (
        <div className="relative max-h-[80vh] overflow-y-auto px-6">
            <div className="flex items-center justify-between border-b py-2">
                <p className="text-sm font-semibold">Added items</p>
                <Button onClick={handleClearOrder} variant={'outline'}>
                    <Trash2Icon />
                    Reset
                </Button>
            </div>
            <div>
                {orders?.map((orderItem) => (
                    <div key={orderItem.menuItem.id} className="flex gap-2 border-b py-2">
                        <div>
                            {orderItem.menuItem.image ? (
                                <img
                                    className="h-24 w-24 rounded-md object-cover"
                                    src={orderItem.menuItem.image}
                                    alt={orderItem.menuItem.translations[0].name}
                                />
                            ) : (
                                <div className="flex h-24 w-24 items-center justify-center rounded-md border">
                                    <ImageOffIcon size={16} className="text-muted-foreground" />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-grow flex-col justify-between text-sm">
                            <div>
                                <p>
                                    {orderItem.menuItem.translations[0].name}
                                    {orderItem.menuItem.variants.find((v) => v.id == orderItem.variantId)?.name && (
                                        <span className="text-sm font-semibold">
                                            ({orderItem.menuItem.variants.find((v) => v.id == orderItem.variantId)?.name})
                                        </span>
                                    )}
                                </p>
                                {orderItem.notes && (
                                    <p>
                                        <span className="text-sm font-medium text-red-500">Note: {orderItem.notes}</span>
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-4">
                                    {orderItem.quantity == 1 ? (
                                        <Button onClick={() => handleRemoveOrderItem(orderItem)}>
                                            <Trash2Icon />
                                        </Button>
                                    ) : (
                                        <Button onClick={() => handleDecreaseOrderItem(orderItem)}>
                                            <Minus />
                                        </Button>
                                    )}
                                    <p className="font-semibold">{orderItem.quantity}</p>
                                    <Button
                                        onClick={() => {
                                            handleIncreaseOrderItem(orderItem);
                                        }}
                                    >
                                        <Plus />
                                    </Button>
                                </div>
                                <div>
                                    <Price amount={orderItem.price * orderItem.quantity} className="font-bold" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="mt-6 rounded-md border bg-white p-3 text-sm">
                <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <Price amount={subtotal} className="font-bold" />
                </div>
                <div className="mt-4 flex items-center justify-between border-b border-dashed pb-5">
                    <span>TAX {branch.tax}%</span>
                    <Price amount={vatAmount} className="font-bold" />
                </div>
                <div className="mt-5 flex items-center justify-between">
                    <span className="font-bold">Total</span>
                    <Price amount={total} className="font-bold" />
                </div>

                <Button onClick={handleSaveOrderItems} className="mt-2 mb-5 w-full">
                    Save and send to kitchen
                </Button>
            </div>
        </div>
    );
}
