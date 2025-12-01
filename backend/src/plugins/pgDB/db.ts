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
    async getSeenFacts(userId: number, facts: string[]) {
        if(facts.length === 0) return []
        const res = await this.pool.query<Fact>(
            `
                SELECT user_id, fact_id, lang, ts 
                FROM facts WHERE user_id = $1 AND fact_id IN ('${facts.join("','")}')
                ORDER BY ts DESC
            `,
            [userId]
        )
        return res.rows
    }

    async markAsSeen(userId: number, facts: { id: string, lang: string }[]) {
        if(facts.length === 0) return

        const params: (string | number)[] = [userId]
        const values: string[] = []

        for (let i = 0; i < facts.length; i++) {
            const idx = 2 + (i * 2)
            values.push(`($1, $${idx}, $${idx + 1})`)
            params.push(facts[i].id, facts[i].lang)
        }

        await this.pool.query(
            `
            INSERT INTO facts (user_id, fact_id, lang) VALUES ${values.join(', ')}
            ON CONFLICT (user_id, fact_id) DO UPDATE SET ts = now(), lang = EXCLUDED.lang
            `,
            params
        )
    }

    async createSeenFact(userId: number, factId: string, lang: string) {
        const res = await this.pool.query<Fact>(
            'INSERT INTO facts (user_id, fact_id, lang) VALUES ($1, $2, $3, $4) RETURNING id, user_id, fact_id, lang, ts',
            [userId, factId, lang]
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