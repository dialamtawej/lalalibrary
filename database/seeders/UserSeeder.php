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
     */
    public function run(): void
    {
        User::create(['name'=>'sdra',
                       'email'=>'sdra@gmail.com',
                       'password'=>Hash::make('sdra123456'),
                      // 'role_id'=>2,
                       'ban_info'=>['is_banned'=>false,
                       'ban_until'=>null]]);
        User::create(['name'=>'dalaa',
                       'email'=>'dalaa@gmail.com',
                       'password'=>Hash::make('dalaa123456'),
                     //  'role_id'=>2,
                       'ban_info'=>['is_banned'=>false,
                       'ban_until'=>null]]);               
    }
}
