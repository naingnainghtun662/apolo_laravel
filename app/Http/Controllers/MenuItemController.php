<?php

namespace App\Http\Controllers;

use App\Http\Requests\MenuItem\CreateMenuItemRequest;
use App\Http\Requests\MenuItem\UpdateMenuItemRequest;
use App\Models\Language;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class MenuItemController extends Controller
{
    public function index()
    {
        return Inertia::render('menu_item/index');
    }

    public function store(CreateMenuItemRequest $request)
    {
        $validated = $request->validated();
        DB::beginTransaction();

        try {

            // Create menu item
            $menuItem = MenuItem::create([
                'category_id' => $validated['categoryId'],
            ]);

            // Variants
            if (! empty($validated['variants'])) {
                foreach ($validated['variants'] as $variant) {
                    $menuItem->variants()->create([
                        'name' => $variant['name'],
                        'price' => $variant['price'],
                        // 'position' => $menuItem->variants()->count() + 1,
                    ]);
                }
            } elseif (! empty($validated['price'])) {
                // Single base price → create a default variant
                $menuItem->variants()->create([
                    'name' => null, // base item, no variant name
                    'price' => $validated['price'],
                    'position' => 1,
                ]);
            }

            // Translation — assume submitted language = Burmese
            $language = Language::where('code', 'en')->first();
            if ($language) {
                $menuItem->translations()->create([
                    'language_id' => $language->id,
                    'name' => $validated['name'],
                    'description' => $validated['description'] ?? null,
                ]);
            }

            // Badges
            if (! empty($validated['badges'])) {
                $menuItem->badges()->sync($validated['badges']);
            }

            DB::commit();

            // Handle image upload
            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('menu_items', 'public');
                $menuItem->image = Storage::url($imagePath);
                $menuItem->save();
            }

            return redirect()
                ->route('menu_category.show', $menuItem->category_id)
                ->with('success', 'Menu item created successfully.');
        } catch (\Throwable $e) {
            DB::rollBack();

            return redirect()
                ->back()
                ->withErrors(['error' => 'Failed to create menu item: '.$e->getMessage()]);
        }

    }

    public function update(int $id, UpdateMenuItemRequest $request)
    {
        $validated = $request->validated();

        $menuItem = MenuItem::findOrFail($id);

        DB::beginTransaction();

        try {
            // Handle image
            if ($request->hasFile('image')) {
                // remove old image if exists
                if ($menuItem->image && Storage::disk('public')->exists($menuItem->image)) {
                    Storage::disk('public')->delete($menuItem->image);
                }

                $imagePath = $request->file('image')->store('menu_items', 'public');
                $menuItem->image = Storage::url($imagePath);
                $menuItem->save();
            } elseif (is_string($validated['image'] ?? null)) {
                // If the client sends back the existing path (string), keep it as-is
                $menuItem->image = $validated['image'];
                $menuItem->save();
            }

            // Variants: delete old and recreate (simpler)
            $menuItem->variants()->delete();

            if (! empty($validated['variants'])) {
                foreach ($validated['variants'] as $index => $variant) {
                    $menuItem->variants()->create([
                        'name' => $variant['name'],
                        'price' => $variant['price'],
                        'position' => $index + 1,
                    ]);
                }
            } elseif (! empty($validated['price'])) {
                $menuItem->variants()->create([
                    'name' => null,
                    'price' => $validated['price'],
                    'position' => 1,
                ]);
            }

            // Translation — overwrite Burmese
            $burmese = Language::where('code', 'my')->first();
            if ($burmese) {
                $menuItem->translations()->updateOrCreate(
                    ['language_id' => $burmese->id],
                    [
                        'name' => $validated['name'],
                        'description' => $validated['description'] ?? null,
                    ]
                );
            }

            // Badges
            $menuItem->badges()->sync($validated['badges'] ?? []);

            DB::commit();

            return redirect()
                ->route('menu_category.show', $menuItem->category_id)
                ->with('success', 'Menu item updated successfully.');
        } catch (\Throwable $e) {
            DB::rollBack();

            return redirect()
                ->back()
                ->withErrors(['error' => 'Failed to update menu item: '.$e->getMessage()]);
        }
    }

    // delete method
    public function destroy(int $id)
    {
        $menuItem = MenuItem::findOrFail($id);
        $menuItem->delete();

        return back()->with('success', 'Menu item deleted successfully.');
    }

    public function updateOutOfStock(Request $request, MenuItem $menuItem)
    {
        $validated = $request->validate([
            'out_of_stock' => ['required', 'boolean'],
        ]);

        $menuItem->update([
            'out_of_stock' => $validated['out_of_stock'],
        ]);

        return back()->with('success', 'Updated');
    }

    public function updateMenuItemOutOfStock(Request $request, MenuItem $menuItem)
    {
        $validated = $request->validate([
            'out_of_stock' => ['required', 'boolean'],
        ]);

        $menuItem->update([
            'out_of_stock' => $validated['out_of_stock'],
        ]);

        return back()->with('success', 'Updated');
    }
}
