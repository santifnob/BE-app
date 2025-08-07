import { Cascade, Collection, Entity, OneToMany, Property } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { EstadoTren } from '../estadoTren/estadoTren.entity.js'
import { Viaje } from '../viaje/viaje.entity.js'

@Entity()
export class Tren extends BaseEntity {
  @Property({ nullable: false })
    color!: string

  @Property({ nullable: false })
    modelo!: string

  @OneToMany(() => EstadoTren, (estado) => estado.tren, { cascade: [Cascade.ALL] })
    estadosTren = new Collection<EstadoTren>(Tren)

  @OneToMany(() => Viaje, (viaje) => viaje.tren, { cascade: [Cascade.ALL] })
    viajes = new Collection<Viaje>(this)

  @Property({ nullable: false })
    estado!: string
}
