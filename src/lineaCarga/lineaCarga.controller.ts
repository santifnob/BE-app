import { Request, Response, NextFunction } from 'express'
import { LineaCarga } from './lineaCarga.entity.js'
import { orm } from '../shared/db/orm.js'
import { Carga } from '../carga/carga.entity.js'
import { Viaje } from '../viaje/viaje.entity.js'

const em = orm.em

function sanitizeLineaCargaInput (req: Request, res: Response, next: NextFunction): void {
  req.body.sanitizedInput = {
    cantidadVagon: req.body.cantidadVagon,
    idCarga: req.body.idCarga,
    idViaje: req.body.idViaje
  }
  // more checks here

  req.body.sanitizedInput = Object.fromEntries(
    Object.entries(req.body.sanitizedInput).filter(([_, value]) => value !== undefined)
  )
  next()
}

async function findAll (req: Request, res: Response): Promise<void> {
  try {

    const limit = Number(req.query.limit) || 10
    const cursor = req.query.cursor ? Number(req.query.cursor) : null;    
    const where = cursor ? { id: { $lt: cursor } } : {} 

    let lineaCargas = await em.find(LineaCarga, where, {
      populate: ['carga', 'viaje', 'viaje.recorrido',  'carga.precio'], // posiblemente necesitemos 'carga.precio'
      orderBy: { id: 'desc' },       // mismos criterios de orden
      limit: limit + 1,               // pedimos uno extra
    })
    
    const hasNextPage = lineaCargas.length > limit
    lineaCargas = lineaCargas.slice(0, limit)
    res.status(200).json({
      message: 'Listado de las lineas de carga',
      items: lineaCargas,
      nextCursor: hasNextPage ? lineaCargas.at(-1)!.id : null,
      hasNextPage,
    })
  } catch (error: any) {
    res.status(500).json({
      message: 'Error al obtener el listado de las lineas de carga',
      error: error.message,
    })
  }
}

async function findOne (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id) 
    const lineaCarga = await em.findOneOrFail(LineaCarga, { id }, { populate: ['carga', 'viaje', 'viaje.recorrido'] }
    )
    res.status(200).json({ message: 'La "Linea de carga" ha sido encontrada: ', data: lineaCarga })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener la "Linea de carga"', error: error.message })
  } 
}

async function add (req: Request, res: Response): Promise<void> {
  try {
    const idCarga = Number.parseInt(req.body.sanitizedInput.idCarga)
    const carga = await em.findOneOrFail(Carga, { id: idCarga })
    req.body.sanitizedInput.carga = carga

    const idViaje = Number.parseInt(req.body.sanitizedInput.idViaje)
    const viaje = await em.findOneOrFail(Viaje, { id: idViaje })
    req.body.sanitizedInput.viaje = viaje

    const lineaCarga = em.create(LineaCarga, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'La "Linea de carga" ha sido creada con exito: ', data: lineaCarga })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener la "Linea de carga"', error: error.message })
  }
}

async function update (req: Request, res: Response): Promise<void> {
  try {
    if (req.body.sanitizedInput.idCarga !== undefined) {
      const idCarga = Number.parseInt(req.body.sanitizedInput.idCarga)
      const carga = await em.findOneOrFail(Carga, { id: idCarga })
      req.body.sanitizedInput.carga = carga
      req.body.sanitizedInput.idCarga = undefined
    }

    if (req.body.sanitizedInput.idViaje !== undefined) {
      const idViaje = Number.parseInt(req.body.sanitizedInput.idViaje)
      const viaje = await em.findOneOrFail(Viaje, { id: idViaje })
      req.body.sanitizedInput.viaje = viaje
      req.body.sanitizedInput.idViaje = undefined
    }

    const id = Number.parseInt(req.params.id)
    const LineaCargaToUpdate = await em.findOneOrFail(LineaCarga, { id })
    em.assign(LineaCargaToUpdate, req.body.sanitizedInput)
    await em.flush()
    Object.assign(req.body.sanitizedInput, LineaCargaToUpdate) // esto porque sino LineaCargaUpdated no muestra los datos del Carga
    res.status(200).json({ message: 'La "Linea de carga" ha sido actualizada con exito: ', data: LineaCargaToUpdate })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al actualizar la "Linea de carga"', error: error.message })
  }
}

async function remove (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const lineaCarga = await em.findOneOrFail(LineaCarga, { id })
    await em.removeAndFlush(lineaCarga)
    res.status(200).json({ message: 'La "Linea de carga" ha sido eliminada con exito: ', data: lineaCarga })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al eliminar la "Linea de carga"', error: error.message })
  }
}

export { sanitizeLineaCargaInput, add, update, remove, findAll, findOne }
