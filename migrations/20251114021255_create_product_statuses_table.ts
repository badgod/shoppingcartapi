import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('product_statuses', function (table) {
        table.increments('id').primary()
        table.string('name').notNullable().unique()
        table.timestamps(true, true)
    })
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('product_statuses')
}