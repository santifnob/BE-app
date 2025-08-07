import { Entity, ManyToOne, OneToMany, Property, Rel, Cascade, Collection } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { LineaCarga } from '../lineaCarga/lineaCarga.entity.js'
import { TipoCarga } from '../tipoCarga/tipoCarga.entity.js'

@Entity()
export class Carga extends BaseEntity {
  @Property({ nullable: false })
    name!: string

  @Property({ nullable: false })
    tara!: number

  @ManyToOne(() => TipoCarga, { nullable: false })
    tipoCarga!: Rel<TipoCarga>

  @OneToMany(() => LineaCarga, (lineaCarga) => lineaCarga.carga, { cascade: [Cascade.ALL] })
    lineaCargas = new Collection<LineaCarga>(this)

  @Property({ nullable: false })
    estado!: string
}
