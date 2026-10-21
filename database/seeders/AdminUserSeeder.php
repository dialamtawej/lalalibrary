<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
     User::create(['name'=> 'Admin Diala',
                    'email'=> 'diala@gmail.com',
                    'password'=>Hash::make('dede123456'),
                    'ban_info'=>['is_banned'=>false,
                    'ban_until'=>null],]);
    }
}
