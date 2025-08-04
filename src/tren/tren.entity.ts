import { Cascade, Collection, Entity, OneToMany, Property } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { EstadoTren } from '../EstadoTren/estadoTren.entity.js'

@Entity()
export class Tren extends BaseEntity {
  @Property({ nullable: false })
    color!: string

  @Property({ nullable: false })
    modelo!: string

  @OneToMany(() => EstadoTren, (estado) => estado.tren, { cascade: [Cascade.ALL] })
    estadosTren = new Collection<EstadoTren>(Tren)
}
