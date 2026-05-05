import { Request, Response, NextFunction } from "express";
import { Tren } from "./tren.entity.js";
import { EstadoTren } from "../estadoTren/estadoTren.entity.js";
import { orm } from "../shared/db/orm.js";
import { getInfiniteScroll } from "../shared/utils/pagination.js";
import { SqlEntityManager } from "@mikro-orm/mysql";
import { BaseWhere } from "../shared/utils/baseWhereFunctions.js";

const em = orm.em;

type WhereType = {
  id?: { $lt: number };
  color?: string;
  modelo?: string;
  estadosTren?: { nombre?: string}
}

function sanitizarTrenInput(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.body.sanitizarInput = {
    color: req.body.color,
    modelo: req.body.modelo
  };

  req.body.sanitizarInput = Object.fromEntries(
    Object.entries(req.body.sanitizarInput).filter(
      ([_, value]) => value !== undefined
    )
  );
  next();
}

async function findAll(req: Request, res: Response): Promise<void> {
  try {
    const baseWhere: any = buildBaseWhere(req);

    const result = await getInfiniteScroll<Tren>({
      req,
      em,
      entity: Tren,
      message: "Listado de los trenes: ",
      populate: ["viajes", "estadosTren"],
      baseWhere 
    });

    const itemsConEstado = result.items.map((tren) => {
      const estados = tren.estadosTren || [];
      const lastEstado = estados
        .toArray()
        .filter((e) => e.estado === "Activo")
        .sort((e1, e2) => e2.fechaVigencia.getTime() - e1.fechaVigencia.getTime())[0];

      return { ...tren, estadoActual: lastEstado };
    });

    res.status(200).json({
      ...result,
      items: itemsConEstado, 
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
    console.log(req.params.id);
    const id = Number.parseInt(req.params.id);
    const tren = await em.findOneOrFail(Tren, id, {
      populate: ["estadosTren"],
    });
    res
      .status(200)
      .json({ message: 'El "Tren" ha sido encontrado: ', data: tren });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error al obtener el "Tren"', error: error.message });
  }
}

async function add(req: Request, res: Response): Promise<void> {
  try {
    const tren = em.create(Tren, req.body.sanitizarInput);
    await em.flush();
    res
      .status(201)
      .json({ message: 'El "Tren" ha sido cargado con exito: ', data: tren });
    // await em.persistAndFlush(tren);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error al agregar el "Tren"', error: error.message });
  }
}

async function update(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const tren = await em.findOneOrFail(Tren, { id });
    em.assign(tren, req.body.sanitizarInput);
    await em.flush();
    res
      .status(200)
      .json({
        message: 'El "Tren" ha sido actualizado con exito: ',
        data: tren,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error al actualizar el "Tren"', error: error.message });
  }
}

async function remove(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const tren = await em.findOneOrFail(Tren, { id });
    await em.removeAndFlush(tren);
    res
      .status(200)
      .json({ message: 'El "Tren" ha sido eliminado con exito: ', data: tren });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error al eliminar el "Tren"', error: error.message });
  }
}

function buildBaseWhere(req: Request): any {
  const baseWhere: BaseWhere = new BaseWhere();

  baseWhere.setLikeFilter("color", req.query.color as string | undefined);
  baseWhere.setLikeFilter("modelo", req.query.modelo as string | undefined);
  baseWhere.setIdFilter(req.query.id as string | undefined);

  // Logica más compleja para filtrar por estado del tren
  if (req.query.estadoTren && typeof req.query.estadoTren === 'string') {
    const estado = req.query.estadoTren.trim();

    if (estado.length > 0) {
      const subQuery = buildEstadoTrenFilter(estado); // convierte a SQL usable
      if (baseWhere.id !== undefined) {
        baseWhere.$and = [
          { id: baseWhere.id },
          { id: { $in: subQuery } }
        ];
        delete baseWhere.id;
      } else {
        baseWhere.id = { $in: subQuery };
      }
    }
  }

  baseWhere.setDateRangeFilter("createdAt", req.query.fechaCreacionIni as any, req.query.fechaCreacionFin as any);

  return baseWhere;
}

function buildEstadoTrenFilter(estado: string) {
  const emSql = em as SqlEntityManager // Permite utilizar el queryBuilder

  const subQb = emSql.qb(EstadoTren, 'et')
    .select('et.tren')
    .where({ nombre: estado })
    .andWhere({ fechaVigencia: { $lt: new Date() } })
    .andWhere(`
      et.fecha_vigencia = (
        SELECT MAX(et2.fecha_vigencia)
        FROM estado_tren et2
        WHERE et2.tren_id = et.tren_id
        AND et2.fecha_vigencia < NOW()
      )
    `)

  return subQb.getKnexQuery()
}

export { sanitizarTrenInput, findAll, findOne, add, update, remove };
