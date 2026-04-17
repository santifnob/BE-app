import { Request, Response, NextFunction } from "express";
import { Licencia } from "./licencia.entity.js";
import { orm } from "../shared/db/orm.js";
import { Conductor } from "../conductor/conductor.entity.js";
import { getInfiniteScroll } from "../shared/utils/pagination.js";

const em = orm.em;

function sanitizeLicenciaInput(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.body.sanitizedInput = {
    fechaVencimiento: req.body.fechaVencimiento,
    fechaHecho: req.body.fechaHecho,
    estado: req.body.estado,
    idConductor: req.body.idConductor,
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

    const result = await getInfiniteScroll<Licencia>({
      req,
      em,
      entity: Licencia,
      message: "Listado de licencias:",
      populate: ["conductor"],
      baseWhere
    });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      message: "Error al obtener el listado de licencias",
      error: error.message,
    });
  }
}

async function findOne(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const licencia = await em.findOneOrFail(
      Licencia,
      { id },
      { populate: ["conductor"] }
    );
    res
      .status(200)
      .json({
        message: 'La "Licencia de conductor" ha sido encontrada: ',
        data: licencia,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al obtener la "Licencia de conductor"',
        error: error.message,
      });
  }
}

async function add(req: Request, res: Response): Promise<void> {
  try {
    const input = req.body.sanitizedInput;

    // Validación de campos obligatorios
    if (
      !input?.estado ||
      !input?.fechaHecho ||
      !input?.fechaVencimiento ||
      !input?.idConductor
    ) {
      res.status(400).json({
        message:
          "Campos requeridos: estado, fechaHecho, fechaVencimiento, idConductor",
      });
      return;
    }

    const data: any = {
      estado: String(input.estado),
      fechaHecho: new Date(input.fechaHecho),
      fechaVencimiento: new Date(input.fechaVencimiento),
    };

    // Si vino idConductor válido, lo seteamos
    const idConductor = Number(input.idConductor);
    if (Number.isFinite(idConductor)) {
      // getReference evita query extra; si querés validar existencia, usa findOneOrFail
      data.conductor = em.getReference(Conductor, idConductor);
    }

    const licencia = em.create(Licencia, data);
    await em.flush();

    res
      .status(201)
      .json({
        message: 'La "Licencia de conductor" ha sido creada con éxito',
        data: licencia,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al agregar la "Licencia de conductor"',
        error: error.message,
      });
  }
}

async function update(req: Request, res: Response): Promise<void> {
  try {
    if (req.body.sanitizedInput.idConductor !== undefined) {
      const idConductor = Number.parseInt(req.body.sanitizedInput.idConductor);
      const conductor = await em.findOneOrFail(Conductor, { id: idConductor });
      req.body.sanitizedInput.conductor = conductor;
      req.body.sanitizedInput.idConductor = undefined;
    }
    const id = Number.parseInt(req.params.id);
    const licenciaToUpdate = await em.findOneOrFail(Licencia, { id });

    em.assign(licenciaToUpdate, req.body.sanitizedInput);
    await em.flush();
    Object.assign(req.body.sanitizedInput, licenciaToUpdate); // esto porque sino licenciaUpdated no muestra los datos del conductor
    res
      .status(200)
      .json({
        message: 'La "Licencia de conductor" ha sido actualizada con exito: ',
        data: licenciaToUpdate,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al actualizar la "Licencia de conductor"',
        error: error.message,
      });
  }
}

async function remove(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const licencia = await em.findOneOrFail(Licencia, { id });
    await em.removeAndFlush(licencia);
    res
      .status(200)
      .json({
        message: 'La "Licencia de conductor" ha sido eliminada con exito: ',
        data: licencia,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al eliminar la "Licencia de conductor"',
        error: error.message,
      });
  }
}

function buildBaseWhere(req: Request): any {
  const baseWhere:any = {};
  if(req.query.estado && typeof req.query.estado === 'string') {
    const estado = req.query.estado.trim();
    if(estado.length > 0) {
      baseWhere.estado = estado;
    }
  }

  const fechaHechoIni = req.query.fechaHechoIni ? new Date(req.query.fechaHechoIni as string) : null;
  const fechaHechoFin = req.query.fechaHechoFin ? new Date(req.query.fechaHechoFin as string) : null;
  if (fechaHechoIni !== null || fechaHechoFin !== null) {
    const fechaHechoFilter: any = {};
    if (fechaHechoIni !== null) {
      fechaHechoFilter.$gte = fechaHechoIni;
    }
    if (fechaHechoFin !== null) {
      fechaHechoFilter.$lte = fechaHechoFin;
    }
    baseWhere.fechaHecho = fechaHechoFilter;
  }
  
  const fechaVencimientoIni = req.query.fechaVencimientoIni ? new Date(req.query.fechaVencimientoIni as string) : null;
  const fechaVencimientoFin = req.query.fechaVencimientoFin ? new Date(req.query.fechaVencimientoFin as string) : null;
  if (fechaVencimientoIni !== null || fechaVencimientoFin !== null) {
    const fechaVencimientoFilter: any = {};
    if (fechaVencimientoIni !== null) {
      fechaVencimientoFilter.$gte = fechaVencimientoIni;
    }
    if (fechaVencimientoFin !== null) {
      fechaVencimientoFilter.$lte = fechaVencimientoFin;
    }
    baseWhere.fechaVencimiento = fechaVencimientoFilter;
  }

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

  if(req.query.id && !isNaN(Number(req.query.id))) {
    baseWhere.id = Number(req.query.id);
  }

  if(req.query.conductorId && !isNaN(Number(req.query.conductorId))) {    
    const conductor: Conductor = new Conductor();
    conductor.id = Number(req.query.conductorId); 
    baseWhere.conductor = conductor;
  }

  return baseWhere
}

export { sanitizeLicenciaInput, findAll, findOne, add, update, remove };
