import { Entity, ManyToOne, OneToMany, Property, Rel, Collection, Cascade } from '@mikro-orm/core'
import { Tren } from '../tren/tren.entity.js'
import { Recorrido } from '../recorrido/recorrido.entity.js'
import { Conductor } from '../conductor/conductor.entity.js'
import { LineaCarga } from '../lineaCarga/lineaCarga.entity.js'
import { Observacion } from '../observacion/observacion.entity.js'
import { BaseEntity } from '../shared/db/baseEntity.entity.js'

@Entity()
export class Viaje extends BaseEntity {
  @Property({ nullable: false })
    fechaIni!: Date

  @Property({ nullable: false })
    fechaFin!: Date

  @Property({ nullable: false })
    estado!: string

  @ManyToOne(() => Tren, { nullable: false })
    tren!: Rel<Tren>

  @ManyToOne(() => Recorrido, { nullable: false })
    recorrido!: Rel<Recorrido>

  @ManyToOne(() => Conductor, { nullable: false })
    conductor!: Rel<Conductor>

  @OneToMany(() => LineaCarga, (lineasCarga) => lineasCarga.viaje, { cascade: [Cascade.ALL] })
    lineasCarga = new Collection<LineaCarga>(this)

  @OneToMany(() => Observacion, (observaciones) => observaciones.viaje, { cascade: [Cascade.ALL] })
    observaciones = new Collection<Observacion>(this)
}
