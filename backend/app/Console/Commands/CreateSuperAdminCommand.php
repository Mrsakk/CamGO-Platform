<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Spatie\Permission\Models\Role;

class CreateSuperAdminCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-super-admin
                            {--email= : The email address for the super admin}
                            {--name= : The full name for the super admin}
                            {--password= : The initial password (prompted securely if omitted)}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Provision or update a Super Admin account securely without hard-coded credentials';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = $this->option('email') ?: $this->ask('Enter Super Admin Email');
        $name = $this->option('name') ?: $this->ask('Enter Super Admin Name', 'Super Admin');
        $password = $this->option('password') ?: $this->secret('Enter Super Admin Password');

        $validator = Validator::make([
            'email' => $email,
            'name' => $name,
            'password' => $password,
        ], [
            'email' => ['required', 'string', 'email', 'max:255'],
            'name' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }
            return self::FAILURE;
        }

        Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);

        $user = User::where('email', $email)->first();

        if ($user) {
            $user->update([
                'name' => $name,
                'password' => Hash::make($password),
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
            $this->info("Existing user [{$email}] upgraded/updated with Super Admin role.");
        } else {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make($password),
                'is_active' => true,
                'email_verified_at' => now(),
            ]);
            $this->info("New Super Admin [{$email}] successfully created.");
        }

        if (! $user->hasRole('Super Admin')) {
            $user->assignRole('Super Admin');
        }

        return self::SUCCESS;
    }
}
