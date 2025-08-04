import { Licencia } from './licencia.entity.js';
import { orm } from '../shared/db/orm.js';
import { Conductor } from '../conductor/conductor.entity.js';
const em = orm.em;
function sanitizeLicenciaInput(req, res, next) {
    req.body.sanitizedInput = {
        fechaVencimiento: req.body.fechaVencimiento,
        fechaHecho: req.body.fechaVencimiento,
        estado: req.body.estado,
        idConductor: req.body.idConductor
    };
    // more checks here
    Object.keys(req.body.sanitizedInput).forEach((key) => {
        if (req.body.sanitizedInput[key] === undefined) {
            req.body.sanitizedInput[key] = undefined;
        }
    });
    next();
}
async function findAll(req, res) {
    try {
        const licencias = await em.find(Licencia, {}, { populate: ['conductor'] });
        res.status(200).json({ message: 'Listado de las licencias de conductor: ', data: licencias });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener el listado de las licencias de conductor', error: error.message });
    }
}
async function findOne(req, res) {
    try {
        const id = Number.parseInt(req.params.id);
        const licencia = await em.findOneOrFail(Licencia, { id }, { populate: ['conductor'] });
        res.status(200).json({ message: 'La "Licencia de conductor" ha sido encontrada: ', data: licencia });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener la "Licencia de conductor"', error: error.message });
    }
}
async function add(req, res) {
    try {
        const idConductor = Number.parseInt(req.body.sanitizedInput.idConductor);
        const conductor = await em.findOneOrFail(Conductor, { id: idConductor });
        req.body.sanitizedInput.conductor = conductor;
        const licencia = em.create(Licencia, req.body.sanitizedInput);
        await em.flush();
        res.status(201).json({ message: 'La "Licencia de conductor" ha sido creada con exito: ', data: licencia });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al agregar la "Licencia de conductor"', error: error.message });
    }
}
async function update(req, res) {
    try {
        if (req.body.sanitizedInput.idConductor !== undefined) {
            const idConductor = Number.parseInt(req.body.sanitizedInput.idConductor);
            const conductor = await em.findOneOrFail(Conductor, { id: idConductor });
            req.body.sanitizedInput.conductor = conductor;
            req.body.sanitizedInput.idConductor = undefined;
        }
        const id = Number.parseInt(req.params.id);
        const licenciaToUpdate = await em.findOneOrFail(Licencia, { id });
        em.assign(licenciaToUpdate, req.body.sanitizedInput);
        await em.flush();
        Object.assign(req.body.sanitizedInput, licenciaToUpdate); // esto porque sino licenciaUpdated no muestra los datos del conductor
        res.status(200).json({ message: 'La "Licencia de conductor" ha sido actualizada con exito: ', data: licenciaToUpdate });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al actualizar la "Licencia de conductor"', error: error.message });
    }
}
async function remove(req, res) {
    try {
        const id = Number.parseInt(req.params.id);
        const licencia = em.getReference(Licencia, id);
        await em.removeAndFlush(licencia);
        res.status(200).json({ message: 'La "Licencia de conductor" ha sido eliminada con exito: ', data: licencia });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al eliminar la "Licencia de conductor"', error: error.message });
    }
}
export { sanitizeLicenciaInput, findAll, findOne, add, update, remove };
//# sourceMappingURL=licencia.controller.js.map