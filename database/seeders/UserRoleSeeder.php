<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserRoleSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('user_roles')->insert([
            [
                'user_id' => 1,
                'role_id' => 1,
                'assigned_at' => now()
            ],
            [
                'user_id' => 2,
                'role_id' => 2,
                'assigned_at' => now()
            ],
            [
                'user_id' => 3,
                'role_id' => 2,
                'assigned_at' => now()
            ],
        ]);
    }
}