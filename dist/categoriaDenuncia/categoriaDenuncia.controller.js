import { CategoriaDenuncia } from './categoriaDenuncia.entity.js';
import { orm } from '../shared/db/orm.js';
const em = orm.em;
function sanitizeRecorridoInput(req, res, next) {
    req.body.sanitizedInput = {
        descripcion: req.body.descripcion,
        titulo: req.body.titulo
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
        const catsDenuncia = await em.find(CategoriaDenuncia, {});
        res.status(200).json({ message: 'Listado de las categorias de denuncia: ', data: catsDenuncia });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener el listado de las categorias de denuncia', error: error.messagee });
    }
}
async function findOne(req, res) {
    try {
        const id = Number.parseInt(req.params.id);
        const catDenuncia = await em.findOneOrFail(CategoriaDenuncia, { id });
        res.status(200).json({ message: 'La "Categoria de denuncia" ha sido encontrada: ', data: catDenuncia });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al obtener la "Categoria de denuncia"', error: error.message });
    }
}
async function add(req, res) {
    try {
        const catDenuncia = em.create(CategoriaDenuncia, req.body.sanitizedInput);
        await em.flush();
        res.status(200).json({ message: 'La "Categoria de denuncia" ha sido creada con exito: ', data: catDenuncia });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al agregar la "Categoria de denuncia"', error: error.message });
    }
}
async function update(req, res) {
    try {
        const id = Number.parseInt(req.params.id);
        const catDenuncia = await em.findOneOrFail(CategoriaDenuncia, { id });
        em.assign(catDenuncia, req.body.sanitizedInput);
        await em.flush();
        res.status(200).json({ message: 'La "Categoria de denuncia" ha sido actualizada con exito: ', data: catDenuncia });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al actualizar la "Categoria de denuncia"', error: error.message });
    }
}
async function remove(req, res) {
    try {
        const id = Number.parseInt(req.params.id);
        const catDenuncia = em.getReference(CategoriaDenuncia, id);
        await em.removeAndFlush(catDenuncia);
        res.status(200).json({ message: 'La "Categoria de denuncia" ha sido eliminada con exito: ', data: catDenuncia });
    }
    catch (error) {
        res.status(500).json({ message: 'Error al eliminar la "Categoria de denuncia"', error: error.message });
    }
}
export { sanitizeRecorridoInput, findAll, findOne, add, update, remove };
//# sourceMappingURL=categoriaDenuncia.controller.js.map