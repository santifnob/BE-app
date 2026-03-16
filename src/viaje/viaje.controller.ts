import { Request, Response, NextFunction } from "express";
import { Viaje } from "./viaje.entity.js";
import { orm } from "../shared/db/orm.js";
import { Tren } from "../tren/tren.entity.js";
import { Recorrido } from "../recorrido/recorrido.entity.js";
import { Conductor } from "../conductor/conductor.entity.js";
import { getInfiniteScroll } from "../shared/utils/pagination.js";
import { EstadoTren } from "../estadoTren/estadoTren.entity.js";

const em = orm.em;

function sanitizeViajeInput(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.body.sanitizedInput = {
    fechaIni: req.body.fechaIni,
    fechaFin: req.body.fechaFin,
    estado: req.body.estado,
    idTren: req.body.idTren,
    idRecorrido: req.body.idRecorrido,
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
    const result = await getInfiniteScroll<Viaje>({
      req,
      em,
      entity: Viaje,
      message: "Listado de viajes:",
      populate: [
        "tren",
        "recorrido",
        "conductor",
        "lineasCarga",
        "observaciones",
      ], // Hay que ver todavia que hacemos con respecto a que relaciones mostramos
    });

    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({
      message: "Error al obtener el listado de observaciones",
      error: error.message,
    });
  }
}

async function findOne(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const viaje = await em.findOneOrFail(
      Viaje,
      { id },
      {
        populate: [
          "tren",
          "recorrido",
          "conductor",
          "lineasCarga",
          "observaciones",
        ],
      }
    );
    res
      .status(200)
      .json({ message: 'El "Viaje" ha sido encontrado: ', data: viaje });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error al obtener el "Viaje"', error: error.message });
  }
}

async function add(req: Request, res: Response): Promise<void> {
  try {
    const fechaFin = new Date(req.body.sanitizedInput.fechaFin);
    const fechaIni = new Date(req.body.sanitizedInput.fechaIni);
    
    const idTren = Number.parseInt(req.body.sanitizedInput.idTren);
    const tren = await em.findOneOrFail(Tren, { id: idTren } , { populate: ["viajes"] });
    req.body.sanitizedInput.tren = tren;
    
    if(await tren.tieneViajeEntre(fechaIni, fechaFin)){
      res.status(400).json({ message: 'El tren ya tiene un viaje programado entre esas fechas' });
      return;
    }

    // Validación de estado del tren: debe estar disponible en la fecha de inicio
    const estadoTren = await em.findOne(EstadoTren, { tren: tren, estado: "Activo",fechaVigencia: { $lte: fechaIni } }, { orderBy: { fechaVigencia: 'DESC' } });
    if (!estadoTren || estadoTren.nombre !== "Disponible") {
      res.status(400).json({ message: 'El tren no esta disponible en la fecha de inicio del viaje' });
      return;
    }
    
    const idRecorrido = Number.parseInt(req.body.sanitizedInput.idRecorrido);
    const recorrido = await em.findOneOrFail(Recorrido, { id: idRecorrido });
    req.body.sanitizedInput.recorrido = recorrido;

    const idConductor = Number.parseInt(req.body.sanitizedInput.idConductor);
    const conductor = await em.findOneOrFail(Conductor, { id: idConductor }, {populate : ["licencias", "viajes"]});
    req.body.sanitizedInput.conductor = conductor;

    if(await !conductor.tieneLicenciaValida(fechaIni, fechaFin) || conductor.estado !== "Activo"){
      res.status(400).json({ message: 'El conductor no tiene una licencia valida o no esta activo' });
      return;
    }
    if(await conductor.tieneViajeEntre(fechaIni, fechaFin)){
      res.status(400).json({ message: 'El conductor ya tiene un viaje programado entre esas fechas' });
      return;
    }

    const viaje = em.create(Viaje, req.body.sanitizedInput);
    await em.flush();
    res
      .status(201)
      .json({ message: 'El "Viaje" ha sido creado con exito: ', data: viaje });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error al agregar el "Viaje"', error: error.message });
  }
}

