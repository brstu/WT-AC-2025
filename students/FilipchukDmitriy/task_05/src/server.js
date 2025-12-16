const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const Joi = require('joi');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// Хранилище данных в памяти
let memes = [
  { id: 1, название: 'Дистрашн бойфренд', описание: 'Парень оборачивается на другую девушку', категория: 'классика', популярность: 95, дата_создания: '2023-01-15' },
  { id: 2, название: 'Женщина кричит на кота', описание: 'Женщина кричит, кот за столом', категория: 'животные', популярность: 88, дата_создания: '2023-02-20' },
  { id: 3, название: 'Дрейк да нет', описание: 'Дрейк отказывается/соглашается', категория: 'классика', популярность: 92, дата_создания: '2023-03-10' }
];

let id = 4;

/**
 * @swagger
 * /memes:
 *   get:
 *     summary: Получить список мемов
 *     responses:
 *       200:
 *         description: Список мемов
 */
app.get('/memes', (req, res) => {
  let result = memes;
  
  // Поиск
  if (req.query.q) {
    const query = req.query.q.toLowerCase();
    result = result.filter(m => 
      m.название.toLowerCase().includes(query) || 
      m.описание.toLowerCase().includes(query)
    );
  }

  // Фильтр по категории
  if (req.query.категория) {
    result = result.filter(m => m.категория === req.query.категория);
  }

  let offset = parseInt(req.query.offset) || 0;
  let limit = parseInt(req.query.limit) || 10;
  
  const sliced = result.slice(offset, offset + limit);
  
  res.json({
    данные: sliced,
    всего: result.length,
    offset: offset,
    limit: limit
  });
});

/**
 * @swagger
 * /memes/{id}:
 *   get:
 *     summary: Получить мем по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Мем найден
 *       404:
 *         description: Мем не найден
 */
app.get('/memes/:id', (req, res) => {
  const meme = memes.find(m => m.id == req.params.id);
  
  if (!meme) {
    return res.status(404).json({ ошибка: 'Мем не найден' });
  }
  
  res.json(meme);
});

/**
 * @swagger
 * /memes:
 *   post:
 *     summary: Создать новый мем
 *     responses:
 *       201:
 *         description: Мем создан
 */
app.post('/memes', (req, res) => {
  const schema = Joi.object({
    название: Joi.string().min(1).max(100).required(),
    описание: Joi.string().max(500),
    категория: Joi.string(),
    популярность: Joi.number().min(0).max(100),
    дата_создания: Joi.string()
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ ошибка: error.details[0].message });
  }

  const newMeme = {
    id: id++,
    название: req.body.название,
    описание: req.body.описание || '',
    категория: req.body.категория || 'разное',
    популярность: req.body.популярность || 50,
    дата_создания: req.body.дата_создания || new Date().toISOString().split('T')[0]
  };

  memes.push(newMeme);
  res.status(201).json(newMeme);
});

/**
 * @swagger
 * /memes/{id}:
 *   put:
 *     summary: Обновить мем
 *     responses:
 *       200:
 *         description: Мем обновлен
 */
app.put('/memes/:id', (req, res) => {
  const meme = memes.find(m => m.id == req.params.id);
  
  if (!meme) {
    return res.status(404).json({ ошибка: 'Мем не найден' });
  }

  const schema = Joi.object({
    название: Joi.string().min(1).max(100),
    описание: Joi.string().max(500),
    категория: Joi.string(),
    популярность: Joi.number().min(0).max(100),
    дата_создания: Joi.string()
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ ошибка: error.details[0].message });
  }

  if (req.body.название) meme.название = req.body.название;
  if (req.body.описание) meme.описание = req.body.описание;
  if (req.body.категория) meme.категория = req.body.категория;
  if (req.body.популярность) meme.популярность = req.body.популярность;
  if (req.body.дата_создания) meme.дата_создания = req.body.дата_создания;

  res.json(meme);
});

/**
 * @swagger
 * /memes/{id}:
 *   delete:
 *     summary: Удалить мем
 *     responses:
 *       204:
 *         description: Мем удален
 */
app.delete('/memes/:id', (req, res) => {
  const index = memes.findIndex(m => m.id == req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ ошибка: 'Мем не найден' });
  }

  memes.splice(index, 1);
  res.status(204).send();
});

// Swagger конфигурация
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Meme Library API',
      version: '1.0.0',
      description: 'API для библиотеки мемов'
    },
    servers: [
      {
        url: `http://localhost:${port}`
      }
    ]
  },
  apis: ['./server.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ ошибка: 'Что-то пошло не так!' });
});

app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port}`);
  console.log(`Swagger документация доступна на http://localhost:${port}/docs`);
});
