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
    const result = await getInfiniteScroll<TipoCarga>({
      req,
      em,
      entity: TipoCarga,
      message: "Listado de tipos de carga:",
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

export { findAll, findOne, add, update, remove, sanitizeTipoCargaInput };
