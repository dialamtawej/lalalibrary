<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UserProfile extends Model
{
    use HasFactory;
    protected $table='user_profiles';
    protected $primaryKey = 'user_id';

    public $incrementing = false;
protected $fillable = [
        'user_id',
        'display_name',
        'bio',
    ];
    
public function user()
    {
        return $this->belongsTo(User::class);
    }
}


