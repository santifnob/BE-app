import 'reflect-metadata'
import express from 'express'
// IMPORTAR LOS ROUTERS CORRESPONDIENTES
import { orm, syncSchema } from './shared/db/orm.js'
import { RequestContext } from '@mikro-orm/core'
import { recorridoRouter } from './recorrido/recorrido.routes.js'
import { trenRuta } from './tren/tren.ruta.js'
import { conductorRouter } from './conductor/conductor.routes.js'
import { catRouter } from './CategoriaDenuncia/categoriaDenunica.routes.js'
import { tipoCargaRouter } from './tipoCarga/tipoCarga.routes.js'

const app = express()
app.use(express.json())

//
app.use((req, res, next) => {
  RequestContext.create(orm.em, next)
})
//

// routers con app.use('/api/"nombreEntidad"/')
app.use('/api/recorrido', recorridoRouter)
app.use('/api/tren', trenRuta)
app.use('/api/categoriaDenuncia', catRouter)
app.use('/api/tipoCarga', tipoCargaRouter)

app.use('/api/conductor', conductorRouter)

app.use((_, res) => {
  return res.status(404).send({ message: 'Ruta no encontrada' })
}
)

await syncSchema()

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000/')
})
