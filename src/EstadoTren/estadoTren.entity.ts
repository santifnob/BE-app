import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Property, ManyToOne, Entity, Rel } from '@mikro-orm/core'
import { Tren } from '../tren/tren.entity.js'

@Entity()
export class EstadoTren extends BaseEntity {
  @Property({ nullable: false })
    nombre!: string

  @Property({ nullable: false })
    fechaVigencia!: Date

  @ManyToOne(() => Tren, { nullable: false })
    tren!: Rel<Tren>
}
