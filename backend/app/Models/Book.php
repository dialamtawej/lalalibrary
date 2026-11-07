<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Storage;

class Book extends Model
{
    use HasFactory,SoftDeletes;

    protected $fillable = ['title',
                           'slug',
                           'description',
                           'file_path',
                           'cover_image',];

    /*
    ========================================================
    ADDED - مراجعة
    - $hidden: مسار ملف الـ PDF داخلي (قرص خاص)، فلا داعي لإرساله في الـ API.
      الواجهة تحتاج فقط أن تعرف هل توجد نسخة إلكترونية أم لا (has_ebook).
    - $appends: حقول محسوبة تُضاف تلقائيًا إلى JSON:
        cover_url : رابط كامل للغلاف بدل المسار النسبي books/covers/...
        has_ebook : true إذا كان للكتاب ملف إلكتروني
    المفهوم: Eloquent Accessors (Attribute::make) + $appends + $hidden
    ========================================================
    */
    protected $hidden = ['file_path'];

    protected $appends = ['cover_url', 'has_ebook'];

    protected function coverUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->cover_image ? Storage::disk('public')->url($this->cover_image) : null,
        );
    }

    protected function hasEbook(): Attribute
    {
        return Attribute::make(get: fn () => !empty($this->file_path));
    }

    public function categories(){
        return $this->belongsToMany(Category::class,'book_categories','book_id','category_id');
    }
}
