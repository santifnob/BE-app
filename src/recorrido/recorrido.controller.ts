import { Request, Response, NextFunction } from "express";
import { Recorrido } from "./recorrido.entity.js";
import { orm } from "../shared/db/orm.js";
import { getInfiniteScroll } from "../shared/utils/pagination.js";

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
    const baseWhere: any = buildBaseWhere(req);

    const result = await getInfiniteScroll<Recorrido>({
      req,
      em,
      entity: Recorrido,
      message: "Listado de los recorridos: ",
      baseWhere,
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
  const baseWhere: any = {};

  // Filtro: ciudadSalida (búsqueda parcial con $like)
  if (req.query.ciudadSalida && typeof req.query.ciudadSalida === 'string') {
    const ciudadSalida = req.query.ciudadSalida.trim();
    if (ciudadSalida.length > 0) {
      baseWhere.ciudadSalida = { $like: `%${ciudadSalida}%` };
    }
  }

  // Filtro: ciudadLlegada (búsqueda parcial con $like)
  if (req.query.ciudadLlegada && typeof req.query.ciudadLlegada === 'string') {
    const ciudadLlegada = req.query.ciudadLlegada.trim();
    if (ciudadLlegada.length > 0) {
      baseWhere.ciudadLlegada = { $like: `%${ciudadLlegada}%` };
    }
  }

  // Filtro: estado (búsqueda exacta)
  if (req.query.estado && typeof req.query.estado === 'string') {
    const estado = req.query.estado.trim();
    if (estado.length > 0) {
      baseWhere.estado = estado;
    }
  }

  if(req.query.id && !isNaN(Number(req.query.id))) {
    baseWhere.id = Number(req.query.id);
  }

  // Filtro: totalKm (rango con minKm y/o maxKm)
  const minKm = req.query.minKm ? Number(req.query.minKm) : null;
  const maxKm = req.query.maxKm ? Number(req.query.maxKm) : null;

  // Construir filtro de rango para totalKm
  if (minKm !== null && Number.isFinite(minKm) && maxKm !== null && Number.isFinite(maxKm) && minKm <= maxKm) {
    const kmFilter: any = {};
    if (minKm !== null) kmFilter.$gte = minKm;
    if (maxKm !== null) kmFilter.$lte = maxKm;
    baseWhere.totalKm = kmFilter;
  } else if (minKm !== null && Number.isFinite(minKm)) {
    baseWhere.totalKm = { $gte: minKm };
  } else if (maxKm !== null && Number.isFinite(maxKm)) {
    baseWhere.totalKm = { $lte: maxKm };
  }

  return baseWhere;
}

export { sanitizeRecorridoInput, findAll, findOne, add, update, remove };
