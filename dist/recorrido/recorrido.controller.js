import { Recorrido } from './recorrido.entity.js';
import { orm } from '../shared/db/orm.js';
const em = orm.em;
function sanitizeRecorridoInput(req, res, next) {
    req.body.sanitizedInput = {
        ciudadSalida: req.body.ciudadSalida,
        ciudadLlegada: req.body.ciudadLlegada,
        totalKm: req.body.totalKm
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
        const recorridos = await em.find(Recorrido, {});
        res.status(200).json({ message: 'Listado de los recorridos: ', data: recorridos });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener el listado de los recorridos', error: error.message });
    }
}
async function findOne(req, res) {
    try {
        const id = Number.parseInt(req.params.id);
        const recorrido = await em.findOneOrFail(Recorrido, { id });
        res.status(200).json({ message: 'El "Recorrido" ha sido encontrado: ', data: recorrido });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener el recorrido', error: error.message });
    }
}
async function add(req, res) {
    try {
        const recorrido = em.create(Recorrido, req.body.sanitizedInput);
        await em.flush();
        res.status(200).json({ message: 'El "Recorrido" ha sido cargado con exito: ', data: recorrido });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al agregar el "recorrido"', error: error.message });
    }
}
async function update(req, res) {
    try {
        const id = Number.parseInt(req.params.id);
        const recorrido = await em.findOneOrFail(Recorrido, { id });
        em.assign(recorrido, req.body.sanitizedInput);
        await em.flush();
        res.status(200).json({ message: 'El "Recorrido" ha sido actualizado con exito: ', data: recorrido });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}
async function remove(req, res) {
    try {
        const id = Number.parseInt(req.params.id);
        const recorrido = em.getReference(Recorrido, id);
        await em.removeAndFlush(recorrido);
        res.status(200).json({ message: 'El "Recorrido" ha sido eliminado con exito: ', data: recorrido });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al eliminar el "Recorrido"', error: error.message });
    }
}
export { sanitizeRecorridoInput, findAll, findOne, add, update, remove };
//# sourceMappingURL=recorrido.controller.js.map