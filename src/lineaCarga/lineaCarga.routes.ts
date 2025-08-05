import { Router } from 'express'
import { add, remove, update, sanitizeLineaCargaInput } from './lineaCarga.controller.js'

export const lineaCargaRouter = Router()

function asyncHandler (f: Function) {
  return function (req: any, res: any, next: any): void {
    Promise.resolve(f(req, res, next)).catch(next)
  }
}

lineaCargaRouter.post('/', sanitizeLineaCargaInput, asyncHandler(add))
lineaCargaRouter.delete('/:id', sanitizeLineaCargaInput, asyncHandler(remove))
lineaCargaRouter.put('/:id', sanitizeLineaCargaInput, asyncHandler(update))
