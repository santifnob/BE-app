import 'reflect-metadata'
import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import cookieParser from 'cookie-parser'
import { trenRouter } from './tren/tren.routes.js'
import { orm, syncSchema } from './shared/db/orm.js'
import { RequestContext } from '@mikro-orm/core'
import { recorridoRouter } from './recorrido/recorrido.routes.js'
import { tipoCargaRouter } from './tipoCarga/tipoCarga.routes.js'
import { conductorRouter } from './conductor/conductor.routes.js'
import { cargaRouter } from './carga/carga.routes.js'
import { licenciaRouter } from './licencia/licencia.routes.js'
import { estadoTrenRouter } from './estadoTren/estadoTren.routes.js'
import { catRouter } from './categoriaDenuncia/categoriaDenunica.routes.js'
import { observacionRouter } from './observacion/observacion.routes.js'
import { lineaCargaRouter } from './lineaCarga/lineaCarga.routes.js'
import { viajeRouter } from './viaje/viaje.routes.js'
import { authenticateToken } from './middlewares/authMiddlewares.js'
import { findOneByMail } from './conductor/conductor.controller.js'

const app = express()
app.use(express.json())
app.use(cookieParser()) // Middleware para parsear las cookies entrantes

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['POST', 'GET', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Permite enviar cookies,
}))

app.use((req, res, next) => {
  RequestContext.create(orm.em, next)
})

app.use('/api/carga', cargaRouter) // Gonza
app.use('/api/categoriaDenuncia', catRouter) // Carlos
app.use('/api/lineaCarga', lineaCargaRouter) // Santi
app.use('/api/conductor', conductorRouter) // Carlos
app.use('/api/estadoTren', estadoTrenRouter) // Santi
app.use('/api/licencia', licenciaRouter) // Santi
app.use('/api/observacion', observacionRouter) // Carlos
app.use('/api/recorrido', recorridoRouter) // Santi
app.use('/api/tipoCarga', tipoCargaRouter) // Gonza
app.use('/api/tren', authenticateToken, trenRouter) // Gonza
app.use('/api/viaje', viajeRouter) // Todos

export const secretKey = 'llaveTemporal' // variables que se deberian guardar en un archivo .env
const ADMIN_EMAIL = 'admin@admin.com'
const ADMIN_PASS = 'admin'

// test para el login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body.user
  let user = null

  if (email !== ADMIN_EMAIL) {
    const conductor = await findOneByMail(email) 
    user = conductor? { id: conductor.id, role: 'conductor', email: conductor.email, password: conductor.password, estado: conductor.estado } : undefined 
  } else { user = { id: 0, role: 'admin', password: ADMIN_PASS, email: ADMIN_EMAIL , estado:'Activo'} }

  if (user && email === user.email && password === user.password && user.estado === 'Activo') {
    const token = jwt.sign({ userId: user.id, role: user.role }, secretKey, { expiresIn: '1h' })

    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // por ahora se mantiene sin https
      sameSite: 'lax',
      maxAge: 3600000 // 1 hora
    })
    
    return res.status(200).json({ message: 'Login exitoso', userData: { id: user.id, role: user.role } })
  }

  if(user?.estado === 'Inactivo') return res.status(401).json({message: 'Falta validar el usuario'})

  return res.status(401).json({ message: 'Los datos ingresados son incorrectos' })
})

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  })

  res.status(200).json( { message: 'Logout exitoso'} )
})

app.get('/api/auth/check', authenticateToken, (req, res) => {
  return res.status(200).json({ message: 'Token valido', userData: req.body.user}) // Validacion justamente hecha en el middleware authenticateToken
})

app.use((_, res) => {
  return res.status(404).json({ message: 'Ruta no encontrada' })
}
)

await syncSchema() // nunca en produccion

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000/')
})
