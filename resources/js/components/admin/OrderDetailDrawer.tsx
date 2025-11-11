import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { useOpenDrawerStore } from '@/store/admin/useOpenDrawer';
import { Branch } from '@/types/branch';
import { Order } from '@/types/order';
import { usePage } from '@inertiajs/react';
import { ImageOffIcon } from 'lucide-react';
import Price from '../common/Price';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';

export function OrderDetailDrawer() {
    const { order } = usePage<{
        order: Order;
        branch: Branch;
    }>().props;
    console.log(order);

    const openDrawer = useOpenDrawerStore((store) => store.openDrawer);
    const setOpenDrawer = useOpenDrawerStore((store) => store.setOpenDrawer);

    return (
        <Drawer fixed={false} open={openDrawer} direction="right" onOpenChange={setOpenDrawer}>
            <DrawerContent className="ml-auto h-full w-full overflow-scroll md:w-[60vw]">
                {order ? (
                    <div className="ml-auto overflow-x-auto md:w-[60vw]">
                        <DrawerHeader>
                            <DrawerTitle>Receipt details</DrawerTitle>
                            <DrawerDescription></DrawerDescription>
                        </DrawerHeader>
                        <div className="p-4">
                            <div>
                                <div className="flex items-center">
                                    <span className="w-[100px] text-sm text-muted-foreground">Invoice</span>
                                    <span className="text-sm font-medium">{`: ${order.orderNumber}`}</span>
                                </div>
                                <div className="mt-3 flex items-center">
                                    <span className="w-[100px] text-sm text-muted-foreground">Table</span>
                                    <span className="text-sm font-medium capitalize">{`: ${order.table?.name}`}</span>
                                </div>
                                <div className="mt-3 flex items-center">
                                    <span className="w-[100px] text-sm text-muted-foreground">Date</span>
                                    <span className="text-sm font-medium">{`: ${new Date(order.createdAt).toLocaleDateString()}`}</span>
                                </div>
                            </div>

                            <div className="mt-6">
                                <Card>
                                    <Table className="border-b">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>
                                                    <span>Food item</span>
                                                </TableHead>
                                                <TableHead className="text-end">
                                                    <span>Quantity</span>
                                                </TableHead>
                                                <TableHead className="text-end">
                                                    <span>Note</span>
                                                </TableHead>
                                                <TableHead className="text-end">
                                                    <span>Unit Price</span>
                                                </TableHead>
                                                <TableHead className="text-end">
                                                    <span>Total Price</span>
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {order.items?.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {item.menuItem?.image ? (
                                                                <img
                                                                    src={item.menuItem?.image || ''}
                                                                    alt={item.menuItem?.translations[0]?.name}
                                                                    className="h-10 w-10 rounded-md object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-100">
                                                                    <ImageOffIcon size={16} className="text-muted-foreground" />
                                                                </div>
                                                            )}
                                                            <p className="text-sm font-medium">{item.menuItem?.translations[0]?.name}</p>
                                                            {item.variant?.name && <p className="text-sm font-medium">({item.variant?.name})</p>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-end">
                                                            <span className="text-sm">{item.quantity}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-end">
                                                            {item.notes ? <Badge variant={'destructive'}>{item.notes}</Badge> : <p>-</p>}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-end">
                                                            <span className="text-sm">{item.unitPrice}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-end">
                                                            <span className="text-sm">{item.totalPrice}</span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                    <div className="w-ful ml-auto w-full">
                                        <div className="flex w-full justify-end p-5">
                                            <div>
                                                <div className="flex items-center">
                                                    <p className="w-[200px] text-sm">Subtotal</p>
                                                    <Price className="w-[200px] text-end text-sm" amount={order.subtotal} />
                                                </div>
                                                <div className="mt-3 flex items-center">
                                                    <p className="w-[200px] text-sm">TAX(%)</p>
                                                    <p className="w-[200px] text-end text-sm">{order.vatRate} %</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-end p-5">
                                                <p className="w-[200px] text-sm font-medium">Grand total</p>
                                                <Price className="w-[200px] text-end text-sm font-medium" amount={order.total} />
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </div>
                ) : null}
            </DrawerContent>
        </Drawer>
    );
}
