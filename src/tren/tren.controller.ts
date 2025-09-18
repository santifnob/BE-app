import { Request, Response, NextFunction } from 'express'
import { Tren } from './tren.entity.js'
import { orm } from '../shared/db/orm.js'

const em = orm.em

function sanitizarTrenInput (req: Request, res: Response, next: NextFunction): void {
  req.body.sanitizarInput = {
    color: req.body.color,
    modelo: req.body.modelo
  }

  req.body.sanitizarInput = Object.fromEntries(
    Object.entries(req.body.sanitizarInput).filter(([_, value]) => value !== undefined)
  )
  next()
}

async function findAll (req: Request, res: Response): Promise<void> {
  try {
    
    const limit = Number(req.body.limit) || 10
    const cursor = req.body.cursor ? Number(req.body.cursor) : null

    // Condición para traer solo registros después del cursor
    const where = cursor ? { id: { $gt: cursor } } : {}

    let trenes = await em.find(Tren, where, {
      populate: ['estadosTren'],
      orderBy: { id: 'asc' },
      limit: limit + 1, // pedimos uno más para saber si hay next page
    })

    // Detectamos si hay más páginas
    const hasNextPage = trenes.length > limit
    trenes = trenes.slice(0, limit) // en caso de que haya uno más, lo descartamos

    const trenesConEstado = trenes.map((tren) => {
      const estados = tren.estadosTren || []
      const lastEstado = estados.toArray().sort((e1, e2) => {
        return e2.fechaVigencia.getTime() - e1.fechaVigencia.getTime()
      })[0]
      return { ...tren, estadoActual: lastEstado}
    })

    res.status(200).json({ message: 'Listado de los trenes: ', items: trenesConEstado, nextCursor: hasNextPage ? trenesConEstado.at(-1)!.id : null, hasNextPage })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener el listado de los trenes', error: error.message })
  }
}

async function findOne (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const tren = await em.findOneOrFail(Tren, id, { populate: ['estadosTren'] })
    res.status(200).json({ message: 'El "Tren" ha sido encontrado: ', data: tren })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener el "Tren"', error: error.message })
  }
}

async function add (req: Request, res: Response): Promise<void> {
  try {
    const tren = em.create(Tren, req.body.sanitizarInput)
    await em.flush()
    res.status(201).json({ message: 'El "Tren" ha sido cargado con exito: ', data: tren })
    // await em.persistAndFlush(tren);
  } catch (error: any) {
    res.status(500).json({ message: 'Error al agregar el "Tren"', error: error.message })
  }
}

async function update (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const tren = await em.findOneOrFail(Tren, { id })
    em.assign(tren, req.body.sanitizarInput)
    await em.flush()
    res.status(200).json({ message: 'El "Tren" ha sido actualizado con exito: ', data: tren })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al actualizar el "Tren"', error: error.message })
  }
}

async function remove (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const tren = await em.findOneOrFail(Tren, { id })
    await em.removeAndFlush(tren)
    res.status(200).json({ message: 'El "Tren" ha sido eliminado con exito: ', data: tren })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al eliminar el "Tren"', error: error.message })
  }
}

export { sanitizarTrenInput, findAll, findOne, add, update, remove }
