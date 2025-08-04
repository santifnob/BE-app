import { Router } from 'express'
import { findAll, findOne, add, update, remove, sanitizarTrenInput } from './tren.controller.js'

export const trenRouter = Router()

function asyncHandler (fn: Function) {
  return function (req: any, res: any, next: any): void {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

trenRouter.get('/', asyncHandler(findAll))
trenRouter.get('/:id', asyncHandler(findOne))
trenRouter.post('/', sanitizarTrenInput, asyncHandler(add))
trenRouter.put('/:id', sanitizarTrenInput, asyncHandler(update))
trenRouter.delete('/:id', asyncHandler(remove))
