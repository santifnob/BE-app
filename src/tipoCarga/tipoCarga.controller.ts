import { NextFunction, Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { TipoCarga } from "./tipoCarga.entity.js";
import { getInfiniteScroll } from "../shared/utils/pagination.js";

const em = orm.em;

function sanitizeTipoCargaInput(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.body.sanitizedInput = {
    name: req.body.name,
    desc: req.body.desc,
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

    const result = await getInfiniteScroll<TipoCarga>({
      req,
      em,
      entity: TipoCarga,
      message: "Listado de tipos de carga:",
      baseWhere
    });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      message: "Error al obtener el listado de tipos de carga",
      error: error.message,
    });
  }
}

async function findOne(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const tipoCarga = await em.findOneOrFail(TipoCarga, { id });
    res
      .status(200)
      .json({
        message: 'El "Tipo de carga" ha sido encontrado: ',
        data: tipoCarga,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al obtener el "Tipo de carga"',
        error: error.message,
      });
  }
}

async function add(req: Request, res: Response): Promise<void> {
  try {
    const tipoCarga = em.create(TipoCarga, req.body.sanitizedInput);
    await em.flush();
    res
      .status(201)
      .json({
        message: 'El "Tipo de carga" ha sido creado con exito: ',
        data: tipoCarga,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al agregar el "Tipo de carga"',
        error: error.message,
      });
  }
}

async function update(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const tipoCarga = await em.findOneOrFail(TipoCarga, { id });
    em.assign(tipoCarga, req.body.sanitizedInput);
    await em.flush();
    res
      .status(200)
      .json({
        message: 'El "Tipo de carga" ha sido actualizado con exito: ',
        data: tipoCarga,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al actualizar el "Tipo de carga"',
        error: error.message,
      });
  }
}

/* DIFERENCIA
async function update (req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const tipoCarga = em.getReference(tipoCarga, id)
    em.assign(tipoCarga, req.body)
    await em.flush()
    res.status(200).json({ message: 'tipoCarga actualizado', data: tipoCarga })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
*/

async function remove(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const tipoCarga = await em.findOneOrFail(TipoCarga, { id });
    await em.removeAndFlush(tipoCarga);
    res
      .status(200)
      .json({
        message: 'El "Tipo de carga" ha sido eliminado con exito: ',
        data: tipoCarga,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al eliminar el "Tipo de carga"',
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

  if(req.query.name && typeof req.query.name === 'string') {
    const name = req.query.name.trim();
    if(name.length > 0) {
      baseWhere.name = { $like: `%${name}%` };
    }
  }

  if(req.query.desc && typeof req.query.desc === 'string') {
    const desc = req.query.desc.trim();
    if(desc.length > 0) {
      baseWhere.desc = { $like: `%${desc}%` };
    }
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

export { findAll, findOne, add, update, remove, sanitizeTipoCargaInput };
