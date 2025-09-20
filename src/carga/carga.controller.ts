import { NextFunction, Request, Response } from 'express'
import { orm } from '../shared/db/orm.js'
import { Carga } from './carga.entity.js'
import { TipoCarga } from '../tipoCarga/tipoCarga.entity.js'

const em = orm.em

function sanitizeCargaInput (req: Request, res: Response, next: NextFunction): void {
  req.body.sanitizedInput = {
    name: req.body.name,
    tara: req.body.tara,
    idTipoCarga: req.body.idTipoCarga
  }

  req.body.sanitizedInput = Object.fromEntries(
    Object.entries(req.body.sanitizedInput).filter(([_, value]) => value !== undefined)
  )
  next()
}

/*async function findAll (req: Request, res: Response): Promise<void> {
  try {
    const carga = await em.find(Carga, {}, { populate: ['lineaCargas', 'tipoCarga'] }) // sacar despues lineasCargas
    res.status(200).json({ message: 'Listado de las cargas: ', data: carga })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener el listado de las cargas', error: error.message })
  }
}*/

async function findAll (req: Request, res: Response): Promise<void> {
  try {
    const limitParam = Number(req.query.limit)
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 10

    const cursorParam = req.query.cursor
    const cursor = cursorParam !== undefined && cursorParam !== null ? Number(cursorParam) : null

    const where = cursor ? { id: { $lt: cursor } } : {}

    let cargas = await em.find(Carga, where, {
      orderBy: { id: 'desc' },       // mismos criterios de orden
      limit: limit + 1,               // pedimos uno extra
      // populate: ['linea', 'paradas'], // <-- SOLO si necesitás relaciones
    })

    const hasNextPage = cargas.length > limit
    cargas = cargas.slice(0, limit)

    res.status(200).json({
      message: 'Listado de las cargas',
      items: cargas,
      nextCursor: hasNextPage ? cargas.at(-1)!.id : null,
      hasNextPage,
    })
  } catch (error: any) {
    res.status(500).json({
      message: 'Error al obtener el listado de las cargas',
      error: error.message,
    })
  }
}

async function findOne (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const carga = await em.findOneOrFail(Carga, { id }, { populate: ['lineaCargas', 'tipoCarga'] }) // sacar despues lineasCargas
    res.status(200).json({ message: 'La "Carga" ha sido encontrada: ', data: carga })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al obtener la "Carga"', error: error.message })
  }
}

async function add (req: Request, res: Response): Promise<void> {
  try {
    console.log('aca')
    const idTipoCarga = Number.parseInt(req.body.sanitizedInput.idTipoCarga)
    const tp = await em.findOneOrFail(TipoCarga, { id: idTipoCarga })
    req.body.sanitizedInput.tipoCarga = tp
    const carga = em.create(Carga, req.body.sanitizedInput)
    await em.flush()
    res.status(201).json({ message: 'La "Carga" ha sido creada con exito: ', data: carga })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al agregar la "Carga"', error: error.message })
  }
}

async function update (req: Request, res: Response): Promise<void> {
  try {
    if (req.body.sanitizedInput.idTipoCarga !== undefined) {
      const idTipoCarga = Number.parseInt(req.body.sanitizedInput.idTipoCarga)
      const tipoCarga = await em.findOneOrFail(TipoCarga, { id: idTipoCarga })
      req.body.sanitizedInput.tipoCarga = tipoCarga
      req.body.sanitizedInput.idTipoCarga = undefined
    }

    const id = Number.parseInt(req.params.id)
    const carga = await em.findOneOrFail(Carga, { id })
    em.assign(carga, req.body.sanitizedInput)
    await em.flush()
    res.status(200).json({ message: 'La "Carga" ha sido actualizada con exito: ', data: carga })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al actualizar la "Carga"', error: error.message })
  }
}

/* DIFERENCIA
async function update (req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const Carga = em.getReference(Carga, id)
    em.assign(Carga, req.body)
    await em.flush()
    res.status(200).json({ message: 'Carga actualizado', data: Carga })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
*/

async function remove (req: Request, res: Response): Promise<void> {
  try {
    const id = Number.parseInt(req.params.id)
    const carga = await em.findOneOrFail(Carga, { id })
    await em.removeAndFlush(carga)
    res.status(200).json({ message: 'La "Carga" ha sido eliminada con exito: ', data: carga })
  } catch (error: any) {
    res.status(500).json({ message: 'Error al eliminar la "Carga"', error: error.message })
  }
}

export { findAll, findOne, add, update, remove, sanitizeCargaInput }
