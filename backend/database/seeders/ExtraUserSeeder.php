<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ExtraUserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            ['name' => 'John Doe', 'email' => 'john@example.com', 'phone' => '+919908440688'],
            ['name' => 'Jane Smith', 'email' => 'jane@example.com', 'phone' => '+14155238886'],
            ['name' => 'Michael Ross', 'email' => 'michael@example.com', 'phone' => '+918888888888'],
            ['name' => 'Harvey Specter', 'email' => 'harvey@example.com', 'phone' => '+917777777777'],
            ['name' => 'Rachel Zane', 'email' => 'rachel@example.com', 'phone' => '+916666666666'],
            ['name' => 'Donna Paulsen', 'email' => 'donna@example.com', 'phone' => '+915555555555'],
            ['name' => 'Louis Litt', 'email' => 'louis@example.com', 'phone' => '+914444444444'],
        ];

        foreach ($users as $u) {
            User::updateOrCreate(['email' => $u['email']], [
                'name' => $u['name'],
                'phone' => $u['phone'],
                'password' => Hash::make('password'),
                'role' => 'user',
            ]);
        }

        // Add 10 more random users
        for ($i = 21; $i <= 30; $i++) {
            User::create([
                'name' => "Customer $i",
                'email' => "customer$i@example.com",
                'phone' => '+9190000000' . $i,
                'password' => Hash::make('password'),
                'role' => 'user',
            ]);
        }
    }
}
