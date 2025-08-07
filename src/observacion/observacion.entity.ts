import { Entity, ManyToOne, Property, Rel } from '@mikro-orm/core'
import { CategoriaDenuncia } from '../categoriaDenuncia/categoriaDenuncia.entity.js'
import { Viaje } from '../viaje/viaje.entity.js'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'

@Entity()
export class Observacion extends BaseEntity {
  @Property({ nullable: false })
    observaciones!: string

  @Property({ nullable: false })
    fecha!: Date

  @ManyToOne(() => CategoriaDenuncia, { nullable: false })
    categoriaDenuncia!: Rel<CategoriaDenuncia>

  @ManyToOne(() => Viaje, { nullable: false })
    viaje!: Rel<Viaje>
}
