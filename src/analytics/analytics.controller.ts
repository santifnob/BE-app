import { Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { SqlEntityManager } from "@mikro-orm/mysql";

const em = orm.em as SqlEntityManager

export async function fleetStats(req: Request, res: Response): Promise<void> {
  try {
    const result = await em.execute(`select et.nombre as stateName, count(*) as stateCount from tren t
inner join estado_tren et
	on et.tren_id = t.id
where et.fecha_vigencia = (
	select max(fecha_vigencia) from estado_tren where tren_id = t.id and fecha_vigencia <= now()
)
group by et.nombre;`)
    res
      .status(200)
      .json({ message: 'Estadisticas de la flota: ', data: result });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error al obtener las stats de la flota', error: error.message });
  }
}