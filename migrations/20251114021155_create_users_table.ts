import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('users', function (table) {
        table.increments('id').primary()
        table.string('firstname').notNullable()
        table.string('lastname').notNullable()
        table.string('email').notNullable().unique()
        table.string('password').notNullable()
        table.string('avatar').nullable()
        table.string('address').nullable()
        table.string('phone').nullable()
        table.string('role').notNullable().defaultTo('customer')
        table.timestamps(true, true)
    })
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('users')
}