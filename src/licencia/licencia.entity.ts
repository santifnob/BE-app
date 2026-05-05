import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Entity, ManyToOne, Property, Rel } from "@mikro-orm/core";
import { Conductor } from "../conductor/conductor.entity.js";

@Entity()
export class Licencia extends BaseEntity {
  @Property({ nullable: false })
  estado!: string;

  @Property({ nullable: false })
  fechaHecho!: Date;

  @Property({ nullable: true })
  fechaVencimiento!: Date;

  @ManyToOne(() => Conductor, { nullable: false })
  conductor!: Rel<Conductor>;

  validarLicencia(fechaComienzo: Date, fechaFin: Date): Boolean {
    if (this.estado === "Activo" && this.fechaVencimiento > fechaFin && fechaComienzo > this.fechaHecho) {
      return true;
    }
    return false;
  }
}
