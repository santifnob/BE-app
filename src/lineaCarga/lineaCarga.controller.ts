import { Request, Response, NextFunction } from "express";
import { LineaCarga } from "./lineaCarga.entity.js";
import { orm } from "../shared/db/orm.js";
import { Carga } from "../carga/carga.entity.js";
import { Viaje } from "../viaje/viaje.entity.js";
import { getInfiniteScroll } from "../shared/utils/pagination.js";
import { BaseWhere } from "../shared/utils/baseWhereFunctions.js";  

const em = orm.em;

function sanitizeLineaCargaInput(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.body.sanitizedInput = {
    cantidadVagon: req.body.cantidadVagon,
    idCarga: req.body.idCarga,
    idViaje: req.body.idViaje,
    estado: req.body.estado,
  };
  // more checks here

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

    const result = await getInfiniteScroll<LineaCarga>({
      req,
      em,
      entity: LineaCarga,
      message: "Listado de lineas de carga:",
      populate: ["carga", "viaje", "viaje.recorrido", "carga.precio"],
      baseWhere
    });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      message: "Error al obtener el listado de lineas de carga",
      error: error.message,
    });
  }
}

async function findOne(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const lineaCarga = await em.findOneOrFail(
      LineaCarga,
      { id },
      { populate: ["carga", "viaje", "viaje.recorrido"] }
    );
    res
      .status(200)
      .json({
        message: 'La "Linea de carga" ha sido encontrada: ',
        data: lineaCarga,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al obtener la "Linea de carga"',
        error: error.message,
      });
  }
}

async function add(req: Request, res: Response): Promise<void> {
  try {
    const idCarga = Number.parseInt(req.body.sanitizedInput.idCarga);
    const carga = await em.findOneOrFail(Carga, { id: idCarga });
    req.body.sanitizedInput.carga = carga;

    const idViaje = Number.parseInt(req.body.sanitizedInput.idViaje);
    const viaje = await em.findOneOrFail(Viaje, { id: idViaje });
    req.body.sanitizedInput.viaje = viaje;

    const lineaCarga = em.create(LineaCarga, req.body.sanitizedInput);
    await em.flush();
    res
      .status(201)
      .json({
        message: 'La "Linea de carga" ha sido creada con exito: ',
        data: lineaCarga,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al obtener la "Linea de carga"',
        error: error.message,
      });
  }
}

async function update(req: Request, res: Response): Promise<void> {
  try {
    if (req.body.sanitizedInput.idCarga !== undefined) {
      const idCarga = Number.parseInt(req.body.sanitizedInput.idCarga);
      const carga = await em.findOneOrFail(Carga, { id: idCarga });
      req.body.sanitizedInput.carga = carga;
      req.body.sanitizedInput.idCarga = undefined;
    }

    if (req.body.sanitizedInput.idViaje !== undefined) {
      const idViaje = Number.parseInt(req.body.sanitizedInput.idViaje);
      const viaje = await em.findOneOrFail(Viaje, { id: idViaje });
      req.body.sanitizedInput.viaje = viaje;
      req.body.sanitizedInput.idViaje = undefined;
    }

    const id = Number.parseInt(req.params.id);
    const LineaCargaToUpdate = await em.findOneOrFail(LineaCarga, { id });
    em.assign(LineaCargaToUpdate, req.body.sanitizedInput);
    await em.flush();
    Object.assign(req.body.sanitizedInput, LineaCargaToUpdate); // esto porque sino LineaCargaUpdated no muestra los datos del Carga
    res
      .status(200)
      .json({
        message: 'La "Linea de carga" ha sido actualizada con exito: ',
        data: LineaCargaToUpdate,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al actualizar la "Linea de carga"',
        error: error.message,
      });
  }
}

async function remove(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const lineaCarga = await em.findOneOrFail(LineaCarga, { id });
    await em.removeAndFlush(lineaCarga);
    res
      .status(200)
      .json({
        message: 'La "Linea de carga" ha sido eliminada con exito: ',
        data: lineaCarga,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al eliminar la "Linea de carga"',
        error: error.message,
      });
  }
}

function buildBaseWhere(req: Request): any {
  const baseWhere: BaseWhere = new BaseWhere();

  baseWhere.setExactStringFilter("estado", req.query.estado as string | undefined);
  baseWhere.setForeignKeyFilter("carga", req.query.cargaId as string | undefined);
  baseWhere.setForeignKeyFilter("viaje", req.query.viajeId as string | undefined);
  baseWhere.setIdFilter(req.query.id as string | undefined);
  baseWhere.setDateRangeFilter("createdAt", req.query.fechaCreacionIni as any, req.query.fechaCreacionFin as any);
  baseWhere.setRangeNumberFilter("cantidadVagon", req.query.minCantidadVagon as any, req.query.maxCantidadVagon as any);
  baseWhere.setRelatedAttributeLikeFilter("carga", "name", req.query.nombreCarga as string | undefined);

  return baseWhere;
}

export { sanitizeLineaCargaInput, add, update, remove, findAll, findOne };
