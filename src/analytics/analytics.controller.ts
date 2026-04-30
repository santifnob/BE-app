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
	select max(fecha_vigencia) from estado_tren where estado = "Activo" and tren_id = t.id and fecha_vigencia <= now()
)
group by et.nombre;`)
    res
      .status(200)
      .json({ message: 'Estadisticas de la flota: ', result });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error al obtener las stats de la flota', error: error.message });
  }
}

export async function TripPerformanceStats(req: Request, res: Response): Promise<void> {
  try {
    const withObs = await em.execute(`select count(*) as total
      from viaje v
      where v.estado = 'Activo' 
        and v.fecha_fin <= NOW() 
        and exists (SELECT 1 FROM observacion WHERE viaje_id = v.id);`)

    const result = await em.execute(`select 
        count(*) - ? AS withoutObs, 
        ? AS withObs
    from viaje
    where estado = 'Activo' 
      and fecha_fin <= now();`, [withObs[0].total, withObs[0].total])
    res
      .status(200)
      .json({ message: 'Estadisticas del viaje: ', result });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error al obtener las stats del viaje', error: error.message });
  }
}

export async function licenseExpirationAlert(req: Request, res: Response): Promise<void> {
  try {
    const result = await em.execute(`
      select c.nombre, c.apellido, l.id as licencia_id, l.fecha_vencimiento, datediff(fecha_vencimiento, now()) daysLeft from conductor c
      inner join licencia l
        on l.conductor_id = c.id
      where l.fecha_hecho = (
        select max(fecha_hecho) from licencia 
          where estado = "Activo" and fecha_hecho <= now() and fecha_vencimiento > now() and conductor_id = c.id and datediff(fecha_vencimiento, now()) < 30
      );
      `)
    // devuelve objeto: { nombre: string, apellido: string, licencia_id: number, fecha_vencimiento: Date, daysLeft: number }[]
    res
      .status(200)
      .json({ message: 'Alerta de licencias por vencer: ', result });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error al obtener las licencias por vencer', error: error.message });
  }
}

export async function routeProfitabilityStats(req: Request, res: Response): Promise<void> {
  try {
    const rows = await em.execute(`
    with top_recorridos as (
      select r.id, r.ciudad_salida, r.ciudad_llegada, r.total_km,count(distinct v.id) cant_viajes from viaje v
      inner join recorrido r
        on r.id = v.recorrido_id
      where v.fecha_ini <= now()
      group by r.id
      order by cant_viajes desc
      limit 5
    )
    select tr.id, tr.ciudad_salida, tr.ciudad_llegada, tr.total_km, tr.cant_viajes,sum(c.precio * lc.cantidad_vagon) / tr.total_km as "rendimiento_km_recorrido" from viaje v
    inner join top_recorridos tr
      on v.recorrido_id = tr.id
    inner join linea_carga lc
      on lc.viaje_id = v.id
    inner join carga c
      on c.id = lc.carga_id
    group by tr.id, tr.ciudad_salida, tr.ciudad_llegada, tr.total_km;
          ;
      `)
    
    const result = rows.map((item) => ({
      id: item.id,
      routeName: `${item.ciudad_salida} - ${item.ciudad_llegada}`,
      profitPerKm: Number(
        item.rendimiento_km_recorrido
      ).toFixed(2),
      tripsCount: item.cant_viajes,
    })); // Mejor formatearlo desde la consulta SQL, pero lo dejo así para mostrar el mapeo a un formato específico

    res
      .status(200)
      .json({ message: 'Rentabilidad por Ruta: ', result });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error al obtener las stats de rentabilidad', error: error.message });
  }
}

export async function upcomingTrips(req: Request, res: Response): Promise<void> {
  try {
    const result = await em.execute(`
    select v.id, v.fecha_ini fechaIni, concat(r.ciudad_salida, " - ",r.ciudad_llegada) recorrido, concat(c.nombre, " ", c.apellido) conductor, t.modelo tren, v.estado from viaje v
    inner join recorrido r
      on r.id = v.recorrido_id
    inner join conductor c
      on c.id = v.conductor_id
    inner join tren t
      on t.id = v.tren_id
    where v.estado in ("Activo", "Pendiente") and v.fecha_ini >= now() and datediff(v.fecha_ini, now()) <= 30;
      `)

    res
      .status(200)
      .json({ message: 'Viajes próximos: ', result });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error al obtener las stats de rentabilidad', error: error.message });
  }
}