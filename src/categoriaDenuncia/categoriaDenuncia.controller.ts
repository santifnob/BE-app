import { Request, Response, NextFunction } from 'express'
import { CategoriaDenuncia } from './categoriaDenuncia.entity.js'
import { orm } from '../shared/db/orm.js'

const em = orm.em

function sanitizeRecorridoInput (req: Request, res: Response, next: NextFunction): void {
  req.body.sanitizedInput = {
    descripcion: req.body.descripcion,
    titulo: req.body.titulo
  }

  req.body.sanitizedInput = Object.fromEntries(
    Object.entries(req.body.sanitizedInput).filter(([_, value]) => value !== undefined)
  )

  next()
}

async function findAll (req: Request, res: Response): Promise<void> {
  try {
    const catsDenuncia = await em.find(CategoriaDenuncia, {}, { populate: ['observaciones'] })
    res.status(200).json({ message: 'Listado de las categorias de denuncia: ', data: catsDenuncia })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener el listado de las categorias de denuncia', error: error.messagee })
  }
}

async function findOne (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const catDenuncia = await em.findOneOrFail(CategoriaDenuncia, { id }, { populate: ['observaciones'] })
    res.status(200).json({ message: 'La "Categoria de denuncia" ha sido encontrada: ', data: catDenuncia })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener la "Categoria de denuncia"', error: error.message })
  }
}

async function add (req: Request, res: Response): Promise<void> {
  try {
    const catDenuncia = em.create(CategoriaDenuncia, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({ message: 'La "Categoria de denuncia" ha sido creada con exito: ', data: catDenuncia })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al agregar la "Categoria de denuncia"', error: error.message })
  }
}

async function update (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const catDenuncia = await em.findOneOrFail(CategoriaDenuncia, { id })
    em.assign(catDenuncia, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({ message: 'La "Categoria de denuncia" ha sido actualizada con exito: ', data: catDenuncia })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al actualizar la "Categoria de denuncia"', error: error.message })
  }
}

async function remove (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const catDenuncia = await em.findOneOrFail(CategoriaDenuncia, { id }, { populate: ['observaciones'] })
    await em.removeAndFlush(catDenuncia)
    res.status(200).json({ message: 'La "Categoria de denuncia" ha sido eliminada con exito: ', data: catDenuncia })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al eliminar la "Categoria de denuncia"', error: error.message })
  }
}

export { sanitizeRecorridoInput, findAll, findOne, add, update, remove }
