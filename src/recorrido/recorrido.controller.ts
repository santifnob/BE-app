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

  req.body.sanitizedInput = Object.fromEntries(
    Object.entries(req.body.sanitizedInput).filter(([_, value]) => value !== undefined)
  )
  next()
}

async function findAll (req: Request, res: Response): Promise<void> {
  try {
    const limitParam = Number(req.query.limit)
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 10

    const cursorParam = req.query.cursor
    const cursor = cursorParam !== undefined && cursorParam !== null ? Number(cursorParam) : null

    const where = cursor ? { id: { $lt: cursor } } : {}

    let recorridos = await em.find(Recorrido, where, {
      orderBy: { id: 'desc' },       // mismos criterios de orden
      limit: limit + 1,               // pedimos uno extra
      // populate: ['linea', 'paradas'], // <-- SOLO si necesitás relaciones
    })

    const hasNextPage = recorridos.length > limit
    recorridos = recorridos.slice(0, limit)

    res.status(200).json({
      message: 'Listado de los recorridos',
      items: recorridos,
      nextCursor: hasNextPage ? recorridos.at(-1)!.id : null,
      hasNextPage,
    })
  } catch (error: any) {
    res.status(500).json({
      message: 'Error al obtener el listado de los recorridos',
      error: error.message,
    })
  }
}


async function findOne (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const recorrido = await em.findOneOrFail(Recorrido, { id })
    res.status(200).json({ message: 'El "Recorrido" ha sido encontrado: ', data: recorrido })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener el recorrido', error: error.message })
  }
}

async function add (req: Request, res: Response): Promise<void> {
  try {
    const recorrido = em.create(Recorrido, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({ message: 'El "Recorrido" ha sido cargado con exito: ', data: recorrido })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al agregar el "recorrido"', error: error.message })
  }
}

async function update (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const recorrido = await em.findOneOrFail(Recorrido, { id })
    em.assign(recorrido, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({ message: 'El "Recorrido" ha sido actualizado con exito: ', data: recorrido })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

async function remove (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const recorrido = await em.findOneOrFail(Recorrido, { id })
    await em.removeAndFlush(recorrido)
    res.status(200).json({ message: 'El "Recorrido" ha sido eliminado con exito: ', data: recorrido })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al eliminar el "Recorrido"', error: error.message })
  }
}

export { sanitizeRecorridoInput, findAll, findOne, add, update, remove }
