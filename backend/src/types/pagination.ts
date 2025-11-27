import { FastifyRequest } from "fastify"

export interface Pagination {
    limit: number
    offset: number
}

export const getPagination = (req: FastifyRequest, defaultLimit: number) => {
    const { limit, offset } = req.query as any
    
    const limitNum = Number(limit)
    const offsetNum = Number(offset)

    return {
        limit: Math.floor(Number.isNaN(limitNum) ? defaultLimit : limitNum),
        offset: Math.floor(Number.isNaN(offsetNum) ? 0 : offsetNum)
    }
}