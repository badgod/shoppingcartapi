import { Knex } from 'knex'
import bcrypt from 'bcrypt'

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex('users').del()

    // Hash รหัสผ่านตัวอย่าง (เช่น '123456')
    const hashedPassword = await bcrypt.hash('123456', 10)

    // Inserts seed entries
    await knex('users').insert([
        {
            id: 1, 
            firstname: 'Admin',
            lastname: 'User',
            email: 'admin@app.com',
            password: hashedPassword,
            address: 'Bangkok Thailand',
            phone: '0999999999',
            role: 'admin', 
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            id: 2,
            firstname: 'Test',
            lastname: 'Customer',
            email: 'customer@app.com',
            password: hashedPassword,
            address: 'Nonthaburi Thailand',
            phone: '0888888888',
            role: 'customer',
            created_at: new Date(),
            updated_at: new Date(),
        },
    ])
}