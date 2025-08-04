import { Router } from 'express';
import { findAll, findOne, sanitizeRecorridoInput, add, update, remove } from './categoriaDenuncia.controller.js';
export const catRouter = Router();
// para resolver el problema de que el segundo parametro de los metodos get, put,
// post, y delete esperan que la funcion devuelva void, pero las funciones
// enviadas realmente devuelven una promesa
function asyncHandler(fn) {
    return function (req, res, next) {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
catRouter.get('/', asyncHandler(findAll));
catRouter.get('/:id', asyncHandler(findOne));
catRouter.post('/', sanitizeRecorridoInput, asyncHandler(add));
catRouter.put('/:id', sanitizeRecorridoInput, asyncHandler(update));
catRouter.delete('/:id', asyncHandler(remove));
//# sourceMappingURL=categoriaDenunica.routes.js.map