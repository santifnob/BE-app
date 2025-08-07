import { Request, Response, NextFunction } from 'express'
import { Observacion } from './observacion.entity.js'
import { CategoriaDenuncia } from '../categoriaDenuncia/categoriaDenuncia.entity.js'
import { orm } from '../shared/db/orm.js'
import { Viaje } from '../viaje/viaje.entity.js'

const em = orm.em

function sanitizeObservacionInput (req: Request, res: Response, next: NextFunction): void {
  req.body.sanitizedInput = {
    observaciones: req.body.observaciones,
    fecha: req.body.fecha,
    idCategoria: req.body.idCategoria,
    idViaje: req.body.idViaje
  }

  req.body.sanitizedInput = Object.fromEntries(
    Object.entries(req.body.sanitizedInput).filter(([_, value]) => value !== undefined)
  )
  next()
}

async function findAll (req: Request, res: Response): Promise<void> {
  try {
    const observaciones = await em.find(Observacion, {}, { populate: ['categoriaDenuncia', 'viaje'] })
    res.status(200).json({ message: 'Listado de las observaciones: ', data: observaciones })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener el listado de las observaciones', error: error.message })
  }
}

async function findOne (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const observacion = await em.findOneOrFail(
      Observacion,
      { id },
      { populate: ['categoriaDenuncia', 'viaje'] }
    )
    res.status(200).json({ message: 'La "Observacion" ha sido encontrada: ', data: observacion })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener la "Observacion"', error: error.message })
  }
}

async function add (req: Request, res: Response): Promise<void> {
  try {
    const categoriaDenuncia = await em.findOneOrFail(CategoriaDenuncia, { id: Number(req.body.sanitizedInput.idCategoria) })
    req.body.sanitizedInput.categoriaDenuncia = categoriaDenuncia

    const viaje = await em.findOneOrFail(Viaje, { id: Number(req.body.sanitizedInput.idViaje) })
    req.body.sanitizedInput.viaje = viaje

    const observacion = em.create(Observacion, req.body.sanitizedInput)

    await em.flush()

    res.status(201).json({ message: 'La "Observacion" ha sido creada con exito: ', data: observacion })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al agregar la "Observacion"', error: error.message })
  }
}

async function update (req: Request, res: Response): Promise<void> {
  try {
    if (req.body.sanitizedInput.idCategoria !== undefined) {
      const idCategoria = Number.parseInt(req.body.sanitizedInput.idCategoria)
      const categoria = await em.findOneOrFail(CategoriaDenuncia, { id: idCategoria })
      req.body.sanitizedInput.categoria = categoria
      req.body.sanitizedInput.idCategoria = undefined
    }

    if (req.body.sanitizedInput.idViaje !== undefined) {
      const idViaje = Number.parseInt(req.body.sanitizedInput.idViaje)
      const viaje = await em.findOneOrFail(Viaje, { id: idViaje })
      req.body.sanitizedInput.viaje = viaje
      req.body.sanitizedInput.idViaje = undefined
    }

    const id = Number.parseInt(req.params.id)
    const observacionToUpdate = await em.findOneOrFail(Observacion, { id })

    em.assign(observacionToUpdate, req.body.sanitizedInput)
    await em.flush()

    Object.assign(req.body.sanitizedInput, observacionToUpdate)
    res.status(200).json({ message: 'La "Observacion" ha sido actualizada con exito: ', data: req.body.sanitizedInput })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al actualizar la "Observacion"', error: error.message })
  }
}

async function remove (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const observacion = await em.findOneOrFail(Observacion, { id })
    await em.removeAndFlush(observacion)
    res.status(200).json({ message: 'La "Observacion" ha sido eliminada con exito: ' })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al eliminar la "Observacion"', error: error.message })
  }
}

export { sanitizeObservacionInput, findAll, findOne, add, update, remove }
