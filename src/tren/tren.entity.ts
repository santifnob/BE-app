import { Entity, Property } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'

@Entity()
export class Tren extends BaseEntity {
  @Property({ nullable: false })
    color!: string

  @Property({ nullable: false })
    modelo!: string
}
