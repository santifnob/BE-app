import 'reflect-metadata'
import express from 'express'
// IMPORTAR LOS ROUTERS CORRESPONDIENTES
import { orm, syncSchema } from './shared/db/orm.js'
import { RequestContext } from '@mikro-orm/core'

const app = express()
app.use(express.json())

app.use((req, res, next) => {
  RequestContext.create(orm.em, next)
})

// routers con app.use('/api/"nombreEntidad"/')

app.use((_, res) => {
  return res.status(404).send({ message: 'Resource not found' })
})

await syncSchema() // nunca en produccion

app.listen(3000, () => {
  console.log('Server runnning on http://localhost:3000/')
})
