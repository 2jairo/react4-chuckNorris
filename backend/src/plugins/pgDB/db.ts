import { Pool } from 'pg'
import { User } from 'types/user'
import fp from 'fastify-plugin'
import { Fact } from 'types/facts'

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

    // facts
    async getSeenFacts(userId: number, limit: number, offset: number) {
        const res = await this.pool.query<Fact>(
            'SELECT id, user_id, fact_id, fact, lang, ts FROM facts WHERE user_id = $1 ORDER BY ts DESC LIMIT $2 OFFSET $3',
            [userId, limit, offset]
        )
        return res.rows
    }

    async getSeenFactsCount(userId: number) {
        const res = await this.pool.query<{ count: string }>(
            'SELECT COUNT(*) as count FROM facts WHERE user_id = $1',
            [userId]
        )
        return parseInt(res.rows[0].count)
    }

    async createSeenFact(userId: number, factId: string, fact: string, lang: string) {
        const res = await this.pool.query<Fact>(
            'INSERT INTO facts (user_id, fact_id, fact, lang) VALUES ($1, $2, $3, $4) RETURNING id, user_id, fact_id, fact, lang, ts',
            [userId, factId, fact, lang]
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