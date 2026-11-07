<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;
use App\Models\Role;
use App\Models\UserRole;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
  
    use HasFactory, Notifiable,HasApiTokens,SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'image',
        'ban_info',
    ];



    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /*
    ========================================================
    ADDED - مراجعة: رابط كامل للصورة الشخصية (image_url)
    العمود image يحفظ مسارًا نسبيًا مثل profiles/abc.jpg، والواجهة تحتاج رابطًا كاملًا.
    ========================================================
    */
    protected $appends = ['image_url'];

    protected function imageUrl(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            get: fn () => $this->image ? \Illuminate\Support\Facades\Storage::disk('public')->url($this->image) : null,
        );
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'deleted_at' => 'datetime',
            'ban_info'=>'array',
        ];
    }
    public function profile()
    {
        return $this->hasOne(UserProfile::class, 'user_id');
    }
    public function roles(){
        return $this->belongsToMany(Role::class,'user_roles','user_id','role_id')->
        using(UserRole::class)->
        withPivot(['assigned_at']);
    }
}
