<?php

namespace App\Http\Controllers;

use App\Enums\SessionKeys;
use App\Http\Requests\Branch\CreateBranchRequest;
use App\Http\Requests\Branch\UpdateBranchRequest;
use App\Http\Resources\BranchResource;
use App\Http\Resources\LanguageResource;
use App\Models\Branch;
use App\Models\Language;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BranchController extends Controller
{
    public function store(CreateBranchRequest $request)
    {
        $validated = $request->validated();

        DB::beginTransaction();
        try {
            // Create branch
            $branch = Branch::create([
                'name' => $validated['name'],
                'phone' => $validated['phone'] ?? null,
                'email' => $validated['email'] ?? null,
                'address' => $validated['address'] ?? null,
                'currency' => $validated['currency'],
                'tax' => $validated['tax'] ?? 0,
                'lat' => $validated['lat'] ?? null,
                'long' => $validated['long'] ?? null,
                'radius' => $validated['radius'] ?? null,
                'intro_type' => $validated['intro_type'] ?? null,
                'tenant_id' => $validated['tenant_id'],
            ]);

            // Handle file uploads
            if ($request->hasFile('cover_image')) {
                $path = $request->file('cover_image')->store('branches/covers', 'public');
                $branch->cover_image = Storage::url($path);
            }

            if ($request->hasFile('logo_image')) {
                $path = $request->file('logo_image')->store('branches/logos', 'public');
                $branch->logo_image = Storage::url($path);
            }

            $branch->save();

            DB::commit();

            return redirect()->route('branches.index')->with('success', 'Branch created successfully.');
        } catch (\Throwable $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Failed to create branch: '.$e->getMessage()]);
        }
    }

    public function generalSetting()
    {
        $branch = Branch::where('id', session(SessionKeys::CURRENT_BRANCH_ID))->first();

        return Inertia::render('restaurant/settings/general', [
            'branch' => BranchResource::make($branch),
        ]);
    }

    public function locationSetting()
    {
        $branch = Branch::where('id', session(SessionKeys::CURRENT_BRANCH_ID))->first();

        return Inertia::render('restaurant/settings/location', [
            'branch' => BranchResource::make($branch),
        ]);
    }

    public function vatCurrencyLanguageSetting()
    {
        $branch = Branch::with('languages')->where('id', session(SessionKeys::CURRENT_BRANCH_ID))->first();

        return Inertia::render('restaurant/settings/tax_currency_language', [
            'branch' => BranchResource::make($branch),
            'languages' => LanguageResource::collection(Language::all()),
        ]);
    }

    public function updateGeneral(UpdateBranchRequest $request)
    {
        $id = session(SessionKeys::CURRENT_BRANCH_ID);
        $validated = $request->validated();
        $branch = Branch::findOrFail($id);

        DB::beginTransaction();
        try {
            $branch->fill([
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'email' => $validated['email'],
                'address' => $validated['address'],
            ]);

            // Replace cover image if provided
            if ($request->hasFile('cover_image')) {
                if ($branch->cover_image) {
                    Storage::disk('public')->delete($branch->cover_image);
                }
                $branch->cover_image = Storage::url($request->file('cover_image')->store('branches/covers', 'public'));
            }

            // Replace logo image if provided
            if ($request->hasFile('logo_image')) {
                if ($branch->logo_image) {
                    Storage::disk('public')->delete($branch->logo_image);
                }
                $branch->logo_image = Storage::url($request->file('logo_image')->store('branches/logos', 'public'));
            }

            $branch->save();

            DB::commit();

            return redirect()->route('restaurant_setting.general')->with('success', 'General settings updated successfully.');
        } catch (\Throwable $e) {
            DB::rollBack();

            return back()->withErrors(['error' => 'Failed to update branch: '.$e->getMessage()]);
        }
    }

    public function updateLocation(UpdateBranchRequest $request)
    {
        $id = session(SessionKeys::CURRENT_BRANCH_ID);
        $validated = $request->validated();
        $branch = Branch::findOrFail($id);

        $branch->update([
            'lat' => $validated['lat'],
            'long' => $validated['long'],
            'radius' => $validated['radius'],
        ]);

        return redirect()
            ->back()
            ->with('success', 'Restaurant location updated successfully.');
    }

    public function updateVatCurrencyLanguageSetting(UpdateBranchRequest $request)
    {
        $validated = $request->validated();
        $branch = $request->user()->currentBranch();

        $branch->update([
            'tax' => $validated['tax'],
            'currency' => $validated['currency'],
        ]);

        // Sync languages
        if ($request->has('languages')) {
            $branch->languages()->sync($request->languages);
        }

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }
}
