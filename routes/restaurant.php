<?php

use App\Http\Controllers\BranchController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified', 'role:admin'])
    ->prefix('admin/restaurant/settings')->group(function () {
        Route::get('general', [BranchController::class, 'generalSetting'])->name('restaurant_setting.general');
        Route::get('location', [BranchController::class, 'locationSetting'])->name('restaurant_setting.location');
        Route::get('tax_currency_language', [BranchController::class, 'vatCurrencyLanguageSetting'])->name('restaurant_setting.tax_currency_language');
        // post method for image upload
        Route::post('general/update', [BranchController::class, 'updateGeneral'])->name('restaurant_setting.general.update');
        Route::patch('location/update', [BranchController::class, 'updateLocation'])->name('restaurant_setting.location.update');
        Route::patch('vat_currency_language/update', [BranchController::class, 'updateVatCurrencyLanguageSetting'])->name('restaurant_setting.tax_currency_language.update');
    });
