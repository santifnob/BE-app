import { NextFunction, Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { Conductor } from "./conductor.entity.js";

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
    const limitParam = Number(req.query.limit);
    const limit =
      Number.isFinite(limitParam) && limitParam > 0
        ? Math.min(limitParam, 100)
        : 10;

    const cursorParam = req.query.cursor;
    const cursor =
      cursorParam !== undefined && cursorParam !== null
        ? Number(cursorParam)
        : null;

    const where = cursor ? { id: { $lt: cursor } } : {};

    let conductores = await em.find(Conductor, where, {
      populate: ["licencias", "viajes"], // <-- SOLO si necesitás relaciones
      orderBy: { id: "desc" }, // mismos criterios de orden
      limit: limit + 1, // pedimos uno extra
    });

    const hasNextPage = conductores.length > limit;
    conductores = conductores.slice(0, limit);

    res.status(200).json({
      message: "Listado de los conductores",
      items: conductores,
      nextCursor: hasNextPage ? conductores.at(-1)!.id : null,
      hasNextPage,
    });
  } catch (error: any) {
    res.status(500).json({
      message: "Error al obtener el listado de los conductores",
      error: error.message,
    });
  }
}
/* {
  try {
    console.log('aca')
    const conductores = await em.find(Conductor, {}, { populate: ['licencias', 'viajes'] })
    res.status(200).json({ message: 'Listado de los conductores:', data: conductores })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener el listado de los conductores', error: error.message })
  }
} */

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
    // console.log('Sanitized input:', req.body.sanitizedInput) para ver que llega bien
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

/* DIFERENCIA
async function update (req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const conductor = em.getReference(Conductor, id)
    em.assign(conductor, req.body)
    await em.flush()
    res.status(200).json({ message: 'conductor actualizado', data: conductor })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
*/

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

export { sanitizeConductorInput, findAll, findOne, add, update, remove };
