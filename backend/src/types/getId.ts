import { ErrKind, LocalError } from "error/error"
import { FastifyRequest } from "fastify"

export const getIdFromParams = (req: FastifyRequest,  prop: string) => {
  const value = (req.params as any)[prop]
  const valueNum = Math.floor(Number.isNaN(Number(value)) ? 0 : Number(value))
  
  if(valueNum < 0) {
    throw new LocalError(ErrKind.InvalidId, 400)
  }
  
  return valueNum
} 