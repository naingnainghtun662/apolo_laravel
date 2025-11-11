import { MenuItem } from '@/types/menu_item';
import { OrderItem as TOrderItem } from '@/types/order';
import ImageView from '../ImageView';
import Price from '../common/Price';

export default function OrderItem({ orderItem, menuItem }: { orderItem: TOrderItem; menuItem?: MenuItem; currency: string }) {
    const selectedVariant = menuItem?.variants.find((variant) => variant.id === orderItem.variantId);

    return (
        <div className="flex items-start gap-2 border-b py-3">
            <ImageView className="h-[96px] w-[96px] rounded-lg" src={menuItem?.image || ''} alt={menuItem?.translations[0].name || ''} />
            <div className="flex h-full min-h-[96px] flex-grow flex-col justify-between self-baseline">
                <div>
                    <span className="text-lg font-bold">{`${menuItem?.translations[0].name}`}</span>
                    {selectedVariant && selectedVariant.name && <span className="font-bold">{` (${selectedVariant.name})`}</span>}
                </div>
                <div className="">
                    <div className="mt-2 flex items-center justify-between">
                        <p className="text-sm font-medium text-muted-foreground">x{orderItem.quantity}</p>
                        <Price className="font-semibold" amount={orderItem.totalPrice} />
                    </div>
                    {orderItem.notes && (
                        <p className="text-sm text-red-500">
                            <span>Note: </span>
                            <span>{orderItem.notes}</span>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
