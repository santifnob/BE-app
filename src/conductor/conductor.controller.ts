import { NextFunction, Request, Response } from 'express'
import { orm } from '../shared/db/orm.js'
import { Conductor } from './conductor.entity.js'

const em = orm.em

function sanitizeConductorInput (req: Request, res: Response, next: NextFunction): void {
  req.body.sanitizedInput = {
    name: req.body.name,
    apellido: req.body.apellido
  }

  req.body.sanitizedInput = Object.fromEntries(
    Object.entries(req.body.sanitizedInput).filter(([_, value]) => value !== undefined)
  )
  next()
}

async function findAll (req: Request, res: Response): Promise<void> {
  try {
    console.log('aca')
    const conductores = await em.find(Conductor, {}, { populate: ['licencias', 'viajes'] })
    res.status(200).json({ message: 'Listado de los conductores:', data: conductores })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener el listado de los conductores', error: error.message })
  }
}

async function findOne (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const conductor = await em.findOneOrFail(Conductor, { id }, { populate: ['licencias', 'viajes'] })
    res.status(200).json({ message: 'El "Conductor" ha sido encontrado: ', data: conductor })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener el "Conductor"', error: error.message })
  }
}

async function add (req: Request, res: Response): Promise<void> {
  try {
    const conductor = em.create(Conductor, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'El "Conductor" ha sido cargado con exito: ', data: conductor })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al agregar el "Conductor"', error: error.message })
  }
}

async function update (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const conductor = await em.findOneOrFail(Conductor, { id })
    em.assign(conductor, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({ message: 'El "Conductor" ha sido actualizado con exito: ', data: conductor })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al actualizar el "Conductor"', error: error.message })
  }
}

/* DIFERENCIA
async function update (req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const conductor = em.getReference(Conductor, id)
    em.assign(conductor, req.body)
    await em.flush()
    res.status(200).json({ message: 'conductor actualizado', data: conductor })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
*/

async function remove (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const conductor = await em.findOneOrFail(Conductor, { id })
    await em.removeAndFlush(conductor)
    res.status(200).json({ message: 'El "Conductor" ha sido eliminado con exito: ', data: conductor })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al eliminar el "Condcutor"', error: error.message })
  }
}

export { sanitizeConductorInput, findAll, findOne, add, update, remove }
