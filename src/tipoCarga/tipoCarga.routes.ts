import { Router } from 'express'
import { findAll, findOne, add, update, remove, sanitizeTipoCargaInput } from './tipoCarga.controller.js'

export const tipoCargaRouter = Router()

function asyncHandler (fn: Function) {
  return function (req: any, res: any, next: any): void {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

tipoCargaRouter.get('/', asyncHandler(findAll))
tipoCargaRouter.get('/:id', asyncHandler(findOne))
tipoCargaRouter.post('/', sanitizeTipoCargaInput, asyncHandler(add))
tipoCargaRouter.put('/:id', sanitizeTipoCargaInput, asyncHandler(update))
tipoCargaRouter.delete('/:id', asyncHandler(remove))
