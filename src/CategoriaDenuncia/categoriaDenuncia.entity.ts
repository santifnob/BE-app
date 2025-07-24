import { Entity, Property } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'

@Entity()
export class CategoriaDenuncia extends BaseEntity {
  @Property({ nullable: false })
    titulo!: string

  @Property({ nullable: false })
    descripcion!: string
}
