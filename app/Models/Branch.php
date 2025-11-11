<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Facades\Storage;

class Branch extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'address',
        'currency',
        'tax',
        'lat',
        'long',
        'radius',
        'intro_type',
        'cover_image',
        'logo_image',
        'tenant_id',
    ];

    /**
     * A branch belongs to a tenant.
     */
    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }

    /**
     * A branch can have many users
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'branch_user');
    }

    /**
     * A branch can support many languages for menu items
     */
    public function languages()
    {
        return $this->belongsToMany(Language::class, 'branch_language');
    }

    /**
     * A branch can have many menu categories
     */
    public function categories()
    {
        return $this->hasMany(MenuCategory::class);
    }

    public function getLogoImageUrlAttribute()
    {
        return $this->logo_image
            ? Storage::url($this->logo_image)
            : null;
    }

    public function getCoverImageUrlAttribute()
    {
        return $this->cover_image
            ? Storage::url($this->cover_image)
            : null;
    }

    public function tables()
    {
        return $this->hasMany(Table::class);
    }
}