async function update(req: Request, res: Response): Promise<void> {
  try { 
    const fechaFin = new Date(req.body.sanitizedInput.fechaFin);
    const fechaIni = new Date(req.body.sanitizedInput.fechaIni);

    if (req.body.sanitizedInput.idViaje !== undefined) {
      const idViaje = Number.parseInt(req.body.sanitizedInput.idViaje);
      const viaje = await em.findOneOrFail(Viaje, { id: idViaje });
      req.body.sanitizedInput.viaje = viaje;
      req.body.sanitizedInput.idViaje = undefined;
    }

    if (req.body.sanitizedInput.idRecorrido !== undefined) {
      const idRecorrido = Number.parseInt(req.body.sanitizedInput.idRecorrido);
      const recorrido = await em.findOneOrFail(Recorrido, { id: idRecorrido });
      req.body.sanitizedInput.recorrido = recorrido;
      req.body.sanitizedInput.idRecorrido = undefined;
    }

    if (req.body.sanitizedInput.idConductor !== undefined) {
      const idConductor = Number.parseInt(req.body.sanitizedInput.idConductor);
      const conductor = await em.findOneOrFail(Conductor, { id: idConductor }, { populate: ["licencias", "viajes"] });
      req.body.sanitizedInput.conductor = conductor;
      req.body.sanitizedInput.idConductor = undefined;

      if(await !conductor.tieneLicenciaValida(fechaIni, fechaFin)){
      res.status(400).json({ message: 'El conductor no tiene una licencia valida' });
      return;
      } 
      if(await conductor.tieneViajeEntre(fechaIni, fechaFin)){
        res.status(400).json({ message: 'El conductor ya tiene un viaje programado entre esas fechas' });
        return;
      }
    }

    if (req.body.sanitizedInput.idTren !== undefined) {
      const idTren = Number.parseInt(req.body.sanitizedInput.idTren);
      const tren = await em.findOneOrFail(Tren, { id: idTren }, { populate: ["viajes"] });
      req.body.sanitizedInput.tren = tren;
      req.body.sanitizedInput.idTren = undefined;

      if(await tren.tieneViajeEntre(fechaIni, fechaFin)){
      res.status(400).json({ message: 'El tren ya tiene un viaje programado entre esas fechas' });
      return;
    }

      // Validación de estado del tren: debe estar disponible en la fecha de inicio
      const estadoTren = await em.findOne(EstadoTren, { tren: tren, estado: "Activo", fechaVigencia: { $lte: fechaIni } }, { orderBy: { fechaVigencia: 'DESC' } });
      if (!estadoTren || estadoTren.nombre !== "Disponible") {
        res.status(400).json({ message: 'El tren no esta disponible en la fecha de inicio del viaje' });
        return;
      }
    }

    const id = Number.parseInt(req.params.id);
    const ViajeToUpdate = await em.findOneOrFail(Viaje, { id });

    em.assign(ViajeToUpdate, req.body.sanitizedInput);
    await em.flush();
    Object.assign(req.body.sanitizedInput, ViajeToUpdate); // esto porque sino ViajeUpdated no muestra los datos del viaje
    res
      .status(200)
      .json({
        message: 'La "Viaje de viaje" ha sido actualizada con exito: ',
        data: ViajeToUpdate,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({
        message: 'Error al actualizar la "Viaje de viaje"',
        error: error.message,
      });
  }
}

async function remove(req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id);
    const viaje = await em.findOneOrFail(
      Viaje,
      { id },
      { populate: ["observaciones", "lineasCarga"] }
    );
    await em.removeAndFlush(viaje);
    res
      .status(200)
      .json({
        message: 'El "Viaje" ha sido eliminado con exito: ',
        data: viaje,
      });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error al eliminar la "Viaje"', error: error.message });
  }
}

export { sanitizeViajeInput, findAll, findOne, remove, add, update }; // ADD y UPDATE
