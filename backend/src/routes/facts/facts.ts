import { FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import { RouteCommonOptions } from 'types/routesCommon'
import { ErrKind, LocalError } from 'error/error'

type CreateFactBody = { factId: string, fact: string, lang: string }

export const factsRoutes = fp((fastify, options: RouteCommonOptions) => {
	fastify.route({
		method: 'POST',
		url: `${options.prefix}/mark-as-seen`,
		preHandler: fastify.authenticate,
		handler: async (req: FastifyRequest, reply: FastifyReply) => {
			const { facts = [] } = req.body as { facts: { id: string, lang?: string }[] }

			const f = await fastify.pg.getSeenFacts(req.user.userId, facts.map(f => f.id))
			await fastify.pg.markAsSeen(req.user.userId, facts.map(f => ({ id: f.id, lang: f.lang! })))

			const grouped = new Map<string, { user_id: number; fact_id: string; lang: string[]; ts: Date }>();

			for (const row of f) {
				const key = `${row.user_id}${row.fact_id}`;
				const existing = grouped.get(key);
				if (!existing) {
					grouped.set(key, { user_id: row.user_id, fact_id: row.fact_id, lang: [row.lang], ts: row.ts });
				} else {
					if (!existing.lang.includes(row.lang)) existing.lang.push(row.lang);
					if (row.ts.getTime() > existing.ts.getTime()) existing.ts = row.ts;
				}
			}

			const response = Array.from(grouped.values());

			return reply.status(200).send({ facts: response });
		}
	})

	fastify.route({
		method: 'POST',
		url: `${options.prefix}/seen`,
		preHandler: fastify.authenticate,
		handler: async (req: FastifyRequest<{ Body: CreateFactBody }>, reply: FastifyReply) => {
			const { factId, lang } = req.body || {}

			if (!factId || !lang) {
				throw new LocalError(ErrKind.Forbidden, 400, 'factId, fact, and lang are required')
			}

			const newFact = await fastify.pg.createSeenFact(req.user.userId, factId, lang)

			return reply.status(201).send(newFact)
		}
	})
})
