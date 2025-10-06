import { Router } from "express";
import {
  findAll,
  findOne,
  add,
  update,
  sanitizeRecorridoInput,
  remove,
} from "./recorrido.controller.js";

export const recorridoRouter = Router();

// para resolver el problema de que el segundo parametro de los metodos get, put,
// post, y delete esperan que la funcion devuelva void, pero las funciones
// enviadas realmente devuelven una promesa
function asyncHandler(fn: Function) {
  return function (req: any, res: any, next: any): void {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

recorridoRouter.get("/", asyncHandler(findAll));
recorridoRouter.get("/:id", asyncHandler(findOne));
recorridoRouter.post("/", sanitizeRecorridoInput, asyncHandler(add));
recorridoRouter.put("/:id", sanitizeRecorridoInput, asyncHandler(update));
recorridoRouter.delete("/:id", asyncHandler(remove));
