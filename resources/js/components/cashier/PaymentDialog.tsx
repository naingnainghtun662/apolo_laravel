import { orderTypes } from '@/lib/utils';
import { Branch } from '@/types/branch';
import { Order } from '@/types/order';
import { Table } from '@/types/table';
import { router, usePage } from '@inertiajs/react';
import dayjs from 'dayjs';
import { CheckCircle2Icon, CircleDollarSignIcon, DollarSign, ImageOffIcon } from 'lucide-react';
import Price from '../common/Price';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

export default function PaymentDialog() {
    const { tableOrders, table, branch } = usePage<{
        filters: {
            table: string;
        };
        tableOrders: Order[];
        table: Table;
        branch: Branch;
    }>().props;

    const firstOrder = tableOrders[0];
    const tableOrderTotal = tableOrders.reduce((acc, order) => acc + (Number(order.subtotal) || 0), 0);
    const tableOrderTax = tableOrders.reduce((acc, order) => acc + (Number(order.tax) || 0), 0);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="w-full">
                    <DollarSign />
                    Proceed to payment
                </Button>
            </DialogTrigger>
            <DialogContent className="min-w-full p-0">
                <DialogHeader className="border-b p-4">
                    <DialogTitle>Payment</DialogTitle>
                </DialogHeader>
                <div className="mt-[-16px] flex">
                    <div className="relative h-[80vh] flex-grow overflow-auto border border-t-0">
                        <div className="flex items-center justify-between border-b p-4">
                            <div className="flex items-center gap-2">
                                <div className="rounded-md bg-blue-600 p-2">
                                    <span className="font-bold text-white">{table.name}</span>
                                </div>
                                <div>
                                    <p>
                                        <span className="text-sm font-medium text-muted-foreground">Order Id: </span>
                                        <span className="text-sm font-medium">
                                            {firstOrder?.orderNumber}/{orderTypes[firstOrder?.orderType]}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="px-3 py-2">
                                <p className="text-sm font-medium text-muted-foreground">
                                    {dayjs(firstOrder?.createdAt).format('MMM, DD YYYY . HH:mm:ss A')}
                                </p>
                            </div>
                        </div>
                        {/* <pre>{JSON.stringify(tableOrders, null, 2)}</pre> */}
                        <div className="px-6">
                            {tableOrders.map((order) => {
                                return order.items?.map((item) => (
                                    <div key={item.id} className="flex gap-2 border-b py-4">
                                        <div>
                                            {item.menuItem?.image ? (
                                                <img
                                                    className="h-14 w-14 rounded-md object-cover"
                                                    src={item.menuItem?.image}
                                                    alt={item.menuItem?.translations[0]?.name}
                                                />
                                            ) : (
                                                <div className="flex h-14 w-14 items-center justify-center rounded-md border">
                                                    <ImageOffIcon className="text-muted-foreground" size={16} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-grow flex-col justify-between">
                                            <div>
                                                <p className="mb-auto text-sm font-medium">
                                                    <span>{item.menuItem?.translations[0]?.name}</span>
                                                    {item.variant?.name ? (
                                                        <span className="font-semibold">({item.variant?.name})</span>
                                                    ) : (
                                                        <span></span>
                                                    )}
                                                </p>
                                                {item.notes && (
                                                    <div>
                                                        <p className="text-sm font-medium text-red-500">Note: {item.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex w-full items-center justify-between text-sm font-medium">
                                                <span>{item.quantity}</span>
                                                <Price amount={order.subtotal} className="font-semibold" />
                                            </div>
                                        </div>
                                    </div>
                                ));
                            })}
                        </div>
                        <div className="sticky right-0 bottom-0 left-0 w-full rounded-md bg-gray-100 px-8 py-3 shadow">
                            <div className="flex items-center justify-between text-sm">
                                <span>Subtotal</span>
                                <Price amount={tableOrderTotal} className="font-semibold" />
                            </div>
                            <div className="mt-4 mb-5 flex items-center justify-between border-b border-dashed">
                                <span>Tax {branch.tax}%</span>
                                <Price amount={tableOrderTax} className="font-semibold" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Total</span>
                                <Price amount={tableOrderTotal + tableOrderTax} className="font-semibold" />
                            </div>
                        </div>
                    </div>
                    <div className="w-[437px] flex-grow p-6">
                        <div className="rounded-md border bg-gray-100 p-4">
                            <p className="font-semibold">Select payment method</p>
                            <div className="mt-4">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2Icon className="text-green-700" />
                                    <p>Pay with cash</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6">
                            <Button
                                className="w-full"
                                onClick={() => {
                                    router.post(route('cashier.tables.pay_bill', table.id));
                                }}
                            >
                                <CircleDollarSignIcon />
                                Pay now
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
