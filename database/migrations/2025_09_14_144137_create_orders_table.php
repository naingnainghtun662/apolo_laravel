<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();

            $table->bigInteger('order_number')->nullable();

            // Relations
            $table->foreignId('branch_id')
                ->constrained('branches')
                ->onDelete('cascade');

            $table->foreignId('user_id') // cashier who created the order (nullable for customer orders)
                ->nullable()
                ->constrained('users')
                ->onDelete('cascade');

            $table->foreignId('table_id') // only for dine-in
                ->nullable()
                ->constrained('tables')
                ->onDelete('cascade');

            // Order source (who placed it)
            $table->enum('order_source', ['customer', 'cashier'])->default('customer');

            // Order type
            $table->enum('order_type', ['dine_in', 'take_out', 'delivery'])->default('dine_in');

            $table->enum('status', [
                'pending',
                'confirmed',
                'preparing',
                'ready',
                'completed',
                'served',
                'cancelled',
            ])->default('pending');

            $table->timestamp('paid_at')->nullable();
            $table->integer('quantity')->default(0);
            // Customer environment
            $table->string('customer_ip')->nullable();
            $table->string('customer_user_agent')->nullable();
            $table->decimal('vat_rate', 5, 2)->default(0);

            // Optional location
            $table->float('lat')->nullable();
            $table->float('long')->nullable();
            $table->text('notes')->nullable();
            $table->decimal('subtotal', 10, 2)->default(0);  // sum of all order items before discount/tax
            $table->decimal('discount', 10, 2)->default(0);  // any discount applied
            $table->decimal('tax', 10, 2)->default(0);       // TAX or other taxes
            $table->decimal('total', 10, 2)->default(0);     // final amount after discount + tax

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
