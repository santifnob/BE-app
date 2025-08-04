import { Router } from 'express'
import { findAll, findOne, add, update, remove, sanitizeCargaInput } from './carga.controller.js'

export const cargaRouter = Router()

function asyncHandler (fn: Function) {
  return function (req: any, res: any, next: any): void {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

cargaRouter.get('/', asyncHandler(findAll))
cargaRouter.get('/:id', asyncHandler(findOne))
cargaRouter.post('/', sanitizeCargaInput, asyncHandler(add))
cargaRouter.put('/:id', sanitizeCargaInput, asyncHandler(update))
cargaRouter.delete('/:id', asyncHandler(remove))
