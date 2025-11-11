import { Branch } from '@/types/branch';
import { usePage } from '@inertiajs/react';

export default function Price({ amount, className }: { amount: number; className?: string }) {
    const { branch } = usePage<{ branch: Branch }>().props;

    const formatCurrency = (value: number, currency: string) => {
        try {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
            }).format(value);
        } catch {
            // Fallback if currency code is invalid or missing
            return `${value.toLocaleString()} ${currency}`;
        }
    };

    const formatted = formatCurrency(amount, branch?.currency || 'MMK');

    return <span className={className}>{formatted}</span>;
}
