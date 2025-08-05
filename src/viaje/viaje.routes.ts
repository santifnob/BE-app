import { Router } from 'express'
import { findAll, findOne, add, update, remove, sanitizeViajeInput } from './viaje.controller.js'

export const viajeRouter = Router()

function asyncHandler (fn: Function) {
  return function (req: any, res: any, next: any): void {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

viajeRouter.get('/', asyncHandler(findAll))
viajeRouter.get('/:id', asyncHandler(findOne))
viajeRouter.post('/', sanitizeViajeInput, asyncHandler(add))
viajeRouter.put('/:id', sanitizeViajeInput, asyncHandler(update))
viajeRouter.delete('/:id', asyncHandler(remove))
