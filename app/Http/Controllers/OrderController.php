<?php

namespace App\Http\Controllers;

use App\Enums\OrderItemStatus;
use App\Enums\OrderStatus;
use App\Enums\SessionKeys;
use App\Events\OrderCreatedEvent;
use App\Http\Requests\StoreOrderByCashierRequest;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderStatusRequest;
use App\Http\Resources\BranchResource;
use App\Http\Resources\OrderResource;
use App\Http\Resources\TableResource;
use App\Models\Branch;
use App\Models\MenuItem;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Table;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Store a new customer order
     */
    public function store(StoreOrderRequest $request)
    {
        $validated = $request->validated();

        $table = Table::with('branch')
            ->where('public_token', $validated['tablePublicToken'])
            ->firstOrFail();
        $branch = $table->branch;

        // 0 radius means location off
        if ($branch->lat && $branch->long && $branch->radius && $branch->radius > 0) {
            $userLat = $validated['lat'] ?? null;
            $userLong = $validated['long'] ?? null;

            if (! $userLat || ! $userLong) {
                throw ValidationException::withMessages([
                    'location' => 'We could not detect your location. Please enable location access to order.',
                ]);
            }

            $distance = $this->calculateDistance(
                $branch->lat,
                $branch->long,
                $userLat,
                $userLong
            );

            if ($distance > $branch->radius) {
                throw ValidationException::withMessages([
                    'location' => 'You are too far from the restaurant to place an order.',
                ]);
            }
        }

        foreach ($validated['items'] as $itemData) {
            $menuItem = MenuItem::findOrFail($itemData['menuItemId']);
            if ($menuItem->out_of_stock) {
                throw ValidationException::withMessages([
                    'items' => ["{$menuItem->translations()->first()->name} is out of stock."],
                ]);
            }
            if ($itemData['quantity'] <= 0) {
                throw ValidationException::withMessages([
                    'items' => ["Quantity for {$menuItem->translations()->first()->name} must be at least 1."],
                ]);
            }
        }

        return DB::transaction(function () use ($validated, $table) {
            $subtotal = 0;
            $totalQuantity = 0;

            foreach ($validated['items'] as $itemData) {
                $menuItem = MenuItem::findOrFail($itemData['menuItemId']);
                $price = $menuItem->variants()
                    ->where('id', $itemData['variantId'] ?? null)
                    ->value('price') ?? $menuItem->price ?? 0;

                $subtotal += $price * $itemData['quantity'];
                $totalQuantity += $itemData['quantity'];
            }

            $discount = $validated['discount'] ?? 0;

            // store the TAX rate used right now
            $vatRate = Branch::findOrFail($validated['branchId'])->tax ?? 0;

            // compute tax and totals (round to 2 decimals)
            $tax = round(($subtotal - $discount) * ($vatRate / 100), 2);
            $total = round($subtotal - $discount + $tax, 2);

            $order = Order::create([
                'branch_id' => $validated['branchId'],
                'table_id' => $table->id ?? null,
                'user_id' => request()->user()?->id,
                'customer_ip' => request()->ip(),
                'customer_user_agent' => request()->header('User-Agent'),
                'lat' => $validated['lat'] ?? null,
                'long' => $validated['long'] ?? null,
                'notes' => $validated['notes'] ?? null,
                'status' => 'pending',
                'subtotal' => round($subtotal, 2),
                'discount' => round($discount, 2),
                'tax' => $tax,              // store the tax amount
                'vat_rate' => $vatRate,     // store the rate used
                'total' => $total,
                'quantity' => $totalQuantity,
            ]);

            foreach ($validated['items'] as $itemData) {
                $menuItem = MenuItem::findOrFail($itemData['menuItemId']);
                $price = $menuItem->variants()
                    ->where('id', $itemData['variantId'] ?? null)
                    ->value('price') ?? $menuItem->price ?? 0;

                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $menuItem->id,
                    'variant_id' => $itemData['variantId'] ?? null,
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $price,
                    'total_price' => $price * $itemData['quantity'],
                    'notes' => $itemData['notes'] ?? null,
                    'status' => 'pending',
                ]);
            }

            OrderCreatedEvent::dispatch($order);

            return redirect()->route('order.active', [
                'tenant_id' => $table->branch->tenant_id,
                'branch_id' => $validated['branchId'],
                'table_public_token' => $table->public_token,
            ])->with('success', 'Order created successfully.');
        });
    }

    private function calculateDistance($lat1, $lng1, $lat2, $lng2)
    {
        $earthRadius = 6371000; // meters
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLng / 2) * sin($dLng / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c; // in meters
    }

    /**
     * Store a new customer order by cashier
     */
    public function storeByCashier(StoreOrderByCashierRequest $request)
    {

        $validated = $request->validated();

        foreach ($validated['items'] as $itemData) {
            $menuItem = MenuItem::findOrFail($itemData['menuItemId']);
            if ($menuItem->out_of_stock) {
                throw ValidationException::withMessages([
                    'items' => ["{$menuItem->translations()->first()->name} is out of stock."],
                ]);
            }
            if ($itemData['quantity'] <= 0) {
                throw ValidationException::withMessages([
                    'items' => ["Quantity for {$menuItem->translations()->first()->name} must be at least 1."],
                ]);
            }
        }

        return DB::transaction(function () use ($validated) {
            $subtotal = 0;
            $totalQuantity = 0;

            foreach ($validated['items'] as $itemData) {
                $menuItem = MenuItem::findOrFail($itemData['menuItemId']);
                $price = $menuItem->variants()
                    ->where('id', $itemData['variantId'] ?? null)
                    ->value('price') ?? $menuItem->price ?? 0;

                $subtotal += $price * $itemData['quantity'];
                $totalQuantity += $itemData['quantity'];
            }

            $discount = $validated['discount'] ?? 0;

            // store the TAX rate used right now
            $vatRate = Branch::findOrFail(session(SessionKeys::CURRENT_BRANCH_ID))->tax ?? 0;

            // compute tax and totals (round to 2 decimals)
            $tax = round(($subtotal - $discount) * ($vatRate / 100), 2);
            $total = round($subtotal - $discount + $tax, 2);

            $order = Order::create([
                'branch_id' => session(SessionKeys::CURRENT_BRANCH_ID),
                'table_id' => $validated['tableId'] ?? null,
                'user_id' => request()->user()?->id,
                'customer_ip' => request()->ip(),
                'customer_user_agent' => request()->header('User-Agent'),
                'notes' => $validated['notes'] ?? null,
                'subtotal' => round($subtotal, 2),
                'discount' => round($discount, 2),
                'tax' => $tax,              // store the tax amount
                'vat_rate' => $vatRate,     // store the rate used
                'total' => $total,
                'quantity' => $totalQuantity,
                'order_type' => $validated['orderType'],
            ]);

            foreach ($validated['items'] as $itemData) {
                $menuItem = MenuItem::findOrFail($itemData['menuItemId']);
                $price = $menuItem->variants()
                    ->where('id', $itemData['variantId'] ?? null)
                    ->value('price') ?? $menuItem->price ?? 0;

                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $menuItem->id,
                    'variant_id' => $itemData['variantId'] ?? null,
                    'quantity' => $itemData['quantity'],
                    'unit_price' => $price,
                    'total_price' => $price * $itemData['quantity'],
                    'notes' => $itemData['notes'] ?? null,
                    'status' => 'pending',
                ]);
            }

            OrderCreatedEvent::dispatch($order);

            return redirect()->back()->with('success', 'Order created successfully.');
        });
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order)
    {
        $validated = $request->validated();

        DB::transaction(function () use ($order, $validated) {
            // Update order items
            foreach ($validated['items'] as $itemData) {
                $orderItem = OrderItem::where('order_id', $order->id)
                    ->findOrFail($itemData['id']);
                $orderItem->update([
                    'status' => $itemData['status'],
                ]);
            }

            // Determine order status automatically if not explicitly set
            if (! isset($validated['status'])) {
                $statuses = $order->items()->pluck('status');

                if ($statuses->every(fn ($s) => $s === OrderItemStatus::Completed->value)) {
                    $order->status = OrderStatus::Completed->value;
                } elseif ($statuses->contains(OrderItemStatus::InProgress->value)) {
                    $order->status = OrderStatus::InProgress->value;
                } elseif ($statuses->contains(OrderItemStatus::Pending->value)) {
                    $order->status = OrderStatus::Pending->value;
                } elseif ($statuses->contains(OrderItemStatus::Cancelled->value) && $statuses->every(fn ($s) => $s === OrderItemStatus::Cancelled->value)) {
                    $order->status = OrderStatus::Cancelled->value;
                }
            } else {
                $order->status = $validated['status'];
            }

            $order->save();
        });

        return back()->with('success', 'Order status updated successfully.');
    }

    public function show(string $order_number)
    {

        $order = Order::with([
            'items.menuItem.translations',
            'items.menuItem.variants',
            'items.menuItem.badges',
            'table',
        ])
            ->whereIn('status', [OrderStatus::Pending->value, OrderStatus::InProgress->value])
            ->where('order_number', $order_number)
            ->latest()
            ->firstOrFail();

        $branch = Branch::findOrFail($order->branch_id);

        return Inertia::render('branch/order/show', [
            'table' => TableResource::make($order->table),
            'order' => OrderResource::make($order),
            'branch' => BranchResource::make($branch),
        ]);
    }

    public function cancel(int $order_id)
    {
        Order::findOrFail($order_id)->update([
            'status' => OrderStatus::Cancelled->value,
        ]);

        return back()->with('success', 'Order cancelled successfully.');
    }

    /**
     * Show today's active orders for the kitchen
     */
    public function todayActive(int $branchId)
    {
        $orders = Order::with([
            'items.menuItem.translations',
            'items.menuItem.variants',
        ])
            ->where('branch_id', $branchId)
            ->whereDate('created_at', now()->toDateString())
            ->whereIn('status', [
                OrderStatus::Pending->value,
                OrderStatus::InProgress->value,
            ])
            ->orderBy('created_at', 'asc')
            ->get();

        return Inertia::render('kitchen/orders', [
            'orders' => OrderResource::collection($orders),
            'branchId' => $branchId,
        ]);
    }

    /**
     * Get all active orders for a table by its public token
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getActiveOrdersByTable(string $tenant_id, string $branch_id, string $table_public_token)
    {
        // Load table and branch
        $table = Table::with('branch')
            ->where('branch_id', $branch_id)
            ->where('public_token', $table_public_token)
            ->firstOrFail();

        // Load active orders for this table
        $activeOrders = Order::with('items.menuItem.translations', 'items.menuItem.variants', 'items.menuItem.badges') // eager load relations
            ->where('table_id', $table->id)
            ->whereNotIn('status', [OrderStatus::Completed]) // active statuses
            ->get();

        // Calculate aggregated totals
        $totals = [
            'subtotal' => $activeOrders->sum('subtotal'),
            'discount' => $activeOrders->sum('discount'),
            'tax' => $activeOrders->sum('tax'),
            'total' => $activeOrders->sum('total'),
        ];

        return Inertia::render('branch/table/orders', [
            'orders' => OrderResource::collection($activeOrders),
            'table' => TableResource::make($table),
            'branch' => BranchResource::make($table->branch),
            'totals' => $totals, // ✅ send totals to frontend
        ]);
    }
}
