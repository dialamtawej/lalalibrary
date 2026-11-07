<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * ========================================================
     * ملاحظة مراجعة (لم يُحتفظ بالكود السابق داخل تعليق عمدًا):
     * النسخة السابقة كانت تحتوي كلمات مرور ثابتة لحسابات ببريد gmail حقيقي
     * الشكل، داخل مستودع عام. التغييرات:
     *  - بريد تجريبي بنطاق example.com (نطاق محجوز للأمثلة ولا يصل لأي شخص).
     *  - كلمة المرور من .env عبر SEED_USER_PASSWORD (الافتراضي "password"
     *    وهو نفس افتراضي UserFactory في Laravel، للتطوير المحلي فقط).
     *  - لا تُنشأ هذه الحسابات التجريبية إلا في بيئة local أو testing.
     * ========================================================
     */
    public function run(): void
    {
        if (!app()->environment(['local', 'testing'])) {
            return;
        }

        $password = Hash::make(env('SEED_USER_PASSWORD', 'password'));

        User::create(['name'=>'sdra',
                       'email'=>'sdra@example.com',
                       'password'=>$password,
                       'ban_info'=>['is_banned'=>false,
                       'ban_until'=>null]]);
        User::create(['name'=>'dalaa',
                       'email'=>'dalaa@example.com',
                       'password'=>$password,
                       'ban_info'=>['is_banned'=>false,
                       'ban_until'=>null]]);
    }
}
