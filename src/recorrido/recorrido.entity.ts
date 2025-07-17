import {
  Entity,
  Property
} from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'

@Entity()
export class Recorrido extends BaseEntity {
  @Property({ nullable: false })
    ciudadSalida!: string

  @Property({ nullable: false })
    ciudadLlegada!: string

  @Property({ nullable: false })
    totalKm!: number
}
