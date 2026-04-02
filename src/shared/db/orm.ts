import { MikroORM } from "@mikro-orm/core";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";

export const orm = await MikroORM.init({
  entities: ["dist/**/*.entity.js"],
  entitiesTs: ["src/**/*.entity.ts"],
  dbName: process.env.DB_NAME || "ferrocarril",
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS,

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
