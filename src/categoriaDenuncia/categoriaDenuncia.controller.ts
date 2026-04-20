import { Request, Response, NextFunction } from "express";
import { CategoriaDenuncia } from "./categoriaDenuncia.entity.js";
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
    titulo: req.body.titulo,
    descripcion: req.body.descripcion,
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

    const result = await getInfiniteScroll<CategoriaDenuncia>({
      req,
      em,
      entity: CategoriaDenuncia,
      message: "Listado de categorias de denuncia:",
      baseWhere
    });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      message: "Error al obtener el listado de categorias de denuncia",
      error: error.message,
    });
  }
}

async function findOne(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const catDenuncia = await em.findOneOrFail(
      CategoriaDenuncia,
      { id },
      { populate: ["observaciones"] }
    );
    res
      .status(200)
      .json({
        message: 'La "Categoria de denuncia" ha sido encontrada: ',
        data: catDenuncia,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al obtener la "Categoria de denuncia"',
        error: error.message,
      });
  }
}

async function add(req: Request, res: Response): Promise<void> {
  try {
    const catDenuncia = em.create(CategoriaDenuncia, req.body.sanitizedInput);
    await em.flush();
    res
      .status(200)
      .json({
        message: 'La "Categoria de denuncia" ha sido creada con exito: ',
        data: catDenuncia,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al agregar la "Categoria de denuncia"',
        error: error.message,
      });
  }
}

async function update(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const catDenuncia = await em.findOneOrFail(CategoriaDenuncia, { id });
    em.assign(catDenuncia, req.body.sanitizedInput);
    await em.flush();
    res
      .status(200)
      .json({
        message: 'La "Categoria de denuncia" ha sido actualizada con exito: ',
        data: catDenuncia,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al actualizar la "Categoria de denuncia"',
        error: error.message,
      });
  }
}

async function remove(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const catDenuncia = await em.findOneOrFail(
      CategoriaDenuncia,
      { id },
      { populate: ["observaciones"] }
    );
    await em.removeAndFlush(catDenuncia);
    res
      .status(200)
      .json({
        message: 'La "Categoria de denuncia" ha sido eliminada con exito: ',
        data: catDenuncia,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al eliminar la "Categoria de denuncia"',
        error: error.message,
      });
  }
}

function buildBaseWhere(req: Request): any {
  const baseWhere: BaseWhere = new BaseWhere();

  baseWhere.setExactStringFilter("estado", req.query.estado as string | undefined);
  baseWhere.setLikeFilter("titulo", req.query.titulo as string | undefined);
  baseWhere.setLikeFilter("descripcion", req.query.descripcion as string | undefined);
  baseWhere.setIdFilter(req.query.id as string | undefined);
  baseWhere.setDateRangeFilter("createdAt", req.query.fechaCreacionIni as any, req.query.fechaCreacionFin as any);

  return baseWhere;
}

export { sanitizeRecorridoInput, findAll, findOne, add, update, remove };
