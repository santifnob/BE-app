import { MikroORM } from "@mikro-orm/core";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import { Tren } from "../../tren/tren.entity.js";
import { EstadoTren } from "../../estadoTren/estadoTren.entity.js";
import { Conductor } from "../../conductor/conductor.entity.js";
import { CategoriaDenuncia } from "../../categoriaDenuncia/categoriaDenuncia.entity.js";
import { Carga } from "../../carga/carga.entity.js";
import { Licencia } from "../../licencia/licencia.entity.js";
import { LineaCarga } from "../../lineaCarga/lineaCarga.entity.js";
import { Observacion } from "../../observacion/observacion.entity.js";
import { Recorrido } from "../../recorrido/recorrido.entity.js";
import { TipoCarga } from "../../tipoCarga/tipoCarga.entity.js";
import { Viaje } from "../../viaje/viaje.entity.js";

export const orm = await MikroORM.init({
  entities: [Tren, EstadoTren, Conductor, CategoriaDenuncia, Carga, Licencia, LineaCarga, Observacion, Recorrido, TipoCarga, Viaje],
  entitiesTs: ["src/**/*.entity.ts"],
  dbName: process.env.DB_NAME || "ferrocarril",
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS,
  forceEntityConstructor: true,

  highlighter: new SqlHighlighter(),

  debug: process.env.DB_DEBUG === "true",

  schemaGenerator: {
    // never in production
    disableForeignKeys: true,
    createForeignKeyConstraints: true,
    ignoreSchema: [],
  },
});

export const syncSchema = async (): Promise<void> => {
  const generator = orm.getSchemaGenerator();

  if(process.env.NODE_ENV === "test"){
    await generator.dropSchema()
    await generator.createSchema()
  }
  if(process.env.NODE_ENV !== "production"){
    await generator.updateSchema();
  }
  
};
