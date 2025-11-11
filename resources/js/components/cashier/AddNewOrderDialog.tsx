import { orderTypes } from '@/lib/utils';
import { useCashierOrderItemStore } from '@/store/cashier/useCashierOrderItemsStore';
import { Branch } from '@/types/branch';
import { MenuCategory } from '@/types/category';
import { MenuItem, MenuItemVariant } from '@/types/menu_item';
import { Order } from '@/types/order';
import { Table } from '@/types/table';
import { router, usePage } from '@inertiajs/react';
import { DialogTitle } from '@radix-ui/react-dialog';
import dayjs from 'dayjs';
import { ImageOffIcon, Minus, Plus, PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import Price from '../common/Price';
import ItemBadges from '../menu_item/ItemBadges';
import ItemPrices from '../menu_item/ItemPrices';
import ItemVariantsSelect from '../menu_item/ItemVariantsSelect';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import AddedOrderItems from './AddedOrderItems';

export default function AddNewOrderDialog() {
    const {
        filters,
        tableOrders,
        table,
        categories = [],
        menuItems = [],
        category,
        flash,
        branch,
    } = usePage<{
        filters: {
            table: string;
            categoryId: string;
        };
        tableOrders: Order[];
        table: Table;
        branch: Branch;
        categories: MenuCategory[];
        category: MenuCategory;
        menuItems: MenuItem[];
        flash: Record<string, string>;
    }>().props;
    const [open, setOpen] = useState(false);
    const clearOrders = useCashierOrderItemStore((store) => store.clearOrder);
    const firstOrder = tableOrders[0];

    console.log({
        filters,
        category,
        menuItems,
        categories,
    });

    useEffect(() => {
        if (categories && categories.length > 0 && !filters.categoryId) {
            router.reload({
                data: {
                    category_id: categories[0].id,
                },
                only: ['menuItems', 'category'],
            });
        }
    }, [filters.table, filters.categoryId, categories]);

    useEffect(() => {
        if (flash['success']) {
            const uniqueKey = `${branch.id}-${filters.table}`;
            clearOrders(uniqueKey);
            router.reload();
            setOpen(false);
        }
    }, [flash, branch, filters.table, clearOrders]);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full">Add new order</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[95vh] min-h-[60vh] min-w-full p-0">
                <div className="flex items-center gap-2 border-b px-6 py-4">
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
                        <p className="text-sm font-medium text-muted-foreground">
                            {dayjs(firstOrder?.createdAt).format('MMM, DD YYYY . HH:mm:ss A')}
                        </p>
                    </div>
                </div>
                <div className="mt-[-16px] flex">
                    <div className="flex-grow">
                        <div className="flex items-center gap-2 overflow-x-auto border-b px-4 py-2">
                            {categories.map((ctg) => (
                                <div key={ctg.id}>
                                    <Button
                                        variant={category?.id.toString() == ctg.id.toString() ? 'default' : 'outline'}
                                        onClick={() => {
                                            router.reload({
                                                data: {
                                                    category_id: ctg.id,
                                                },
                                                only: ['menuItems', 'category'],
                                            });
                                        }}
                                    >
                                        {ctg.name}
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <div className="h-[40vh] overflow-auto px-4 py-5">
                            <p className="py-2 font-medium">{category?.name}</p>
                            <div className="grid grid-cols-2 gap-4 py-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                                {menuItems.map((item) => (
                                    <OrderableMenuItem item={item} key={item.id} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="w-[30vw] border">
                        <AddedOrderItems />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

const OrderableMenuItem = ({ item }: { item: MenuItem }) => {
    const [notes, setNotes] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [variant, setVariant] = useState(item.variants[0].id.toString());
    const {
        branch,
        filters: { table },
    } = usePage<{
        branch: Branch;
        filters: {
            table: string;
        };
    }>().props;
    const increaseQuantity = () => {
        setQuantity(quantity + 1);
    };
    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };
    const selectedVariant = item.variants.find((v) => v.id.toString() == variant);
    const orderUniqueKey = `${branch.id}-${table}`;
    const addOrUpdateOrderItem = useCashierOrderItemStore((store) => store.addOrUpdateOrderItem);
    const [open, setOpen] = useState(false);
    const handleAddToCartClick = (menuItem: MenuItem, variant: MenuItemVariant) => {
        addOrUpdateOrderItem(orderUniqueKey, {
            menuItem: menuItem,
            quantity: quantity,
            notes: notes,
            variantId: variant.id,
            price: Number(variant.price),
        });
        setOpen(false);
        setNotes('');
        setQuantity(1);
        setVariant(item.variants[0].id.toString());
    };

    return (
        <div key={item.id}>
            <div className="relative rounded-md border">
                {item.image ? (
                    <img
                        onClick={() => {
                            setOpen(true);
                        }}
                        className="h-32 w-32 rounded-md object-cover"
                        src={item.image}
                        alt={item.translations[0]?.name}
                    />
                ) : (
                    <div
                        onClick={() => {
                            setOpen(true);
                        }}
                        className="flex h-32 w-32 items-center justify-center rounded-md"
                    >
                        <ImageOffIcon size={16} className="text-muted-foreground" />
                    </div>
                )}
                {!item.outOfStock ? (
                    <div className="absolute right-0 bottom-0 p-2">
                        <Button
                            onClick={() => {
                                if (item.variants.length == 1) {
                                    handleAddToCartClick(item, item.variants[0]);
                                } else {
                                    setOpen(true);
                                }
                            }}
                        >
                            <PlusIcon />
                        </Button>
                    </div>
                ) : (
                    <div></div>
                )}
            </div>

            <div className="mt-2">
                <p className="text-sm font-medium">{item.translations[0]?.name}</p>
                <ItemPrices variants={item.variants} currency={branch.currency} className="text-sm text-muted-foreground" />
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="p-0">
                    <DialogHeader className="border-b p-4">
                        <DialogTitle>{item.translations[0]?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="relative">
                        <div className="max-h-[80vh] overflow-y-auto p-4">
                            <div>
                                {item.image ? (
                                    <img
                                        className="h-[300px] w-[468px] rounded-t-md object-cover"
                                        src={item.image}
                                        alt={item.translations[0]?.name}
                                    />
                                ) : (
                                    <div className="flex h-[300px] w-[468px] items-center justify-center rounded-md border">
                                        <ImageOffIcon size={16} className="text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            <div className="mt-2">
                                <p>{item.translations[0]?.name}</p>
                                <p>{item.translations[0]?.description}</p>
                                <div className="mt-2 flex justify-between">
                                    <ItemBadges badges={item.badges} />
                                    <ItemPrices variants={item.variants} currency={branch.currency} className="text-sm text-muted-foreground" />
                                </div>
                            </div>
                            <div className="mt-4">
                                {item.variants.length > 1 && (
                                    <ItemVariantsSelect
                                        onChange={setVariant}
                                        name={item.translations[0]?.name}
                                        currency={branch.currency}
                                        variants={item.variants}
                                    />
                                )}
                            </div>
                            <div className="mt-6 mb-[100px]">
                                <p className="mb-2 font-semibold">Special instructions</p>
                                <Textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className={'w-full'}
                                    rows={4}
                                    placeholder="Eg. no onions, please"
                                />
                            </div>
                        </div>
                        <div className="absolute right-0 bottom-0 left-0 w-full rounded-md border bg-white p-4 shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Button disabled={item.outOfStock} onClick={decreaseQuantity}>
                                        <Minus />
                                    </Button>
                                    <span className="px-2 text-sm font-medium">{quantity}</span>
                                    <Button disabled={item.outOfStock} onClick={increaseQuantity}>
                                        <Plus />
                                    </Button>
                                </div>
                                <Button
                                    disabled={item.outOfStock}
                                    onClick={() => {
                                        if (selectedVariant) {
                                            handleAddToCartClick(item, selectedVariant);
                                        }
                                    }}
                                >
                                    <span>Add to cart</span>
                                    {selectedVariant && <Price amount={Number(selectedVariant?.price) * quantity} className="ml-2" />}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
