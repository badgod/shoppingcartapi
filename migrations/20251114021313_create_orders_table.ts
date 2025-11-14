// ..._create_orders_table.ts
import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('orders', function (table) {
        table.increments('id').primary()
        table.decimal('total_price', 10, 2).notNullable()
        table.string('status').notNullable().defaultTo('pending')
        table.string('shipping_address').nullable()
        table.timestamps(true, true)

        // --- Foreign Key ---
        table.integer('user_id').unsigned().notNullable()
        table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE')
    })
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('orders')
}