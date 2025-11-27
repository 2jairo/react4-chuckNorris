import { FastifyReply, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import { RouteCommonOptions } from 'types/routesCommon'
import { getPagination } from 'types/pagination'
import { ErrKind, LocalError } from 'error/error'

type CreateFactBody = { factId: string, fact: string, lang: string }

export const factsRoutes = fp((fastify, options: RouteCommonOptions) => {
	fastify.route({
		method: 'GET',
		url: `${options.prefix}/seen`,
		preHandler: fastify.authenticate,
		handler: async (req: FastifyRequest, reply: FastifyReply) => {
			const { limit, offset } = getPagination(req, 50)

			const [facts, total] = await Promise.all([
				fastify.pg.getSeenFacts(req.user.userId, limit, offset),
				fastify.pg.getSeenFactsCount(req.user.userId)
			])

			return reply.status(200).send({
				facts,
				pagination: {
					limit,
					offset,
					total
				}
			})
		}
	})

	fastify.route({
		method: 'POST',
		url: `${options.prefix}/seen`,
		preHandler: fastify.authenticate,
		handler: async (req: FastifyRequest<{ Body: CreateFactBody }>, reply: FastifyReply) => {
			const { factId, fact, lang } = req.body || {}

			if (!factId || !fact || !lang) {
				throw new LocalError(ErrKind.Forbidden, 400, 'factId, fact, and lang are required')
			}

			const newFact = await fastify.pg.createSeenFact(req.user.userId, factId, fact, lang)

			return reply.status(201).send(newFact)
		}
	})
})
