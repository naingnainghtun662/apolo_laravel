import Price from '@/components/common/Price';
import OrderItem from '@/components/order_detail/OrderItem';
import SelectPaymentMethod from '@/components/order_detail/SelectPaymentMethod';
import { Branch } from '@/types/branch';
import { Order } from '@/types/order';
import { usePage } from '@inertiajs/react';

export default function OrderDetail() {
    const { order, branch } = usePage<{
        order: Order;
        branch: Branch;
    }>().props;
    console.log({ order });
    return (
        <div className="p-4">
            <p className="font-semibold">Order History i</p>
            {(order.items?.length ?? 0) > 0 ? (
                <>
                    <div className="mt-3">
                        {order.items?.map((item) => (
                            <OrderItem key={item.id} orderItem={item} menuItem={item.menuItem} currency={branch.currency} />
                        ))}
                    </div>
                    <div className="bg-gray-100 p-3">
                        <div className="border-b py-3 text-muted-foreground">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Sub total</span>
                                <Price className="text-sm" amount={order.subtotal} />
                                {/* 
                                <span className="text-sm">
                                    {order.subtotal}
                                    {branch.currency}
                                </span> */}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Tax</span>
                                <span className="text-sm">{`${branch.tax}%`}</span>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <span className="text-sm font-medium">Total</span>
                            <Price className="text-sm font-medium" amount={order.total} />
                        </div>
                    </div>
                    <SelectPaymentMethod />
                </>
            ) : (
                <div className="p-4">
                    <p className="text-muted-foreground">No order items found</p>
                </div>
            )}
        </div>
    );
}
