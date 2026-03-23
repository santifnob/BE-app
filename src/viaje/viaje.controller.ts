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
      message: "Error al obtener el listado de viajes",
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
    
    const estadoAlInicio = await em.findOne(EstadoTren, { 
      tren: tren, 
      estado: "Activo", 
      fechaVigencia: { $lte: fechaIni } 
    }, { orderBy: { fechaVigencia: 'DESC' } });

    if (!estadoAlInicio || estadoAlInicio.nombre !== "Disponible") {
      res.status(400).json({ 
        message: `El tren no está disponible al inicio del viaje (Estado actual: ${estadoAlInicio?.nombre || 'Sin estado'})` 
      });
      return;
    }

    // Validar si hay algún cambio de estado "prohibido" DURANTE el viaje
    const cambioDuranteViaje = await em.findOne(EstadoTren, {
      tren: tren,
      estado: "Activo",
      nombre: { $ne: "Disponible" }, // Buscamos cualquier cosa que NO sea disponible
      fechaVigencia: { 
        $gt: fechaIni,
        $lte: fechaFin  
      }
    });

    if (cambioDuranteViaje) {
      res.status(400).json({ 
        message: `Conflicto de disponibilidad: el tren pasará a estado '${cambioDuranteViaje.nombre}' el día ${cambioDuranteViaje.fechaVigencia}` 
      });
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

    const idViaje = Number.parseInt(req.body.sanitizedInput.idViaje);
    const viaje = await em.findOneOrFail(Viaje, { id: idViaje });
    req.body.sanitizedInput.viaje = viaje;
    req.body.sanitizedInput.idViaje = undefined;


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
      if(await conductor.tieneViajeEntre(fechaIni, fechaFin, idViaje)){
        res.status(400).json({ message: 'El conductor ya tiene un viaje programado entre esas fechas' });
        return;
      }
    }

    if (req.body.sanitizedInput.idTren !== undefined) {
      const idTren = Number.parseInt(req.body.sanitizedInput.idTren);
      const tren = await em.findOneOrFail(Tren, { id: idTren }, { populate: ["viajes"] });
      req.body.sanitizedInput.tren = tren;
      req.body.sanitizedInput.idTren = undefined;

      if(await tren.tieneViajeEntre(fechaIni, fechaFin, idViaje)){
        res.status(400).json({ message: 'El tren ya tiene un viaje programado entre esas fechas' });
        return;
      }

      // Validación de estado del tren: debe estar disponible en la fecha de inicio
      const estadoAlInicio = await em.findOne(EstadoTren, { 
      tren: tren, 
      estado: "Activo", 
      fechaVigencia: { $lte: fechaIni } 
        }, { orderBy: { fechaVigencia: 'DESC' } });

      if (!estadoAlInicio || estadoAlInicio.nombre !== "Disponible") {
        res.status(400).json({ 
          message: `El tren no está disponible al inicio del viaje (Estado actual: ${estadoAlInicio?.nombre || 'Sin estado'})` 
        });
        return;
      }

      // Validar si hay algún cambio de estado "prohibido" DURANTE el viaje
      const cambioDuranteViaje = await em.findOne(EstadoTren, {
        tren: tren,
        estado: "Activo",
        nombre: { $ne: "Disponible" }, // Buscamos cualquier cosa que NO sea disponible
        fechaVigencia: { 
          $gt: fechaIni,
          $lte: fechaFin  
        }
      });

      if (cambioDuranteViaje) {
          res.status(400).json({ 
          message: `Conflicto de disponibilidad: el tren pasará a estado '${cambioDuranteViaje.nombre}' el día ${cambioDuranteViaje.fechaVigencia}` 
        })
        return
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

// Mismas validaciones que en add y update, pero para que funcione a momento de completar formulario en FE
async function viajeValidation(req: Request, res: Response): Promise<void> {
    try {
      const inicio = new Date(req.query.inicio as string);
      const fin = new Date(req.query.fin as string);
      const idViajeToEdit = req.query.idViajeToEdit ? Number.parseInt(req.query.idViajeToEdit as string) : undefined;
      
      const idTren = req.query.trenId ? Number.parseInt(req.query.trenId as string) : undefined;
      if(idTren){
        const tren = await em.findOne(Tren, { id: idTren }, { populate: ["viajes"] })
        if (!tren) {
          res.status(400).json({ message: 'Tren no encontrado' });
          return;
        }
        
        if(await tren.tieneViajeEntre(inicio, fin, idViajeToEdit)){
          res.status(400).json({ message: 'El tren ya tiene un viaje programado entre esas fechas' });
          return;    
        }
        
          // Validación de estado del tren: debe estar disponible en la fecha de inicio
        const estadoAlInicio = await em.findOne(EstadoTren, { 
        tren: tren, 
        estado: "Activo", 
        fechaVigencia: { $lte: inicio } 
          }, { orderBy: { fechaVigencia: 'DESC' } });

        if (!estadoAlInicio || estadoAlInicio.nombre !== "Disponible") {
          res.status(400).json({ 
            message: `El tren no está disponible al inicio del viaje (Estado actual: ${estadoAlInicio?.nombre || 'Sin estado'})` 
          });
          return;
        }

        // Validar si hay algún cambio de estado "prohibido" DURANTE el viaje
        const cambioDuranteViaje = await em.findOne(EstadoTren, {
          tren: tren,
          estado: "Activo",
          nombre: { $ne: "Disponible" }, // Buscamos cualquier cosa que NO sea disponible
          fechaVigencia: { 
            $gt: inicio,
            $lte: fin  
          }
        });

        if (cambioDuranteViaje) {
            res.status(400).json({ 
            message: `Conflicto de disponibilidad: el tren pasará a estado '${cambioDuranteViaje.nombre}' el día ${cambioDuranteViaje.fechaVigencia}` 
          })
          return
        }
      }
      
      const idConductor = req.query.conductorId ? Number.parseInt(req.query.conductorId as string) : undefined;
      if(idConductor){
        const conductor = await em.findOne(Conductor, { id: idConductor }, { populate: ["licencias", "viajes"] });
        if (!conductor) {
          res.status(400).json({ message: 'Conductor no encontrado' });
          return;
        }

        if(!(await conductor.tieneLicenciaValida(inicio, fin))){
          res.status(400).json({ message: 'El conductor no tiene una licencia valida' });
          return;
        } 
        if(await conductor.tieneViajeEntre(inicio, fin, idViajeToEdit)){
          res.status(400).json({ message: 'El conductor ya tiene un viaje programado entre esas fechas' });
          return;
        }
      }

      res.status(200).json({ message: 'Validación exitosa' });
    }
    catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error en la validación del "Viaje"', error: error.message });
  }
} 

export { sanitizeViajeInput, findAll, findOne, remove, add, update, viajeValidation }; // ADD y UPDATE
