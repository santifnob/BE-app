import "reflect-metadata";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import 'dotenv/config.js'; 
import dotenv from "dotenv";
import { trenRouter } from "./tren/tren.routes.js";
import { orm, syncSchema } from "./shared/db/orm.js";
import { RequestContext } from "@mikro-orm/core";
import { recorridoRouter } from "./recorrido/recorrido.routes.js";
import { tipoCargaRouter } from "./tipoCarga/tipoCarga.routes.js";
import { conductorRouter } from "./conductor/conductor.routes.js";
import { cargaRouter } from "./carga/carga.routes.js";
import { licenciaRouter } from "./licencia/licencia.routes.js";
import { estadoTrenRouter } from "./estadoTren/estadoTren.routes.js";
import { catRouter } from "./categoriaDenuncia/categoriaDenuncia.routes.js";
import { observacionRouter } from "./observacion/observacion.routes.js";
import { lineaCargaRouter } from "./lineaCarga/lineaCarga.routes.js";
import { analyticsRouter } from "./analytics/analytics.routes.js";
import { viajeRouter } from "./viaje/viaje.routes.js";
import { authenticateToken, authorizeRole } from "./middlewares/authMiddlewares.js";
import { findOneByMail } from "./conductor/conductor.controller.js";

if (process.env.NODE_ENV === "test" && process.env.DB_NAME !== "ferrocarril_test") {
  throw new Error("La DB utilizada no es la correcta para los tests. Db utilizada: " + process.env.DB_NAME);
}

dotenv.config({
  path: process.env.NODE_ENV === "test" ? ".env.test" : ".env" // Carga diferentes .env según si estamos en test o desarrollo/producción (principalmente se diferencian las bases de datos)
})

const PORT = process.env.PORT || 3000;
export const SECRET_KEY = process.env.SECRET_KEY || "llavetemporal"; // variables que se deberian guardar en un archivo .env
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASS = process.env.ADMIN_PASS;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const COOKIE_MAX_AGE = process.env.COOKIE_MAX_AGE ? Number.parseInt(process.env.COOKIE_MAX_AGE) : 3600000

const app = express();
app.use(express.json());
app.use(cookieParser()); // Middleware para parsear las cookies entrantes

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["POST", "GET", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Permite enviar cookies,
  })
);

app.use((req, res, next) => {
  RequestContext.create(orm.em, next);
});

// Los middlewares authenticateToken y authorizeRol se deberían utilziar por cada ruta que arranca con api para producción

if(process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test"){ // También se quiere probar que la autenticación funcione en los tests de integración
  app.use("/api", authenticateToken);
}

app.use("/api/analytics", analyticsRouter); // Solo el admin puede acceder a las rutas de analytics
app.use("/api/carga", cargaRouter);
app.use("/api/categoriaDenuncia", catRouter);
app.use("/api/lineaCarga", lineaCargaRouter);
app.use("/api/conductor", conductorRouter);
app.use("/api/estadoTren", estadoTrenRouter);
app.use("/api/licencia", licenciaRouter);
app.use("/api/observacion", observacionRouter);
app.use("/api/recorrido", recorridoRouter); 
app.use("/api/tipoCarga", tipoCargaRouter); 
app.use("/api/tren", trenRouter); 
app.use("/api/viaje", viajeRouter); 

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body.user;
  let user = null;

  if (email !== ADMIN_EMAIL) {
    const conductor = await findOneByMail(email);
    user = conductor
      ? {
          id: conductor.id,
          role: "conductor",
          email: conductor.email,
          password: conductor.password,
          estado: conductor.estado,
        }
      : undefined;
  } else {
    user = {
      id: 0,
      role: "admin",
      password: ADMIN_PASS,
      email: ADMIN_EMAIL,
      estado: "Activo",
    };
  }

  if (
    user &&
    email === user.email &&
    password === user.password &&
    user.estado === "Activo"
  ) {
    const token = jwt.sign({ userId: user.id, role: user.role }, SECRET_KEY, {
      expiresIn: COOKIE_MAX_AGE / 1000,
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: IS_PRODUCTION, // en caso de false se mantiene sin https
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE, // 1 hora
    });

    return res
      .status(200)
      .json({
        message: "Login exitoso",
        userData: { id: user.id, role: user.role },
      });
  }

  if (user?.estado === "Inactivo")
    return res.status(401).json({ message: "Falta validar el usuario" });

  return res
    .status(401)
    .json({ message: "Los datos ingresados son incorrectos" });
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.status(200).json({ message: "Logout exitoso" });
});

app.get("/api/auth/check", authenticateToken, (req, res) => {
  return res
    .status(200)
    .json({ message: "Token valido", userData: req.body.user }); // Validacion justamente hecha en el middleware authenticateToken
});

app.use((_, res) => {
  return res.status(404).json({ message: "Ruta no encontrada" });
});

if(process.env.NODE_ENV !== "production"){
  await syncSchema(); // nunca en produccion
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/`);
  console.log(`CORS enabled for: ${FRONTEND_URL}`);
});

export { app }; // exportar instancia de app para usar en los test de integración