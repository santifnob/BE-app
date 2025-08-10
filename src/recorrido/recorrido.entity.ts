import { Entity, Property, OneToMany, Cascade, Collection } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Viaje } from '../viaje/viaje.entity.js'

@Entity()
export class Recorrido extends BaseEntity {
  @Property({ nullable: false })
    ciudadSalida!: string

  @Property({ nullable: false })
    ciudadLlegada!: string

  @Property({ nullable: false })
    totalKm!: number

  @OneToMany(() => Viaje, (viajes) => viajes.recorrido, { cascade: [Cascade.ALL] })
    viajes = new Collection<Viaje>(this)

  @Property({ nullable: false })
    estado!: string
}
