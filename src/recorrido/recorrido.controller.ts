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
    const baseWhere: any = {};
    const filterColumn = req.query.filterColumn;
    const filterValue = req.query.filterValue;

    if (filterColumn && filterValue) {
      const valueStr = filterValue.toString();
      switch (filterColumn) {
        case "ciudadLlegada": baseWhere.ciudadLlegada = filterValue.toString(); break;
        case "ciudadSalida": baseWhere.ciudadSalida = filterValue.toString(); break; 
        case "estado": baseWhere.estado = filterValue.toString(); break;
        case "totalKm": baseWhere.totalKm = parseInt(filterValue.toString()); break;
        default: break;
      }
    }

    const result = await getInfiniteScroll<Recorrido>({
      req,
      em,
      entity: Recorrido,
      message: "Listado de los recorridos: ",
      baseWhere 
    });

    res.status(200).json({
      ...result
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

export { sanitizeRecorridoInput, findAll, findOne, add, update, remove };
