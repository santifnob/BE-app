import { Request, Response, NextFunction } from "express";
import { Recorrido } from "./recorrido.entity.js";
import { orm } from "../shared/db/orm.js";
import { getInfiniteScroll } from "../shared/utils/pagination.js";
import { BaseWhere } from "../shared/utils/baseWhereFunctions.js";

const em = orm.em;

function sanitizeRecorridoInput(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.body.sanitizedInput = {
    ciudadSalida: req.body.ciudadSalida,
    ciudadLlegada: req.body.ciudadLlegada,
    totalKm: req.body.totalKm,
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
    const baseWhere = buildBaseWhere(req);

    const result = await getInfiniteScroll<Recorrido>({
      req,
      em,
      entity: Recorrido,
      message: "Listado de los recorridos: ",
      baseWhere: baseWhere as any,
    });

    res.status(200).json({
      ...result,
    });

  } catch (error: any) {
    res.status(500).json({
      message: "Error al obtener el listado de los recorridos",
      error: error.message,
    });
  }
}

async function findOne(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const recorrido = await em.findOneOrFail(Recorrido, { id });
    res
      .status(200)
      .json({
        message: 'El "Recorrido" ha sido encontrado: ',
        data: recorrido,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Error al obtener el recorrido", error: error.message });
  }
}

async function add(req: Request, res: Response): Promise<void> {
  try {
    const recorrido = em.create(Recorrido, req.body.sanitizedInput);
    await em.flush();
    res
      .status(200)
      .json({
        message: 'El "Recorrido" ha sido cargado con exito: ',
        data: recorrido,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al agregar el "recorrido"',
        error: error.message,
      });
  }
}

async function update(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const recorrido = await em.findOneOrFail(Recorrido, { id });
    em.assign(recorrido, req.body.sanitizedInput);
    await em.flush();
    res
      .status(200)
      .json({
        message: 'El "Recorrido" ha sido actualizado con exito: ',
        data: recorrido,
      });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const recorrido = await em.findOneOrFail(Recorrido, { id });
    await em.removeAndFlush(recorrido);
    res
      .status(200)
      .json({
        message: 'El "Recorrido" ha sido eliminado con exito: ',
        data: recorrido,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al eliminar el "Recorrido"',
        error: error.message,
      });
  }
}

function buildBaseWhere(req: Request): any {
  const baseWhere: BaseWhere = new BaseWhere();

  baseWhere.setLikeFilter("ciudadSalida", req.query.ciudadSalida as string | undefined);

  baseWhere.setLikeFilter("ciudadLlegada", req.query.ciudadLlegada as string | undefined);

  baseWhere.setExactStringFilter("estado", req.query.estado as string | undefined);

  baseWhere.setIdFilter(req.query.id as string | undefined);

  baseWhere.setRangeNumberFilter("totalKm", req.query.minKm, req.query.maxKm);

  return baseWhere;
}

export { sanitizeRecorridoInput, findAll, findOne, add, update, remove };
