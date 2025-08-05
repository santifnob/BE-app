import { Request, Response, NextFunction } from 'express'
import { LineaCarga } from './lineaCarga.entity.js'
import { orm } from '../shared/db/orm.js'
import { Carga } from '../carga/carga.entity.js'

const em = orm.em

function sanitizeLineaCargaInput (req: Request, res: Response, next: NextFunction): void {
  req.body.sanitizedInput = {
    cantidadVagon: req.body.cantidadVagon,
    idCarga: req.body.idCarga
  }
  // more checks here

  req.body.sanitizedInput = Object.fromEntries(
    Object.entries(req.body.sanitizedInput).filter(([_, value]) => value !== undefined)
  )
  next()
}

async function add (req: Request, res: Response): Promise<void> {
  try {
    const idCarga = Number.parseInt(req.body.sanitizedInput.idCarga)
    const carga = await em.findOneOrFail(Carga, { id: idCarga })
    req.body.sanitizedInput.carga = carga
    const lineaCarga = em.create(LineaCarga, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'La lineaCarga ha sido creada con exito: ', data: lineaCarga })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al agregar la lineaCarga', error: error.message })
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

    const id = Number.parseInt(req.params.id)
    const LineaCargaToUpdate = await em.findOneOrFail(LineaCarga, { id })
    em.assign(LineaCargaToUpdate, req.body.sanitizedInput)
    await em.flush()
    Object.assign(req.body.sanitizedInput, LineaCargaToUpdate) // esto porque sino LineaCargaUpdated no muestra los datos del Carga
    res.status(200).json({ message: 'La lineaCarga ha sido actualizada con exito: ', data: LineaCargaToUpdate })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al actualizar la lineaCarga', error: error.message })
  }
}

async function remove (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const lineaCarga = em.getReference(LineaCarga, id)
    await em.removeAndFlush(lineaCarga)
    res.status(200).json({ message: 'La linea de carga ha sido eliminada con exito: ', data: LineaCarga })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al eliminar la linea carga', error: error.message })
  }
}

export { sanitizeLineaCargaInput, add, update, remove }
