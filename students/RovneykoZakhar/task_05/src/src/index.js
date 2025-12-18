require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const projectsRouter = require('./routes/projects');
const { HttpError, ValidationError, NotFoundError } = require('./errors');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Роуты
app.use('/projects', projectsRouter);

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Обработка ошибок (централизованная)
app.use((err, req, res, next) => {
    if (err instanceof HttpError) {
        if (err instanceof ValidationError) {
            return res.status(err.status).json({ error: err.message, details: err.details });
        }
        return res.status(err.status).json({ error: err.message });
    }

    console.error(err);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// 404 для неизвестных роутов
app.use((req, res) => {
    res.status(404).json({ error: 'Роут не найден' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    console.log(`Документация: http://localhost:${PORT}/docs`);
});