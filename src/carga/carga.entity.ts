import { Entity, ManyToOne, OneToMany, Property, Rel, Cascade, Collection } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { LineaCarga } from '../lineaCarga/lineaCarga.entity.js'
import { TipoCarga } from '../tipoCarga/tipoCarga.entity.js'

@Entity()
export class Carga extends BaseEntity {
  @Property({ nullable: false })
    name!: string

  @Property({ nullable: false })
    precio!: number

  @ManyToOne(() => TipoCarga, { nullable: true })
    tipoCarga!: Rel<TipoCarga> | null

  @OneToMany(() => LineaCarga, (lineaCarga) => lineaCarga.carga, { cascade: [Cascade.ALL] })
    lineaCargas = new Collection<LineaCarga>(this)

  @Property({ nullable: false })
    estado!: string
}
