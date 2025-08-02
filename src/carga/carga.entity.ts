import { Entity, ManyToOne, Property, Rel } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { TipoCarga } from '../tipoCarga/tipoCarga.entity.js'

@Entity()
export class Carga extends BaseEntity {
  @Property({ nullable: false })
    name!: string

  @Property({ nullable: false })
    tara!: number

  @ManyToOne(() => TipoCarga, { nullable: false })
    tipoCarga!: Rel<TipoCarga>
}
