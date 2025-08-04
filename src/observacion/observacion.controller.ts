import { Request, Response, NextFunction } from 'express'
import { Observacion } from './observacion.entity.js'
import { CategoriaDenuncia } from '../categoriaDenuncia/categoriaDenuncia.entity.js'
import { orm } from '../shared/db/orm.js'

const em = orm.em

function sanitizeObservacionInput (
  req: Request,
  res: Response,
  next: NextFunction
): void {
  req.body.sanitizedInput = {
    observaciones: req.body.observaciones,
    fecha: req.body.fecha,
    idCategoria: req.body.idCategoria
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
    const observaciones = await em.find(
      Observacion,
      {},
      { populate: ['categoriaDenuncia'] }
    )
    res.status(200).json({ message: 'Observaciones encontradas', data: observaciones })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const observacion = await em.findOneOrFail(
      Observacion,
      { id },
      { populate: ['categoriaDenuncia'] }
    )
    res.status(200).json({ message: 'Observación encontrada', data: observacion })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add (req: Request, res: Response): Promise<void> {
  try {
    const { observaciones, fecha, idCategoria } = req.body.sanitizedInput

    const categoriaDenuncia = await em.findOneOrFail(CategoriaDenuncia, { id: Number(idCategoria) })

    const observacion = em.create(Observacion, {
      observaciones,
      fecha: new Date(fecha),
      categoriaDenuncia
    })

    await em.flush()

    res.status(201).json({ message: 'Observación creada', data: observacion })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
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

    const id = Number.parseInt(req.params.id)
    const observacionToUpdate = await em.findOneOrFail(Observacion, { id })

    em.assign(observacionToUpdate, req.body.sanitizedInput)
    await em.flush()

    Object.assign(req.body.sanitizedInput, observacionToUpdate)
    res.status(200).json({ message: 'Observación actualizada', data: req.body.sanitizedInput })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const observacion = em.getReference(Observacion, id)
    await em.removeAndFlush(observacion)
    res.status(200).json({ message: 'Observación eliminada' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export {
  sanitizeObservacionInput,
  findAll,
  findOne,
  add,
  update,
  remove
}
