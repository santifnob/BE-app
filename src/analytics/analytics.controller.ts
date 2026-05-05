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
    where v.estado = "Activo"
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
    where v.estado in ("Activo", "Pendiente") and v.fecha_ini >= now() and datediff(v.fecha_ini, now()) <= 7;
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

export async function earningsConductor(req: Request, res: Response): Promise<void> {
  try {
    const result = await em.execute(` select c.id, concat(c.nombre, " ", c.apellido) as conductor, sum(lc.cantidad_vagon * ca.precio) as earnings from conductor c 
    inner join viaje v
      on v.conductor_id = c.id
    inner join linea_carga lc
      on lc.viaje_id = v.id 
    inner join carga ca
      on ca.id = lc.carga_id
    where v.estado = "Activo"
    group by c.id, c.nombre, c.apellido
    order by earnings desc;`) 
    res
      .status(200)
      .json({ message: 'Ganancias por conductor: ', result });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error al obtener las ganancias por conductor', error: error.message });
  }  
}

export async function kilometersConductor(req: Request, res: Response): Promise<void> { 
  try {
    const result = await em.execute(` select c.id, concat(c.nombre, " ", c.apellido) as conductor, sum(r.total_km) as kilometers from conductor c
    inner join viaje v
      on v.conductor_id = c.id
    inner join recorrido r
      on r.id = v.recorrido_id
    where v.estado = "Activo"
    group by c.id, c.nombre, c.apellido
    order by kilometers desc;`)
    res
      .status(200)
      .json({ message: 'Kilometros recorridos por conductor: ', result });
  } catch (error: any) {
    res      .status(500)
      .json({ message: 'Error al obtener los kilometros por conductor', error: error.message });
  } 
}

export async function lastLicenseConductor(req: Request, res: Response): Promise<void> {
  try {
    const result = await em.execute(` select c.id, concat(c.nombre, " ", c.apellido) as conductor, l.fecha_vencimiento from conductor c
    inner join licencia l
  on l.conductor_id = c.id
where l.fecha_hecho = (
  select max(fecha_hecho) from licencia
    where estado = "Activo" and fecha_hecho <= now() and conductor_id = c.id
);`)
    res
      .status(200)
      .json({ message: 'Fecha de vencimiento de la última licencia por conductor: ', result });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error al obtener la fecha de vencimiento de la última licencia por conductor', error: error.message });
  }
}

export async function nextTripConductor(req: Request, res: Response): Promise<void> {
  try {
    const result = await em.execute(` select c.id, concat(c.nombre, " ", c.apellido) as conductor, v.fecha_ini from conductor c
    inner join viaje v
      on v.conductor_id = c.id
where v.estado in ("Activo", "Pendiente") and v.fecha_ini >= now()
order by v.fecha_ini asc;`)
    res
      .status(200)
      .json({ message: 'Fecha del próximo viaje por conductor: ', result });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error al obtener la fecha del próximo viaje por conductor', error: error.message });
  } 
}

export async function tripChartConductor(req: Request, res: Response): Promise<void> {
  try {
    const result = await em.execute(` select c.id, concat(c.nombre, " ", c.apellido) as conductor, count(v.id) as trips from conductor c
    inner join viaje v
      on v.conductor_id = c.id  
where v.estado = "Activo"
group by c.id, c.nombre, c.apellido
order by trips desc;`)
    res
      .status(200)
      .json({ message: 'Cantidad de viajes por conductor: ', result });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error al obtener la cantidad de viajes por conductor', error: error.message });
  } 
}

export async function cargoDistribution(req: Request, res: Response): Promise<void> {
  try {
    const result = await em.execute(`
    select 
        tp.id, 
        tp.name as categoryName, 
        sum(lc.cantidad_vagon) as wagonCount,
        sum(sum(lc.cantidad_vagon)) over () as totalWagonCount,
        (sum(c.precio * lc.cantidad_vagon) / sum(sum(c.precio * lc.cantidad_vagon)) over ()) * 100 as revenuePercentage
    from tipo_carga tp
    inner join carga c on c.tipo_carga_id = tp.id
    inner join linea_carga lc on lc.carga_id = c.id
    inner join viaje v on lc.viaje_id = v.id 
    where tp.estado = 'Activo' 
      and c.estado = 'Activo' 
      and lc.estado = 'Activo'
      and v.estado = 'Activo' 
    group by tp.id, tp.name
    order by wagonCount desc
    limit 5;
      `)
    res
      .status(200)
      .json({ message: 'Distribucion de las tipo cargas: ', result });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error al obtener la distribucion de las tipo cargas', error: error.message });
  } 
}

export async function cancellationRiskStats(req: Request, res: Response): Promise<void> {
  try {
    const rows = await em.execute(`
select 
    *,
    case 
        when (rate_recent - rate_previous) > 0 then concat('+', round(rate_recent - rate_previous, 1), '%')
        else concat(round(rate_recent - rate_previous, 1), '%')
    end as trend
from (
    select 
        concat(r.ciudad_salida, "-", r.ciudad_llegada) as routeName,
        count(v.id) as routeTripsCount,
        -- tasa de cancelación histórica 
        (sum(case when v.estado in ('inactivo', 'rechazado') then 1 else 0 end) * 100.0 / count(v.id)) as rate,
        
        -- tasa de los últimos 30 días
        (sum(case when v.estado in ('inactivo', 'rechazado') and v.fecha_ini >= date_sub(now(), interval 30 day) then 1 else 0 end) * 100.0 / 
         nullif(sum(case when v.fecha_ini >= date_sub(now(), interval 30 day) then 1 else 0 end), 0)) as rate_recent,
        
        -- tasa de los 30 días anteriores (del día 60 al 30)
        (sum(case when v.estado in ('inactivo', 'rechazado') and v.fecha_ini between date_sub(now(), interval 60 day) and date_sub(now(), interval 31 day) then 1 else 0 end) * 100.0 / 
         nullif(sum(case when v.fecha_ini between date_sub(now(), interval 60 day) and date_sub(now(), interval 31 day) then 1 else 0 end), 0)) as rate_previous,

        -- totales globales 
        sum(count(v.id)) over () as tripsCount,
        (sum(sum(case when v.estado in ('inactivo', 'rechazado') then 1 else 0 end)) over () * 100.0 / 
         sum(count(v.id)) over ()) as overallRate
    from viaje v
    inner join recorrido r on v.recorrido_id = r.id
    group by r.id, r.ciudad_salida, r.ciudad_llegada
) as base_query
where rate > 5
order by rate desc;
      `)

    const result = rows.length === 0 ? { overallRate: 0, topRiskRoutes: [], tripsCount: 0 } : {
      
      overallRate: parseFloat(Number(rows[0].overallRate).toFixed(1)),
      tripsCount: Number(rows[0].tripsCount),
      
      topRiskRoutes: rows.map(row => 
        ({
        routeName: row.routeName,
        rate: parseFloat(Number(row.rate).toFixed(1)),
        trend: row.trend || "--" 
      }))
    };

    res
      .status(200)
      .json({ message: 'Riesgo de cancelacion del viaje: ', result });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error al obtener las estadisticas del riesgo de cancelacion', error: error.message });
  } 
}

