import { Request, Response, NextFunction } from "express";
import { CategoriaDenuncia } from "./categoriaDenuncia.entity.js";
import { orm } from "../shared/db/orm.js";
import { getInfiniteScroll } from "../shared/utils/pagination.js";

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
  const baseWhere: any = {};
  if (req.query.estado && typeof req.query.estado === 'string') {
    const estado = req.query.estado.trim();
    if (estado.length > 0) {
      baseWhere.estado = estado;
    }
  }

  if(req.query.titulo && typeof req.query.titulo === 'string') {
    const titulo = req.query.titulo.trim();
    if(titulo.length > 0) {
      baseWhere.titulo = { $like: `%${titulo}%` };
    }
  }

  if(req.query.descripcion && typeof req.query.descripcion === 'string') {
    const descripcion = req.query.descripcion.trim();
    if(descripcion.length > 0) {
      baseWhere.descripcion = { $like: `%${descripcion}%` };
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

export { sanitizeRecorridoInput, findAll, findOne, add, update, remove };
