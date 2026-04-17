import { Request, Response, NextFunction } from "express";
import { orm } from "../shared/db/orm.js";
import { Tren } from "../tren/tren.entity.js";
import { EstadoTren } from "../estadoTren/estadoTren.entity.js";
import { getInfiniteScroll } from "../shared/utils/pagination.js";

const em = orm.em;

function sanitizeEstadoInput(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.body.sanitizedInput = {
    fechaVigencia: req.body.fechaVigencia,
    nombre: req.body.nombre,
    estado: req.body.estado,
    idTren: req.body.idTren,
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

    const result = await getInfiniteScroll<EstadoTren>({
      req,
      em,
      entity: EstadoTren,
      message: "Listado de estados de trenes:",
      populate: ["tren"],
      baseWhere
    });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      message: "Error al obtener los estados de los trenes",
      error: error.message,
    });
  }
}

async function findOne(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const estado = await em.findOneOrFail(
      EstadoTren,
      { id },
      { populate: ["tren"] }
    );
    res
      .status(200)
      .json({
        message: 'El "Estado de tren" ha sido encontrado: ',
        data: estado,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al obtener el "Estado de tren"',
        error: error.message,
      });
  }
}

async function add(req: Request, res: Response): Promise<void> {
  try {
    const idTren = Number.parseInt(req.body.sanitizedInput.idTren);
    const tren = await em.findOneOrFail(Tren, { id: idTren });
    req.body.sanitizedInput.tren = tren;
    const estado = em.create(EstadoTren, req.body.sanitizedInput);
    await em.flush();
    res
      .status(201)
      .json({
        message: 'El "Estado de tren" ha sido cargado con exito: ',
        data: estado,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al agregar el "Estado de tren"',
        error: error.message,
      });
  }
}

async function update(req: Request, res: Response): Promise<void> {
  try {
    if (req.body.sanitizedInput.idTren !== undefined) {
      const idTren = Number.parseInt(req.body.sanitizedInput.idTren);
      const tren = await em.findOneOrFail(Tren, { id: idTren });
      req.body.sanitizedInput.tren = tren;
      req.body.sanitizedInput.idTren = undefined;
    }

    const id = Number.parseInt(req.params.id);
    const estadoToUpdate = await em.findOneOrFail(EstadoTren, { id });
    em.assign(estadoToUpdate, req.body.sanitizedInput);
    await em.flush();
    Object.assign(req.body.sanitizedInput, estadoToUpdate); // esto porque sino estadoUpdated no muestra los datos del conductor
    res
      .status(200)
      .json({
        message: 'El "Estado de tren" ha sido actualizado con exito: ',
        data: req.body.sanitizedInput,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al actualizar el "Estado de tren"',
        error: error.message,
      });
  }
}

async function remove(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const estado = await em.findOneOrFail(EstadoTren, { id });
    await em.removeAndFlush(estado);
    res
      .status(200)
      .json({
        message: 'El "Estado de tren" ha sido eliminado con exito: ',
        data: estado,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al eliminar el "Estado de tren"',
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

  if(req.query.nombre && typeof req.query.nombre === 'string') {
    const nombre = req.query.nombre.trim();
    if(nombre.length > 0) {
      baseWhere.nombre = { $like: `%${nombre}%` };
    }
  }

  if(req.query.trenId && !isNaN(Number(req.query.trenId))) {
    const tren = new Tren();
    tren.id = Number(req.query.trenId);
    baseWhere.tren = tren;
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

  const fechaVigenciaIni = req.query.fechaVigenciaIni ? new Date(req.query.fechaVigenciaIni as string) : null;
  const fechaVigenciaFin = req.query.fechaVigenciaFin ? new Date(req.query.fechaVigenciaFin as string) : null;
  if (fechaVigenciaIni !== null || fechaVigenciaFin !== null) {
    const fechaVigenciaFilter: any = {};
    if (fechaVigenciaIni !== null) {
      fechaVigenciaFilter.$gte = fechaVigenciaIni;
    }
    if (fechaVigenciaFin !== null) {
      fechaVigenciaFilter.$lte = fechaVigenciaFin;
    }
    baseWhere.fechaVigencia = fechaVigenciaFilter;
  }

  return baseWhere;
}

export { sanitizeEstadoInput, findAll, findOne, add, update, remove };
