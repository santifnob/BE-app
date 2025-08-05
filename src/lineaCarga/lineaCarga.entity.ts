import { Entity, ManyToOne, Property, Rel } from '@mikro-orm/core'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'
import { Carga } from '../carga/carga.entity.js'

@Entity()
export class LineaCarga extends BaseEntity {
  @Property({ nullable: false })
    cantidadVagon!: number

  @ManyToOne(() => Carga, { nullable: false })
    carga!: Rel<Carga>

  // Viaje

//   calcTaraTotal (): number {
//     return this.carga.tara * this.cantidadVagon
//   }
}
