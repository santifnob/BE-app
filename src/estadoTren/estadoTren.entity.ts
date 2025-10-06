import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import {
  Property,
  ManyToOne,
  Entity,
  Rel,
  OneToMany,
  Collection,
  Cascade,
} from "@mikro-orm/core";
import { Tren } from "../tren/tren.entity.js";
import { Observacion } from "../observacion/observacion.entity.js";

@Entity()
export class EstadoTren extends BaseEntity {
  @Property({ nullable: false })
  nombre!: string;

  @Property({ nullable: false })
  fechaVigencia!: Date;

  @Property({ nullable: false })
  estado!: string;

  @ManyToOne(() => Tren, { nullable: false })
  tren!: Rel<Tren>;
}
