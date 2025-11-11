import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    MultiSelect,
    MultiSelectContent,
    MultiSelectGroup,
    MultiSelectItem,
    MultiSelectTrigger,
    MultiSelectValue,
} from '@/components/ui/multi-select';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Branch, Language } from '@/types/branch';
import { router } from '@inertiajs/react';
import { Controller, useForm } from 'react-hook-form';

type FinanceForm = {
    tax: number;
    currency: string;
    languages: string[];
};

export default function RestaurantTaxCurrencyLanguageSettings({ branch, languages }: { branch: Branch; languages: Language[] }) {
    console.log({ branch });

    const form = useForm<FinanceForm>({
        defaultValues: {
            tax: branch.tax ?? 0,
            currency: branch.currency,
            languages: branch.languages?.map((l: Language) => l.id.toString()) ?? [],
        },
    });

    const onSubmit = (values: FinanceForm) => {
        router.patch(route('restaurant_setting.tax_currency_language.update'), values, {
            onSuccess: () => console.log('Finance settings updated'),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Tax, currency and languages Settings', href: route('restaurant_setting.tax_currency_language') }]}>
            <div className="flex justify-center p-4">
                <div className="w-full max-w-3xl rounded-md border p-6">
                    <div>
                        <p className="text-2xl font-semibold">Tax, currency and languages Settings</p>
                        <p className="mt-1.5 text-sm">Manage TAX, currency, and supported languages.</p>
                    </div>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
                        {/* TAX */}
                        <div>
                            <Label htmlFor="tax">TAX (%)</Label>
                            <Input id="tax" type="number" step="0.01" {...form.register('tax', { valueAsNumber: true })} />
                        </div>

                        {/* Currency */}
                        <div>
                            <Label htmlFor="currency">Currency</Label>
                            <Controller
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MMK">MMK</SelectItem>
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="JPY">JPY</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        {/* Languages */}
                        <div>
                            <Label htmlFor="languages">Supported Languages</Label>
                            <MultiSelect
                                defaultValues={form.getValues().languages}
                                // values={form.getValues().languages}
                                onValuesChange={(values) => form.setValue('languages', values)}
                            >
                                <MultiSelectTrigger className="w-full">
                                    <MultiSelectValue placeholder="Select languages..." />
                                </MultiSelectTrigger>
                                <MultiSelectContent>
                                    <MultiSelectGroup>
                                        {languages.map((language) => (
                                            <MultiSelectItem key={language.id} value={language.id.toString()}>
                                                {language.name}
                                            </MultiSelectItem>
                                        ))}
                                    </MultiSelectGroup>
                                </MultiSelectContent>
                            </MultiSelect>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={(e) => {
                                    e.preventDefault();
                                    form.reset();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit">Save changes</Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
