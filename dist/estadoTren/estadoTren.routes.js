import { Router } from 'express';
import { sanitizeEstadoInput, findAll, findOne, remove, add, update } from '../estadoTren/estadoTren.controller.js';
export const estadoTrenRouter = Router();
function asyncHandler(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
estadoTrenRouter.get('/', asyncHandler(findAll));
estadoTrenRouter.get('/:id', asyncHandler(findOne));
estadoTrenRouter.post('/', sanitizeEstadoInput, asyncHandler(add));
estadoTrenRouter.put('/:id', sanitizeEstadoInput, asyncHandler(update));
estadoTrenRouter.delete('/:id', asyncHandler(remove));
//# sourceMappingURL=estadoTren.routes.js.map