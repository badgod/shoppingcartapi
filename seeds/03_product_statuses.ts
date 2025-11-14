import { Knex } from 'knex'

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('product_statuses').del()

    // Inserts seed entries
    await knex('product_statuses').insert([
        {
            id: 1, 
            name: 'Published', // สถานะ "เผยแพร่"
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            id: 2,
            name: 'Draft', // สถานะ "แบบร่าง"
            created_at: new Date(),
            updated_at: new Date()
        },
        {
            id: 3,
            name: 'Out of Stock', // สถานะ "ของหมด"
            created_at: new Date(),
            updated_at: new Date()
        },
    ])
}