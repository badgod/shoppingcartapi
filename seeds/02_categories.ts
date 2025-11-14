import { Knex } from 'knex'

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('categories').del()

    // Inserts seed entries
    await knex('categories').insert([
        {
            id: 1,
            name: 'Boards & Components',
            description: 'บอร์ดพัฒนา, ส่วนประกอบ, และ HAT ต่างๆ',
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            id: 2,
            name: 'Cases',
            description: 'เคสและกล่องสำหรับบอร์ด',
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            id: 3,
            name: 'Sensors',
            description: 'โมดูลเซ็นเซอร์สำหรับโปรเจกต์ IoT',
            created_at: new Date(),
            updated_at: new Date(),
        },
    ])
}