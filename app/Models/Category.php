<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    protected $fillable = [
        'parent_id',
        'name',
        'slug',
        'description',
        'status',
    ];

    /*
    ========================================================
    ADDED - العلاقات (مراجعة)
    جدول categories فيه parent_id (تصنيف رئيسي/فرعي) وجدول وسيط
    book_categories، لكن الموديل لم يكن يعرّف أي علاقة.
    ========================================================
    */
    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function books()
    {
        return $this->belongsToMany(Book::class, 'book_categories', 'category_id', 'book_id');
    }
}
