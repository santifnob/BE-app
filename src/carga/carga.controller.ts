import { NextFunction, Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { Carga } from "./carga.entity.js";
import { TipoCarga } from "../tipoCarga/tipoCarga.entity.js";
import { getInfiniteScroll } from "../shared/utils/pagination.js";

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

  
  const minPrecio = req.query.minPrecio ? Number(req.query.minPrecio) : null;
  const maxPrecio = req.query.maxPrecio ? Number(req.query.maxPrecio) : null;
  if (minPrecio !== null || maxPrecio !== null) {
    const precioFilter: any = {};
    if (minPrecio !== null) {
      precioFilter.$gte = minPrecio;
    }
    if (maxPrecio !== null) {
      precioFilter.$lte = maxPrecio;
    }
    baseWhere.precio = precioFilter;
  }

  return baseWhere;
}

export { findAll, findOne, add, update, remove, sanitizeCargaInput };
