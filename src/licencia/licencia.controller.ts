import { Request, Response, NextFunction } from "express";
import { Licencia } from "./licencia.entity.js";
import { orm } from "../shared/db/orm.js";
import { Conductor } from "../conductor/conductor.entity.js";
import { getInfiniteScroll } from "../shared/utils/pagination.js";
import { BaseWhere } from "../shared/utils/baseWhereFunctions.js";

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
  const baseWhere: BaseWhere = new BaseWhere();

  baseWhere.setExactStringFilter("estado", req.query.estado as string | undefined);
  baseWhere.setIdFilter(req.query.id as string | undefined);
  baseWhere.setForeignKeyFilter("conductor", req.query.conductorId as string | undefined);
  baseWhere.setDateRangeFilter("fechaHecho", req.query.fechaHechoIni as any, req.query.fechaHechoFin as any);
  baseWhere.setDateRangeFilter("fechaVencimiento", req.query.fechaVencimientoIni as any, req.query.fechaVencimientoFin as any);
  baseWhere.setDateRangeFilter("createdAt", req.query.fechaCreacionIni as any, req.query.fechaCreacionFin as any);

  // Special handling for conductorNombreYApellido - search in both nombre and apellido
  if (req.query.conductorNombreYApellido && typeof req.query.conductorNombreYApellido === 'string') {
    const value = req.query.conductorNombreYApellido.trim();
    if (value) {
      baseWhere.$or = [
        { conductor: { nombre: { $like: `%${value}%` } } },
        { conductor: { apellido: { $like: `%${value}%` } } }
      ];
    }
  }

  return baseWhere;
}

export { sanitizeLicenciaInput, findAll, findOne, add, update, remove };
