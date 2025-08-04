import { Router } from 'express'
import { sanitizeObservacionInput, findAll, findOne, add, update, remove } from './observacion.controller.js'

export const observacionRouter = Router()

function asyncHandler (f: Function) {
  return function (req: any, res: any, next: any): void {
    Promise.resolve(f(req, res, next)).catch(next)
  }
}

observacionRouter.get('/', asyncHandler(findAll))
observacionRouter.get('/:id', asyncHandler(findOne))
observacionRouter.post('/', sanitizeObservacionInput, asyncHandler(add))
observacionRouter.put('/:id', sanitizeObservacionInput, asyncHandler(update))
observacionRouter.delete('/:id', asyncHandler(remove))
