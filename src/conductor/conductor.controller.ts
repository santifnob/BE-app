import { NextFunction, Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { Conductor } from "./conductor.entity.js";
import { getInfiniteScroll } from "../shared/utils/pagination.js";

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

  if(req.query.apellido && typeof req.query.apellido === 'string') {
    const apellido = req.query.apellido.trim();
    if(apellido.length > 0) {
      baseWhere.apellido = { $like: `%${apellido}%` };
    }
  }
  
  if(req.query.email && typeof req.query.email === 'string') {
    const email = req.query.email.trim();
    if(email.length > 0) {
      baseWhere.email = { $like: `%${email}%` };
    }
  }

  if(req.query.id && !isNaN(Number(req.query.id))) {
    baseWhere.id = Number(req.query.id);
  }
  
  // Constuir el filtro dinamico basando en los rangos de fechas: fechaCreacionIni y fechaCreacionFin
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

export { sanitizeConductorInput, findAll, findOne, add, update, remove };
