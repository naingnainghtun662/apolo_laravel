import { MenuItem as TMenuItem } from '@/types/menu_item';
import { ImageOffIcon } from 'lucide-react';
import { Badge } from '../ui/badge';
import DeleteMenuItemDialog from './DeleteMenuItemDialog';
import EditMenuitemButton from './EditMenuItemButton';

export default function MenuItem({ menuItem, currency }: { menuItem: TMenuItem; currency: string }) {
    const prices = menuItem.variants.map((v) => parseFloat(v.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const priceDisplay = prices.length === 1 ? `${minPrice} ${currency}` : `${minPrice} - ${maxPrice} ${currency}`;
    return (
        <div className="flex items-center gap-2">
            {/* drag icon */}
            <div className="flex place-content-center">{/* <GripVerticalIcon className="text-gray-400" /> */}</div>
            <div className="flex flex-grow items-start gap-4 border-b py-4">
                {/* image */}
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-gray-50">
                    {menuItem.image ? (
                        <img className="h-full w-full object-cover" src={menuItem.image} alt={menuItem.translations[0].name} />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-gray-400">
                            <ImageOffIcon />
                        </div>
                    )}
                </div>
                <div className="flex flex-grow items-center">
                    <div className="ml-5 flex-grow">
                        <p className="font-bold capitalize">{menuItem.translations[0]?.name}</p>
                        <p className="mt-2 text-gray-400">{menuItem.translations[0]?.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                            {menuItem.badges.map((badge) => (
                                <Badge key={badge.id}>{badge.name}</Badge>
                            ))}
                        </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end justify-between self-stretch">
                        <p className="text-right text-lg font-bold whitespace-nowrap">{priceDisplay}</p>
                        <div>
                            <EditMenuitemButton menuItem={menuItem} />
                            <DeleteMenuItemDialog id={menuItem.id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
