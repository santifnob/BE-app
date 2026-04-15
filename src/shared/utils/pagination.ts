import { EntityManager, FilterQuery } from '@mikro-orm/core';
import { Request } from 'express';

// Interfaz para la respuesta paginada
export interface PaginatedResponse<T> {
  message: string;
  items: T[];
  nextCursor: number | null;
  hasNextPage: boolean;
}

// Interfaz para los argumentos de nuestra función
export interface InfiniteScrollOptions<T> {
  req: Request;
  em: EntityManager;
  entity: any; // La clase de la entidad (ej: Viaje, Observacion)
  message?: string;
  populate?: string[]; 
  baseWhere?: FilterQuery<T>; // Para pasar filtros adicionales si los hay
  defaultLimit?: number;
  maxLimit?: number;
}

// Asumimos que tus entidades tienen un 'id' numérico para el cursor
export async function getInfiniteScroll<T extends { id?: any }>(
  options: InfiniteScrollOptions<T>
): Promise<PaginatedResponse<T>> {
  const {
    req,
    em,
    entity,
    message = 'Listado obtenido con éxito',
    populate = [],
    baseWhere = {} as FilterQuery<T>,
    defaultLimit = 10,
    maxLimit = 100
  } = options;

  // 1. Parseo seguro del límite (usando tu lógica de Viajes)
  const limitParam = Number(req.query.limit);
  const limit = Number.isFinite(limitParam) && limitParam > 0
    ? Math.min(limitParam, maxLimit)
    : defaultLimit;

  // 2. Parseo del cursor
  const cursorParam = req.query.cursor;
  const cursor = cursorParam !== undefined && cursorParam !== null
    ? Number(cursorParam)
    : null;

  // 3. Construcción dinámica del Where
  // Combinamos los filtros base que pases con la lógica del cursor
  const safeBaseWhere = (baseWhere && typeof baseWhere === 'object') ? baseWhere : {};
  const where: FilterQuery<T> = cursor
    ? { $and: [safeBaseWhere, { id: { $lt: cursor } }] } as FilterQuery<T>
    : safeBaseWhere;

  // 4. Búsqueda en la base de datos
  // casteamos para evitar errores de tipo con las keys dinámicas de MikroORM
  let items = await em.find<T>(entity, where, {
    populate: populate as any,
    orderBy: { id: 'desc' } as any,
    limit: limit + 1,
  });

  // 5. Cálculo de la siguiente página
  const hasNextPage = items.length > limit;
  if (hasNextPage) {
    items = items.slice(0, limit);
  }

  // Obtenemos el ID del último elemento para el próximo cursor
  const lastItem = items.at(-1);
  const nextCursor = hasNextPage && lastItem ? (lastItem.id as number) : null;

  return {
    message,
    items,
    nextCursor,
    hasNextPage,
  };
}