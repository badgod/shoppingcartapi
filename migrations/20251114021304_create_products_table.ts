import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('products', function (table) {
        table.increments('id').primary()
        table.string('name').notNullable()
        table.text('description').nullable()
        table.string('barcode').notNullable()
        table.string('image').nullable()
        table.integer('stock').notNullable()
        table.integer('price').notNullable()
        table.timestamps(true, true)

        // --- Foreign Keys ---
        table.integer('category_id').unsigned().nullable()
        table.foreign('category_id').references('id').inTable('categories').onDelete('SET NULL')

        table.integer('user_id').unsigned().nullable()
        table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL')

        table.integer('status_id').unsigned().nullable()
        table.foreign('status_id').references('id').inTable('product_statuses').onDelete('SET NULL')
    })
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('products')
}