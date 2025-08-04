import { Router } from 'express'
import { add, findAll, findOne, remove, update, sanitizeLicenciaInput } from './licencia.controller.js'

export const licenciaRouter = Router()

function asyncHandler (f: Function) {
  return function (req: any, res: any, next: any): void {
    Promise.resolve(f(req, res, next)).catch(next)
  }
}

licenciaRouter.get('/', asyncHandler(findAll))
licenciaRouter.get('/:id', asyncHandler(findOne))
licenciaRouter.post('/', sanitizeLicenciaInput, asyncHandler(add))
licenciaRouter.delete('/:id', sanitizeLicenciaInput, asyncHandler(remove))
licenciaRouter.put('/:id', sanitizeLicenciaInput, asyncHandler(update))
