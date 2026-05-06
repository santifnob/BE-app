import { Router } from "express";
import {
  findAll,
  findOne,
  add,
  update,
  remove,
  sanitizeViajeInput,
  viajeValidation
} from "./viaje.controller.js";
import { authorizeRole } from "../middlewares/authMiddlewares.js";

export const viajeRouter = Router();

function asyncHandler(fn: Function) {
  return function (req: any, res: any, next: any): void {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

viajeRouter.get("/validation", asyncHandler(viajeValidation))
viajeRouter.get("/",asyncHandler(findAll));
viajeRouter.get("/:id", asyncHandler(findOne));
viajeRouter.post("/", authorizeRole(),sanitizeViajeInput, asyncHandler(add));
viajeRouter.put("/:id",sanitizeViajeInput, asyncHandler(update));
viajeRouter.delete("/:id", authorizeRole(),asyncHandler(remove));
