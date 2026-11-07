<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Role;
use App\Models\User;

class UserRoleSeeder extends Seeder
{
    /*
    ========================================================
    PREVIOUS IMPLEMENTATION - KEPT FOR REVIEW
    سبب التعديل: الأرقام user_id = 1,2,3 و role_id = 1,2 كانت مكتوبة يدويًا.
    إذا تغير ترتيب الـ Seeders أو أُعيد إنشاء مستخدم، تذهب الأدوار لمستخدمين
    خطأ أو يفشل الإدخال. كذلك المستخدم "Test User" المنشأ في DatabaseSeeder
    لم يكن يحصل على أي دور.
    السلوك الجديد: نبحث عن الأدوار بالـ code، ونعطي admin لبريد الأدمن
    المحدد في .env، و user لكل مستخدم آخر ليس لديه أي دور.
    ========================================================
    */
    // public function run(): void
    // {
    //     DB::table('user_roles')->insert([
    //         ['user_id' => 1, 'role_id' => 1, 'assigned_at' => now()],
    //         ['user_id' => 2, 'role_id' => 2, 'assigned_at' => now()],
    //         ['user_id' => 3, 'role_id' => 2, 'assigned_at' => now()],
    //     ]);
    // }
    /*
    ========================================================
    UPDATED IMPLEMENTATION
    ========================================================
    */
    public function run(): void
    {
        $adminRole = Role::where('code', 'admin')->firstOrFail();
        $userRole  = Role::where('code', 'user')->firstOrFail();

        $admin = User::where('email', env('SEED_ADMIN_EMAIL', 'admin@lalalibrary.test'))->first();
        if ($admin) {
            $admin->roles()->syncWithoutDetaching([$adminRole->id => ['assigned_at' => now()]]);
        }

        User::doesntHave('roles')->each(function (User $user) use ($userRole) {
            $user->roles()->attach($userRole->id, ['assigned_at' => now()]);
        });
    }
}
