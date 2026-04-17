import { Request, Response, NextFunction } from "express";
import { Observacion } from "./observacion.entity.js";
import { CategoriaDenuncia } from "../categoriaDenuncia/categoriaDenuncia.entity.js";
import { orm } from "../shared/db/orm.js";
import { Viaje } from "../viaje/viaje.entity.js";
import { getInfiniteScroll } from "../shared/utils/pagination.js";

const em = orm.em;

function sanitizeObservacionInput(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.body.sanitizedInput = {
    observaciones: req.body.observaciones,
    idCategoria: req.body.idCategoria,
    idViaje: req.body.idViaje,
    estado: req.body.estado,
  };

  req.body.sanitizedInput = Object.fromEntries(
    Object.entries(req.body.sanitizedInput).filter(
      ([_, value]) => value !== undefined
    )
  );
  next();
}

// async function findAll(req: Request, res: Response): Promise<void> {
//   try {
//     const limit = Number(req.query.limit) || 10;
//     const cursor = req.query.cursor ? Number(req.query.cursor) : null;

//     const where = cursor ? { id: { $lt: cursor } } : {};

//     let observaciones = await em.find(Observacion, where, {
//       populate: ["viaje", "categoriaDenuncia", "viaje.recorrido"],
//       orderBy: { id: "desc" },
//       limit: limit + 1,
//     });

//     const hasNextPage = observaciones.length > limit;
//     observaciones = observaciones.slice(0, limit);

//     res.status(200).json({
//       message: "Listado de observaciones",
//       items: observaciones,
//       nextCursor: hasNextPage ? observaciones.at(-1)!.id : null,
//       hasNextPage,
//     });
//   } catch (error: any) {
//     res.status(500).json({
//       message: "Error al obtener el listado de observaciones",
//       error: error.message,
//     });
//   }
// }

async function findAll(req: Request, res: Response): Promise<void> {
  try {
    const baseWhere: any = buildBaseWhere(req);

    const result = await getInfiniteScroll<Observacion>({
      req,
      em,
      entity: Observacion,
      message: "Listado de observaciones:",
      populate: ["viaje", "categoriaDenuncia", "viaje.recorrido"],
      baseWhere
    });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      message: "Error al obtener el listado de observaciones",
      error: error.message,
    });
  }
}

async function findOne(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const observacion = await em.findOneOrFail(
      Observacion,
      { id },
      { populate: ["categoriaDenuncia", "viaje"] }
    );
    res
      .status(200)
      .json({
        message: 'La "Observacion" ha sido encontrada: ',
        data: observacion,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al obtener la "Observacion"',
        error: error.message,
      });
  }
}

async function add(req: Request, res: Response): Promise<void> {
  try {
    const categoriaDenuncia = await em.findOneOrFail(CategoriaDenuncia, {
      id: Number(req.body.sanitizedInput.idCategoria),
    });
    req.body.sanitizedInput.categoriaDenuncia = categoriaDenuncia;

    const viaje = await em.findOneOrFail(Viaje, {
      id: Number(req.body.sanitizedInput.idViaje),
    });
    req.body.sanitizedInput.viaje = viaje;

    const observacion = em.create(Observacion, req.body.sanitizedInput);

    await em.flush();

    res
      .status(201)
      .json({
        message: 'La "Observacion" ha sido creada con exito: ',
        data: observacion,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al agregar la "Observacion"',
        error: error.message,
      });
  }
}

async function update(req: Request, res: Response): Promise<void> {
  try {
    if (req.body.sanitizedInput.idCategoria !== undefined) {
      const idCategoria = Number.parseInt(req.body.sanitizedInput.idCategoria);
      const categoria = await em.findOneOrFail(CategoriaDenuncia, {
        id: idCategoria,
      });
      req.body.sanitizedInput.categoriaDenuncia = categoria;
      req.body.sanitizedInput.idCategoria = undefined;
    }

    if (req.body.sanitizedInput.idViaje !== undefined) {
      const idViaje = Number.parseInt(req.body.sanitizedInput.idViaje);
      const viaje = await em.findOneOrFail(Viaje, { id: idViaje });
      req.body.sanitizedInput.viaje = viaje;
      req.body.sanitizedInput.idViaje = undefined;
    }

    const id = Number.parseInt(req.params.id);
    const observacionToUpdate = await em.findOneOrFail(Observacion, { id });

    em.assign(observacionToUpdate, req.body.sanitizedInput);
    await em.flush();

    Object.assign(req.body.sanitizedInput, observacionToUpdate);
    res
      .status(200)
      .json({
        message: 'La "Observacion" ha sido actualizada con exito: ',
        data: req.body.sanitizedInput,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al actualizar la "Observacion"',
        error: error.message,
      });
  }
}

async function remove(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const observacion = await em.findOneOrFail(Observacion, { id });
    await em.removeAndFlush(observacion);
    res
      .status(200)
      .json({ message: 'La "Observacion" ha sido eliminada con exito: ' });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al eliminar la "Observacion"',
        error: error.message,
      });
  }
}

function buildBaseWhere(req: Request): any {
  const baseWhere: any = {};
  if (req.query.estado && typeof req.query.estado === 'string') {
    const estado = req.query.estado.trim();
    if (estado.length > 0) {
      baseWhere.estado = estado;
    }
  }

  if(req.query.observaciones && typeof req.query.observaciones === 'string') {
    const observaciones = req.query.observaciones.trim();
    if(observaciones.length > 0) {
      baseWhere.observaciones = { $like: `%${observaciones}%` };
    }
  }

  if(req.query.categoriaDenunciaId && !isNaN(Number(req.query.categoriaDenunciaId))) {
    const categoriaDenuncia = new CategoriaDenuncia();
    categoriaDenuncia.id = Number(req.query.categoriaDenunciaId);
    baseWhere.categoriaDenuncia = categoriaDenuncia;
  }

  if(req.query.viajeId && !isNaN(Number(req.query.viajeId))) {
    const viaje = new Viaje();
    viaje.id = Number(req.query.viajeId);
    baseWhere.viaje = viaje;
  }

  if(req.query.id && !isNaN(Number(req.query.id))) {
    baseWhere.id = Number(req.query.id);
  }
  
  // Construir el filtro dinamico basando en los rangos de fechas: fechaCreacionIni y fechaCreacionFin
  const fechaCreacionIni = req.query.fechaCreacionIni ? new Date(req.query.fechaCreacionIni as string) : null;
  const fechaCreacionFin = req.query.fechaCreacionFin ? new Date(req.query.fechaCreacionFin as string) : null;
  if (fechaCreacionIni !== null || fechaCreacionFin !== null) {
    const fechaCreacionFilter: any = {};
    if (fechaCreacionIni !== null) {
      fechaCreacionFilter.$gte = fechaCreacionIni;
    }
    if (fechaCreacionFin !== null) {
      fechaCreacionFilter.$lte = fechaCreacionFin;
    }
    baseWhere.createdAt = fechaCreacionFilter;
  }


  return baseWhere;
}

export { sanitizeObservacionInput, findAll, findOne, add, update, remove };
