import { NextFunction, Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { Conductor } from "./conductor.entity.js";
import { getInfiniteScroll } from "../shared/utils/pagination.js";
import { BaseWhere } from "../shared/utils/baseWhereFunctions.js";

const em = orm.em;

function sanitizeConductorInput(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    password: req.body.password,
    email: req.body.email,
    estado: req.body.estado,
  };

  req.body.sanitizedInput = Object.fromEntries(
    Object.entries(req.body.sanitizedInput).filter(
      ([_, value]) => value !== undefined
    )
  );
  next();
}

async function findAll(req: Request, res: Response): Promise<void> {
  try {
    const baseWhere: any = buildBaseWhere(req);

    const result = await getInfiniteScroll<Conductor>({
      req,
      em,
      entity: Conductor,
      message: "Listado de los conductores: ",
      populate: ["licencias", "viajes"],
      baseWhere 
    });

    res.status(200).json({
      ...result,
    });

  } catch (error: any) {
    res.status(500).json({
      message: "Error al obtener el listado de los trenes",
      error: error.message,
    });
  }
}

async function findOne(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const conductor = await em.findOneOrFail(
      Conductor,
      { id },
      { populate: ["licencias", "viajes"] }
    );
    res
      .status(200)
      .json({
        message: 'El "Conductor" ha sido encontrado: ',
        data: conductor,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al obtener el "Conductor"',
        error: error.message,
      });
  }
}

async function add(req: Request, res: Response): Promise<void> {
  try {
    const conductor = em.create(Conductor, req.body.sanitizedInput);
    await em.flush();
    res
      .status(201)
      .json({
        message: 'El "Conductor" ha sido cargado con exito: ',
        data: conductor,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al agregar el "Conductor"',
        error: error.message,
      });
  }
}

async function update(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const conductor = await em.findOneOrFail(Conductor, { id });
    em.assign(conductor, req.body.sanitizedInput);
    await em.flush();
    res
      .status(200)
      .json({
        message: 'El "Conductor" ha sido actualizado con exito: ',
        data: conductor,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al actualizar el "Conductor"',
        error: error.message,
      });
  }
}

async function remove(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const conductor = await em.findOneOrFail(Conductor, { id });
    await em.removeAndFlush(conductor);
    res
      .status(200)
      .json({
        message: 'El "Conductor" ha sido eliminado con exito: ',
        data: conductor,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al eliminar el "Condcutor"',
        error: error.message,
      });
  }
}

export async function findOneByMail(
  email: string
): Promise<Conductor | undefined> {
  try {
    const conductor = await em.findOneOrFail(
      Conductor,
      { email },
      { strict: true }
    );
    return conductor;
  } catch (error: any) {
    return undefined;
  }
}

function buildBaseWhere(req: Request): any {
  const baseWhere: BaseWhere = new BaseWhere();

  baseWhere.setExactStringFilter("estado", req.query.estado as string | undefined);
  baseWhere.setLikeFilter("nombre", req.query.nombre as string | undefined);
  baseWhere.setLikeFilter("apellido", req.query.apellido as string | undefined);
  baseWhere.setLikeFilter("email", req.query.email as string | undefined);
  baseWhere.setIdFilter(req.query.id as string | undefined);
  baseWhere.setDateRangeFilter("createdAt", req.query.fechaCreacionIni as any, req.query.fechaCreacionFin as any);

  return baseWhere;
}

export { sanitizeConductorInput, findAll, findOne, add, update, remove };
