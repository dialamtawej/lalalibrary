<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Book extends Model
{
    use HasFactory,SoftDeletes;
    
    protected $fillable = ['title',
                           'slug',
                           'description',
                           'file_path',
                           'cover_image',];

    public function categories(){
        return $this->belongsToMany(Category::class,'book_categories','book_id','category_id');
    }                       
}
