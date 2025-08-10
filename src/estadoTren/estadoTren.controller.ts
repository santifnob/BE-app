import { Request, Response, NextFunction } from 'express'
import { EstadoTren } from './estadoTren.entity.js'
import { orm } from '../shared/db/orm.js'
import { Tren } from '../tren/tren.entity.js'

const em = orm.em

function sanitizeEstadoInput (req: Request, res: Response, next: NextFunction): void {
  req.body.sanitizedInput = {
    fechaVigencia: req.body.fechaVigencia,
    nombre: req.body.nombre,
    idTren: req.body.idTren
  }
  // more checks here

  req.body.sanitizedInput = Object.fromEntries(
    Object.entries(req.body.sanitizedInput).filter(([_, value]) => value !== undefined)
  )
  next()
}

async function findAll (req: Request, res: Response): Promise<void> {
  try {
    const estados = await em.find(EstadoTren, {}, { populate: ['tren'] })
    res.status(200).json({ message: 'Listado de los estados de tren: ', data: estados })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener el listado de los estados de tren', error: error.message })
  }
}

async function findOne (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const estado = await em.findOneOrFail(EstadoTren, { id }, { populate: ['tren'] }
    )
    res.status(200).json({ message: 'El "Estado de tren" ha sido encontrado: ', data: estado })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener el "Estado de tren"', error: error.message })
  }
}

async function add (req: Request, res: Response): Promise<void> {
  try {
    const idTren = Number.parseInt(req.body.sanitizedInput.idTren)
    const tren = await em.findOneOrFail(Tren, { id: idTren })
    req.body.sanitizedInput.tren = tren
    const estado = em.create(EstadoTren, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'El "Estado de tren" ha sido cargado con exito: ', data: estado })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al agregar el "Estado de tren"', error: error.message })
  }
}

async function update (req: Request, res: Response): Promise<void> {
  try {
    if (req.body.sanitizedInput.idTren !== undefined) {
      const idTren = Number.parseInt(req.body.sanitizedInput.idTren)
      const tren = await em.findOneOrFail(Tren, { id: idTren })
      req.body.sanitizedInput.tren = tren
      req.body.sanitizedInput.idTren = undefined
    }

    const id = Number.parseInt(req.params.id)
    const estadoToUpdate = await em.findOneOrFail(EstadoTren, { id })
    em.assign(estadoToUpdate, req.body.sanitizedInput)
    await em.flush()
    Object.assign(req.body.sanitizedInput, estadoToUpdate) // esto porque sino estadoUpdated no muestra los datos del conductor
    res.status(200).json({ message: 'El "Estado de tren" ha sido actualizado con exito: ', data: req.body.sanitizedInput })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al actualizar el "Estado de tren"', error: error.message })
  }
}

async function remove (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const estado = await em.findOneOrFail(EstadoTren, { id })
    await em.removeAndFlush(estado)
    res.status(200).json({ message: 'El "Estado de tren" ha sido eliminado con exito: ', data: estado })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al eliminar el "Estado de tren"', error: error.message })
  }
}

export { sanitizeEstadoInput, findAll, findOne, add, update, remove }
