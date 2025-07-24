import { Request, Response, NextFunction } from 'express'
import { CategoriaDenuncia } from './categoriaDenuncia.entity.js'
import { orm } from '../shared/db/orm.js'

const em = orm.em

function sanitizeRecorridoInput (req: Request, res: Response, next: NextFunction): void {
  req.body.sanitizedInput = {
    descripcion: req.body.descripcion,
    titulo: req.body.titulo
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
    const catsDenuncia = await em.find(CategoriaDenuncia, {})
    res.status(200).json({ message: 'Categorias encontradas', data: catsDenuncia })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function findOne (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const catDenuncia = await em.findOneOrFail(CategoriaDenuncia, { id })
    res.status(200).json({ message: 'Categoria encontrada', data: catDenuncia })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function add (req: Request, res: Response): Promise<void> {
  try {
    const catDenuncia = em.create(CategoriaDenuncia, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({ message: 'Categoria creada', data: catDenuncia })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function update (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const catDenuncia = await em.findOneOrFail(CategoriaDenuncia, { id })
    em.assign(catDenuncia, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({ message: 'Categoria actualizada', data: catDenuncia })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const catDenuncia = em.getReference(CategoriaDenuncia, id)
    await em.removeAndFlush(catDenuncia)
    res.status(200).json({ message: 'Categoria con codigo ' + req.params.id + ' eliminada con exito' })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export { sanitizeRecorridoInput, findAll, findOne, add, update, remove }
