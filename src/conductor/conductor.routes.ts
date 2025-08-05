import { Router } from 'express'
import { findAll, findOne, add, update, remove, sanitizeConductorInput } from './conductor.controller.js'

export const conductorRouter = Router()

function asyncHandler (fn: Function) {
  return function (req: any, res: any, next: any): void {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

conductorRouter.get('/', asyncHandler(findAll))
conductorRouter.get('/:id', asyncHandler(findOne))
conductorRouter.post('/', sanitizeConductorInput, asyncHandler(add))
conductorRouter.put('/:id', sanitizeConductorInput, asyncHandler(update))
conductorRouter.delete('/:id', sanitizeConductorInput, asyncHandler(remove))
