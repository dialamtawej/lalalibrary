<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('roles')->insert([
            ['id' => 1, 'name' => 'Admin',
             'code' => 'admin', 'description' => 'مدير النظام', 
             'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'User', 
            'code' => 'user', 'description' => 'مستخدم عادي', 
            'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
