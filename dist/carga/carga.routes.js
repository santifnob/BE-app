import { Router } from 'express';
import { findAll, findOne, add, update, remove, sanitizeCargaInput } from './carga.controller.js';
export const cargaRouter = Router();
function asyncHandler(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
cargaRouter.get('/', asyncHandler(findAll));
cargaRouter.get('/:id', asyncHandler(findOne));
cargaRouter.post('/', sanitizeCargaInput, asyncHandler(add));
cargaRouter.put('/:id', sanitizeCargaInput, asyncHandler(update));
cargaRouter.delete('/:id', asyncHandler(remove));
//# sourceMappingURL=carga.routes.js.map