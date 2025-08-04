import { Router } from 'express';
import { findAll, findOne, add, update, remove, sanitizeTipoCargaInput } from './tipoCarga.controller.js';
export const tipoCargaRouter = Router();
function asyncHandler(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
tipoCargaRouter.get('/', asyncHandler(findAll));
tipoCargaRouter.get('/:id', asyncHandler(findOne));
tipoCargaRouter.post('/', sanitizeTipoCargaInput, asyncHandler(add));
tipoCargaRouter.put('/:id', sanitizeTipoCargaInput, asyncHandler(update));
tipoCargaRouter.delete('/:id', asyncHandler(remove));
//# sourceMappingURL=tipoCarga.routes.js.map