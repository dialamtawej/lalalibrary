<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        /*
        ========================================================
        PREVIOUS IMPLEMENTATION - KEPT FOR REVIEW
        سبب التعديل: "Test User" كان يُنشأ بعد UserRoleSeeder فيبقى بلا دور.
        نقلناه قبله، ولا يُنشأ إلا في بيئة التطوير (local/testing).
        ========================================================
        */
        // $this->call([RoleSeeder::class,AdminUserSeeder::class,
        // UserSeeder::class,UserRoleSeeder::class,CategorySeeder::class,]);
        //
        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);
        /*
        ========================================================
        UPDATED IMPLEMENTATION
        ========================================================
        */
        $this->call([RoleSeeder::class,AdminUserSeeder::class,UserSeeder::class]);

        if (app()->environment(['local', 'testing'])) {
            User::factory()->create([
                'name' => 'Test User',
                'email' => 'test@example.com',
                'ban_info' => ['is_banned' => false, 'ban_until' => null],
            ]);
        }

        $this->call([UserRoleSeeder::class,CategorySeeder::class,]);
    }
}
