<?php

namespace App\Console\Commands;

use App\Models\Branch;
use App\Models\Language;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class CreateTenantCommand extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'tenant:create';

    /**
     * The console command description.
     */
    protected $description = 'Interactively create a tenant, a default branch, and an admin user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🏗️ Let’s create a new tenant with a default branch and admin user.');
        $this->newLine();

        // 🧠 Ask for tenant details
        $tenantName = $this->ask('Tenant name');
        $tenantDescription = $this->ask('Tenant description (optional)') ?? '';

        // 🧠 Ask for admin user details
        $adminEmail = $this->ask('Admin user email');
        $adminPassword = $this->secret('Admin user password (will be hidden)');

        // Confirm before proceeding
        $this->newLine();
        if (! $this->confirm("Proceed to create tenant '{$tenantName}' with admin '{$adminEmail}'?", true)) {
            $this->info('❌ Operation cancelled.');

            return Command::SUCCESS;
        }

        DB::beginTransaction();

        try {
            // Check for duplicates
            if (Tenant::where('name', $tenantName)->exists()) {
                $this->error("A tenant named '{$tenantName}' already exists.");

                return Command::FAILURE;
            }

            if (User::where('email', $adminEmail)->exists()) {
                $this->error("A user with email '{$adminEmail}' already exists.");

                return Command::FAILURE;
            }

            // 1️⃣ Create Tenant
            $tenant = Tenant::create([
                'name' => $tenantName,
                'description' => $tenantDescription,
            ]);

            // 2️⃣ Create Default Branch
            $branch = Branch::create([
                'name' => "{$tenantName} Main Branch",
                'email' => $adminEmail,
                'currency' => 'MMK',
                'tax' => 0,
                'tenant_id' => $tenant->id,
            ]);

            // Select english language
            $language = Language::where('code', 'en')->first();
            $branch->languages()->attach($language->id);

            // 3️⃣ Create Admin User
            $adminUser = User::create([
                'name' => 'Admin',
                'email' => $adminEmail,
                'password' => Hash::make($adminPassword),
            ]);

            // 4️⃣ Link user to tenant and branch
            $tenant->users()->attach($adminUser->id);
            $branch->users()->attach($adminUser->id);

            // 5️⃣ Assign "admin" role
            $adminRole = Role::firstOrCreate(['name' => 'admin']);
            $adminUser->assignRole($adminRole);

            DB::commit();

            $this->newLine();
            $this->info('✅ Tenant, branch, and admin user created successfully!');
            $this->line("🏢 Tenant: {$tenant->name}");
            $this->line("🏬 Branch: {$branch->name}");
            $this->line("👤 Admin: {$adminUser->email}");
            $this->line("👤 Password: {$adminPassword}");

            return Command::SUCCESS;
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error('❌ Failed to create tenant: '.$e->getMessage());

            return Command::FAILURE;
        }
    }
}
