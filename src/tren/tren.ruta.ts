import {Router} from "express"
import { sanitizarTrenInput, findAll, getOne, add, update, remove } from "./tren.controlador.js";


export const trenRuta = Router()

function asyncHandler (fn: Function) {
  return function (req: any, res: any, next: any): void {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

trenRuta.get("/", asyncHandler(findAll));
trenRuta.get("/:id", asyncHandler(getOne))
trenRuta.post("/", sanitizarTrenInput, asyncHandler(add))
trenRuta.put("/:id", sanitizarTrenInput, asyncHandler(update))
trenRuta.patch("/:id", sanitizarTrenInput, asyncHandler(update))
trenRuta.delete("/:id", asyncHandler(remove))