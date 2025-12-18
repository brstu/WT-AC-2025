import {createError} from '../controllers/tasks.controller.js';

export const validate = (schema) => (req, res, next) => {
    try {
        req.validatedBody = schema.parse(req.body);
        next();
    } catch (error) {
        const issues = error.errors?.map(e => `${e.path.join('.')} — ${e.message}`) || [];
        throw createError(422, `Ошибка валидации: ${issues.join('; ')}`);
    }
};