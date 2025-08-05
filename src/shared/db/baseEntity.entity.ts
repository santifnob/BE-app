import { PrimaryKey, Property, DateTimeType } from '@mikro-orm/core'

export abstract class BaseEntity {
  @PrimaryKey()
    id?: number

  @Property({ type: DateTimeType, nullable: true })
    createdAt? = new Date()

  @Property({
    type: DateTimeType,
    onUpdate: () => new Date(),
    nullable: true
  })
    updatedAt? = null
}
