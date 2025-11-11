import { MenuItem } from '@/types/menu_item';
import { twMerge } from 'tailwind-merge';

export default function ItemPrices({ variants, currency, className }: { variants: MenuItem['variants']; currency: string; className?: string }) {
    if (!variants || variants.length === 0) {
        return null;
    }

    const prices = variants.map((v) => parseFloat(v.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    const formatCurrency = (value: number, currency: string) => {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }).format(value);
        } catch {
            // Fallback if currency code invalid
            return `${value.toLocaleString()} ${currency}`;
        }
    };

    const formattedMin = formatCurrency(minPrice, currency);
    const formattedMax = formatCurrency(maxPrice, currency);

    const priceDisplay = minPrice === maxPrice ? formattedMin : `${formattedMin} - ${formattedMax}`;

    return (
        <div>
            <p className={twMerge('text-lg font-bold', className)}>{priceDisplay}</p>
        </div>
    );
}
