import { Router } from 'express';
import { findAll, findOne, add, update, remove } from './conductor.controller.js';
export const conductorRouter = Router();
function asyncHandler(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
conductorRouter.get('/', asyncHandler(findAll));
conductorRouter.get('/:id', asyncHandler(findOne));
conductorRouter.post('/', asyncHandler(add));
conductorRouter.put('/:id', asyncHandler(update));
conductorRouter.delete('/:id', asyncHandler(remove));
//# sourceMappingURL=conductor.routes.js.map