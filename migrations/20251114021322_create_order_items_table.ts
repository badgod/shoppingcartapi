// ..._create_order_items_table.ts
import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('order_items', function (table) {
        table.increments('id').primary()
        table.integer('quantity').notNullable()
        table.decimal('price', 10, 2).notNullable() // ราคาของสินค้า ณ ตอนที่กดสั่งซื้อ
        table.timestamps(true, true)

        // --- Foreign Keys ---
        // เชื่อมโยงไปยังตาราง orders (เป็นของออเดอร์ไหน)
        table.integer('order_id').unsigned().notNullable()
        table.foreign('order_id').references('id').inTable('orders').onDelete('CASCADE')

        // เชื่อมโยงไปยังตาราง products (สินค้าตัวไหน)
        table.integer('product_id').unsigned().notNullable()
        table.foreign('product_id').references('id').inTable('products').onDelete('CASCADE')
    })
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('order_items')
}