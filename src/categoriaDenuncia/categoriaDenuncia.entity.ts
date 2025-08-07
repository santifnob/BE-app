import { Entity, OneToMany, Property, Collection, Cascade } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Observacion } from '../observacion/observacion.entity.js'

@Entity()
export class CategoriaDenuncia extends BaseEntity {
  @Property({ nullable: false })
    titulo!: string

  @Property({ nullable: false })
    descripcion!: string

  @OneToMany(() => Observacion, (observaciones) => observaciones.categoriaDenuncia, { cascade: [Cascade.ALL] })
    observaciones = new Collection<Observacion>(this)

  @Property({ nullable: false })
    estado!: string
}
