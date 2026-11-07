<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * ========================================================
     * ملاحظة مراجعة (لم يُحتفظ بالكود السابق داخل تعليق عمدًا):
     * النسخة السابقة كانت تكتب بريد الأدمن وكلمة مروره مباشرة في الكود،
     * والمستودع عام على GitHub، أي أن كلمة المرور أصبحت مكشوفة للجميع.
     * لهذا لم نُبقِ الكود القديم هنا كتعليق (كان سيُبقي كلمة المرور ظاهرة)،
     * ويمكن مراجعته عبر git diff.
     *
     * السلوك الجديد: البريد وكلمة المرور يُقرآن من ملف .env:
     *   SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD
     * إذا لم تُحدد كلمة مرور، تُولَّد كلمة عشوائية وتُطبع مرة واحدة في الطرفية.
     * ========================================================
     */
    public function run(): void
    {
        $password = env('SEED_ADMIN_PASSWORD');

        if (empty($password)) {
            $password = Str::password(16);
            $this->command?->warn("SEED_ADMIN_PASSWORD غير محددة في .env — كلمة مرور الأدمن المولدة: {$password}");
        }

        User::create(['name'=> env('SEED_ADMIN_NAME', 'Admin'),
                      'email'=> env('SEED_ADMIN_EMAIL', 'admin@lalalibrary.test'),
                      'password'=>Hash::make($password),
                      'ban_info'=>['is_banned'=>false,
                                   'ban_until'=>null],]);
    }
}
