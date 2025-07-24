import { Entity, Property } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'

@Entity()
export class Conductor extends BaseEntity {
  @Property({ nullable: false })
    name!: string

  @Property({ nullable: false })
    apellido!: string
}
