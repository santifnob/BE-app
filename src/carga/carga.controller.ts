import { NextFunction, Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { Carga } from "./carga.entity.js";
import { TipoCarga } from "../tipoCarga/tipoCarga.entity.js";
import { getInfiniteScroll } from "../shared/utils/pagination.js";
import { BaseWhere } from "../shared/utils/baseWhereFunctions.js";

const em = orm.em;

function sanitizeCargaInput(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.body.sanitizedInput = {
    name: req.body.name,
    precio: req.body.precio,
    estado: req.body.estado,
    idTipoCarga: req.body.idTipoCarga,
  };

  req.body.sanitizedInput = Object.fromEntries(
    Object.entries(req.body.sanitizedInput).filter(
      ([_, value]) => value !== undefined
    )
  );
  next();
}

/*async function findAll (req: Request, res: Response): Promise<void> {
  try {
    const carga = await em.find(Carga, {}, { populate: ['lineaCargas', 'tipoCarga'] }) // sacar despues lineasCargas
    res.status(200).json({ message: 'Listado de las cargas: ', data: carga })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener el listado de las cargas', error: error.message })
  }
}*/

async function findAll(req: Request, res: Response): Promise<void> {
  try {
    const baseWhere: any = buildBaseWhere(req);

    const result = await getInfiniteScroll<Carga>({
      req,
      em,
      entity: Carga,
      message: "Listado de las cargas:",
      populate: ["tipoCarga"], // Hay que ver todavia que hacemos con respecto a que relaciones mostramos
      baseWhere
    });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      message: "Error al obtener el listado de las cargas",
      error: error.message,
    });
  }
}


async function findOne(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const carga = await em.findOneOrFail(
      Carga,
      { id },
      { populate: ["lineaCargas", "tipoCarga"] }
    ); // sacar despues lineasCargas
    res
      .status(200)
      .json({ message: 'La "Carga" ha sido encontrada: ', data: carga });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error al obtener la "Carga"', error: error.message });
  }
}

async function add(req: Request, res: Response): Promise<void> {
  try {
    const input = req.body.sanitizedInput;

    if (
      !input?.name ||
      input.precio === undefined ||
      input.estado === undefined
    ) {
      res
        .status(400)
        .json({ message: "Campos requeridos: name, precio, estado" });
      return;
    }

    const data: any = {
      name: String(input.name),
      precio: Number(input.precio),
      estado: String(input.estado),
    };

    // Si vino idTipoCarga válido, lo seteamos; si no, lo omitimos (quedará null)
    if (input.idTipoCarga !== undefined) {
      const id = Number(input.idTipoCarga);
      if (Number.isFinite(id)) {
        // getReference evita query extra si ya sabés que existe; si querés validar existencia, usa findOneOrFail
        data.tipoCarga = em.getReference(TipoCarga, id);
      }
    }

    const carga = em.create(Carga, data);
    await em.flush();

    res
      .status(201)
      .json({ message: 'La "Carga" ha sido creada con éxito', data: carga });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error al agregar la "Carga"', error: error.message });
  }
}

async function update(req: Request, res: Response): Promise<void> {
  try {
    const input = req.body.sanitizedInput;

    const id = Number.parseInt(req.params.id);
    const carga = await em.findOneOrFail(Carga, { id });

    // Manejo flexible de idTipoCarga
    if ("idTipoCarga" in input) {
      if (input.idTipoCarga === null) {
        carga.tipoCarga = null;
      } else {
        const idTc = Number(input.idTipoCarga);
        if (Number.isFinite(idTc)) {
          carga.tipoCarga = em.getReference(TipoCarga, idTc);
        } else {
          // si vino vacio o inválido, lo ignoramos; también podrías forzar null
          // carga.tipoCarga = null;
        }
      }
      delete input.idTipoCarga;
    }

    em.assign(carga, input); // name, precio, estado, etc.
    await em.flush();

    res
      .status(200)
      .json({
        message: 'La "Carga" ha sido actualizada con éxito',
        data: carga,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al actualizar la "Carga"',
        error: error.message,
      });
  }
}

async function remove(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const carga = await em.findOneOrFail(Carga, { id });
    await em.removeAndFlush(carga);
    res
      .status(200)
      .json({
        message: 'La "Carga" ha sido eliminada con exito: ',
        data: carga,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error al eliminar la "Carga"', error: error.message });
  }
}

function buildBaseWhere(req: Request): any {
  const baseWhere: BaseWhere = new BaseWhere();

  baseWhere.setExactStringFilter("estado", req.query.estado as string | undefined);
  baseWhere.setLikeFilter("name", req.query.name as string | undefined);
  baseWhere.setIdFilter(req.query.id as string | undefined);
  baseWhere.setDateRangeFilter("createdAt", req.query.fechaCreacionIni as any, req.query.fechaCreacionFin as any);
  baseWhere.setRangeNumberFilter("precio", req.query.minPrecio as any, req.query.maxPrecio as any);
  baseWhere.setRelatedAttributeLikeFilter("tipoCarga", "name", req.query.nombreTipoCarga as string | undefined);

  return baseWhere;
}

export { findAll, findOne, add, update, remove, sanitizeCargaInput };
