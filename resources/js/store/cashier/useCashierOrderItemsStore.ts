import { MenuItem } from '@/types/menu_item';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OrderContextKey = string; // e.g. `${tenantId}-${tableId}`

export type OrderSession = {
    orderNumber: string;
    tenantId: number | string;
    tableId: number | string;
    status: 'pending' | 'placed' | 'completed' | 'cancelled';
};

export type OrderItem = {
    quantity: number;
    notes: string;
    variantId: number | string;
    menuItem: MenuItem;
    price: number;
};

type CashierOrderItemStore = {
    openMenuItemDetailModal: boolean;
    setOpenMenuItemDetailModal: (open: boolean) => void;
    menuItem: MenuItem | null;
    setMenuItem: (item: MenuItem) => void;
    orders: Record<OrderContextKey, OrderItem[]>; // ✅ scoped by tenant+table
    sessions: Record<OrderContextKey, OrderSession | undefined>;
    setOrderItems: (key: OrderContextKey, orderItems: OrderItem[]) => void;
    addOrUpdateOrderItem: (key: OrderContextKey, orderItem: OrderItem) => void;
    decreaseOrderItem: (key: OrderContextKey, orderItem: OrderItem) => void;
    removeOrderItem: (key: OrderContextKey, menuItemId: number, variantId: number | string) => void;
    clearOrder: (key: OrderContextKey) => void;
    getTotalAmount: (key: OrderContextKey) => number;
    setSession: (key: OrderContextKey, session: OrderSession) => void;
    clearSession: (key: OrderContextKey) => void;
};

export const useCashierOrderItemStore = create<CashierOrderItemStore>()(
    persist(
        (set, get) => ({
            orders: {},
            sessions: {},
            menuItem: null,
            openMenuItemDetailModal: false,
            setOpenMenuItemDetailModal: (open: boolean) => set({ openMenuItemDetailModal: open }),
            setMenuItem: (item: MenuItem) => set({ menuItem: item }),
            setOrderItems: (key, orderItems) =>
                set((state) => ({
                    orders: { ...state.orders, [key]: orderItems },
                })),

            addOrUpdateOrderItem: (key, orderItem) =>
                set((state) => {
                    const existing = state.orders[key] ?? [];

                    // Find existing item that matches menuItem.id, variantId, and notes
                    const idx = existing.findIndex(
                        (i) =>
                            i.menuItem?.id === orderItem.menuItem?.id &&
                            i.variantId === orderItem.variantId &&
                            i.notes.trim() === orderItem.notes.trim(),
                    );

                    const updated =
                        idx > -1
                            ? existing.map((i, index) =>
                                  index === idx
                                      ? {
                                            ...i,
                                            quantity: i.quantity + orderItem.quantity, // ✅ increase quantity
                                        }
                                      : i,
                              )
                            : [...existing, orderItem]; // ✅ add new item if no match

                    return { orders: { ...state.orders, [key]: updated } };
                }),

            decreaseOrderItem: (key, orderItem) =>
                set((state) => {
                    const existing = state.orders[key] ?? [];

                    const idx = existing.findIndex(
                        (i) =>
                            i.menuItem?.id === orderItem.menuItem?.id &&
                            i.variantId === orderItem.variantId &&
                            i.notes.trim() === orderItem.notes.trim(),
                    );

                    if (idx === -1) return state; // item not found

                    const currentItem = existing[idx];
                    const newQuantity = currentItem.quantity - 1;

                    const updated =
                        newQuantity > 0
                            ? existing.map((i, index) => (index === idx ? { ...i, quantity: newQuantity } : i))
                            : existing.filter((_, index) => index !== idx); // remove item if 0

                    return { orders: { ...state.orders, [key]: updated } };
                }),

            removeOrderItem: (key, menuItemId, variantId) =>
                set((state) => ({
                    orders: {
                        ...state.orders,
                        [key]: (state.orders[key] ?? []).filter((i) => i.menuItem.id !== menuItemId || i.variantId !== variantId),
                    },
                })),

            clearOrder: (key) =>
                set((state) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [key]: _, ...rest } = state.orders;
                    return { orders: rest };
                }),

            getTotalAmount: (key) => (get().orders[key] ?? []).reduce((total, item) => total + item.price * item.quantity, 0),

            setSession: (key, session) =>
                set((state) => ({
                    sessions: { ...state.sessions, [key]: session },
                })),

            clearSession: (key) =>
                set((state) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [key]: _, ...rest } = state.sessions;
                    return { sessions: rest };
                }),
        }),
        {
            name: 'multi-tenant-cashier-order-store',
        },
    ),
);
