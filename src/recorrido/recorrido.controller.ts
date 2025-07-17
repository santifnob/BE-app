import { Request, Response, NextFunction } from 'express'
import { Recorrido } from './recorrido.entity.js'
import { orm } from '../shared/db/orm.js'

const em = orm.em

function sanitizeRecorridoInput (req: Request, res: Response, next: NextFunction): void {
  req.body.sanitizedInput = {
    ciudadSalida: req.body.ciudadSalida,
    ciudadLlegada: req.body.ciudadLlegada,
    totalKm: req.body.totalKm
  }

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      req.body.sanitizedInput[key] = undefined
    }
  })

  next()
}

async function findAll (req: Request, res: Response): Promise<void> {
  try {
    const recorridos = await em.find(Recorrido, {})
    res.status(200).json({ message: 'Recorridos encontrados', data: recorridos })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const recorrido = await em.findOneOrFail(Recorrido, { id })
    res.status(200).json({ message: 'Recorrido encontrado', data: recorrido })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add (req: Request, res: Response): Promise<void> {
  try {
    const recorrido = em.create(Recorrido, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({ message: 'Recorrido creado', data: recorrido })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const recorrido = await em.findOneOrFail(Recorrido, { id })
    em.assign(recorrido, req.body.sanitizedInput)
    await em.flush
    res.status(200).json({ message: 'Recorrido actualizado', data: recorrido })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const recorrido = em.getReference(Recorrido, id)
    await em.removeAndFlush(recorrido)
    res.status(200).json({ message: 'Recorrido con id ' + req.params.id + ' eliminado con exito' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { sanitizeRecorridoInput, findAll, findOne, add, update, remove }
