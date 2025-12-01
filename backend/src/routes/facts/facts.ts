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

			return reply.status(200).send({ facts: f })
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
