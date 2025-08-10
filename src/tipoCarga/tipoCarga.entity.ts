import { Cascade, Collection, Entity, OneToMany, Property } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Carga } from '../carga/carga.entity.js'

@Entity()
export class TipoCarga extends BaseEntity {
  @Property({ nullable: false })
    name!: string

  @Property({ nullable: false })
    desc!: string

  @OneToMany(() => Carga, carga => carga.tipoCarga, { cascade: [Cascade.ALL] })
    cargas = new Collection<Carga>(this)

  @Property({ nullable: false })
    estado!: string
}
