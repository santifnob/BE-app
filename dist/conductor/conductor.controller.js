import { orm } from '../shared/db/orm.js';
import { Conductor } from './conductor.entity.js';
const em = orm.em;
function sanitizeConductorInput(req, res, next) {
    req.body.sanitizedInput = {
        name: req.body.name,
        apellido: req.body.apellido
    };
    Object.keys(req.body.sanitizedInput).forEach((key) => {
        if (req.body.sanitizedInput[key] === undefined) {
            req.body.sanitizedInput[key] = undefined;
        }
    });
    next();
}
async function findAll(req, res) {
    try {
        const conductores = await em.find(Conductor, {});
        res.status(200).json({ message: 'Listado de los conductores:', data: conductores });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener el listado de los conductores', error: error.message });
    }
}
async function findOne(req, res) {
    try {
        const id = Number.parseInt(req.params.id);
        const conductor = await em.findOneOrFail(Conductor, { id });
        res.status(200).json({ message: 'El "Conductor" ha sido encontrado: ', data: conductor });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener el "Conductor"', error: error.message });
    }
}
async function add(req, res) {
    try {
        const conductor = em.create(Conductor, req.body.sanitizedInput);
        await em.flush();
        res.status(201).json({ message: 'El "Conductor" ha sido cargado con exito: ', data: conductor });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al agregar el "Conductor"', error: error.message });
    }
}
async function update(req, res) {
    try {
        const id = Number.parseInt(req.params.id);
        const conductor = await em.findOneOrFail(Conductor, { id });
        em.assign(conductor, req.body.sanitizedInput);
        await em.flush();
        res.status(200).json({ message: 'El "Conductor" ha sido actualizado con exito: ', data: conductor });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al actualizar el "Conductor"', error: error.message });
    }
}
/* DIFERENCIA
async function update (req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id)
    const conductor = em.getReference(Conductor, id)
    em.assign(conductor, req.body)
    await em.flush()
    res.status(200).json({ message: 'conductor actualizado', data: conductor })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
*/
async function remove(req, res) {
    try {
        const id = Number.parseInt(req.params.id);
        const conductor = em.getReference(Conductor, id);
        await em.removeAndFlush(conductor);
        res.status(200).json({ message: 'El "Conductor" ha sido eliminado con exito: ', data: conductor });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al eliminar el "Condcutor"', error: error.message });
    }
}
export { sanitizeConductorInput, findAll, findOne, add, update, remove };
//# sourceMappingURL=conductor.controller.js.map