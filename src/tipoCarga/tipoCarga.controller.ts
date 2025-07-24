import { NextFunction, Request, Response } from 'express'
import { orm } from '../shared/db/orm.js'
import { tipoCarga } from './tipoCarga.entity.js'

const em = orm.em

function sanitizeTipoCargaInput (req: Request, res: Response, next: NextFunction): void {
  req.body.sanitizedInput = {
    name: req.body.name,
    desc: req.body.desc
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
    const tipoCargas = await em.find(tipoCarga, {})
    res.status(200).json({ message: 'Todos los tipos de carga', data: tipoCargas })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const tipoCargas = await em.findOneOrFail(tipoCarga, { id })
    res.status(200).json({ message: 'Tipo de carga encontrado', data: tipoCargas })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add (req: Request, res: Response): Promise<void> {
  try {
    const tipoCargas = em.create(tipoCarga, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'Tipo de carga creado', data: tipoCargas })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const tipoCargas = await em.findOneOrFail(tipoCarga, { id })
    em.assign(tipoCargas, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({ message: 'Tipo de carga actualizado', data: tipoCargas })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

/* DIFERENCIA
async function update (req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const tipoCarga = em.getReference(tipoCarga, id)
    em.assign(tipoCarga, req.body)
    await em.flush()
    res.status(200).json({ message: 'tipoCarga actualizado', data: tipoCarga })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
*/

async function remove (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const tipoCargas = em.getReference(tipoCarga, id)
    await em.removeAndFlush(tipoCargas)
    res.status(200).json({ message: 'Tipo de carga ' + req.params.id + ' eliminado con éxito' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { findAll, findOne, add, update, remove, sanitizeTipoCargaInput }
