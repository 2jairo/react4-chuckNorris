import { Pool } from 'pg'
import { User } from 'types/user'
import fp from 'fastify-plugin'

export const GENERAL_GROUP_ID = 1
export const ROOT_ID =1

export class Postgres {
    constructor(private pool: Pool) {}

    // users
    async getUserByUsername(username: string) {
        const res = await this.pool.query<User>(
            'SELECT id, username, password FROM users WHERE username = $1', 
            [username]
        )
        return res.rows.length ? res.rows[0] : null
    }

    async getUserById(id: number) {
        const res = await this.pool.query<User>(
            'SELECT id, username, password FROM users WHERE id = $1', 
            [id]
        )
        return res.rows.length ? res.rows[0] : null
    }

    async createUser(username: string, passwordHash: string) {
        const res = await this.pool.query<User>(
            'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username, password',
            [username, passwordHash]
        )
        return res.rows[0]
    }
}



declare module "fastify" {
    interface FastifyInstance {
        pg: Postgres,
    }
}

export const pgDbPlugin = fp(async (fastify) => {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL!,
    })
    await pool.connect()


    fastify.decorate('pg', new Postgres(pool))
})