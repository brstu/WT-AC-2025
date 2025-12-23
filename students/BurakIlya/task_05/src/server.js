const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const fs = require('fs');
require('dotenv').config();

const app = express();

// middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

var DATA = [];
var counter = 1;
const FILE = './data.json';

// загрузка данных при старте
try {
    if (fs.existsSync(FILE)) {
        const d = fs.readFileSync(FILE, 'utf8');
        DATA = JSON.parse(d);
        if (DATA.length > 0) {
            counter = Math.max(...DATA.map(x => x.id)) + 1;
        }
    }
} catch (e) {
    console.log('Error loading data');
}

// сохранение данных
function save() {
    fs.writeFileSync(FILE, JSON.stringify(DATA, null, 2));
}

const swaggerUi = require('swagger-ui-express');

const swaggerDoc = {
    openapi: '3.0.0',
    info: {
        title: 'API коллекций фотографий',
        version: '1.0.0'
    },
    paths: {
        '/photos': {
            get: {
                summary: 'Получить список фотографий',
                responses: {
                    '200': { description: 'OK' }
                }
            },
            post: {
                summary: 'Создать фотографию',
                responses: {
                    '201': { description: 'Created' }
                }
            }
        },
        '/photos/{id}': {
            get: {
                summary: 'Получить фотографию',
                parameters: [{
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' }
                }],
                responses: {
                    '200': { description: 'OK' }
                }
            },
            put: {
                summary: 'Обновить фотографию',
                parameters: [{
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' }
                }],
                responses: {
                    '200': { description: 'OK' }
                }
            },
            delete: {
                summary: 'Удалить фотографию',
                parameters: [{
                    name: 'id',
                    in: 'path',
                    required: true,
                    schema: { type: 'integer' }
                }],
                responses: {
                    '204': { description: 'Deleted' }
                }
            }
        }
    }
};

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// GET /photos - список всех фотографий
app.get('/photos', (req, res) => {
    const q = req.query.q;
    const limit = req.query.limit;
    const offset = req.query.offset;
    
    let result = DATA;
    
    // поиск
    if (q) {
        result = result.filter(p => p.title.includes(q) || p.description.includes(q));
    }
    
    if (offset) {
        result = result.slice(parseInt(offset));
    }
    if (limit) {
        result = result.slice(0, parseInt(limit));
    }
    
    res.json(result);
});

// GET /photos/:id - одна фотография
app.get('/photos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const photo = DATA.find(p => p.id === id);
    
    if (!photo) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    
    res.json(photo);
});

// POST /photos - создание фотографии
app.post('/photos', (req, res) => {
    const { title, description, url, tags } = req.body;
    
    if (!title) {
        res.status(400).json({ error: 'Title required' });
        return;
    }
    
    const photo = {
        id: counter++,
        title: title,
        description: description || '',
        url: url || '',
        tags: tags || [],
        createdAt: new Date().toISOString()
    };
    
    DATA.push(photo);
    save();
    
    res.json(photo);
});

// PUT /photos/:id - обновление фотографии
app.put('/photos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = DATA.findIndex(p => p.id === id);
    
    if (index === -1) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    
    const { title, description, url, tags } = req.body;
    
    DATA[index].title = title || DATA[index].title;
    DATA[index].description = description || DATA[index].description;
    DATA[index].url = url || DATA[index].url;
    DATA[index].tags = tags || DATA[index].tags;
    DATA[index].updatedAt = new Date().toISOString();
    
    save();
    res.json(DATA[index]);
});

app.patch('/photos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = DATA.findIndex(p => p.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: 'Not found' });
    }
    
    const { title, description, url, tags } = req.body;
    
    if (title) DATA[index].title = title;
    if (description) DATA[index].description = description;
    if (url) DATA[index].url = url;
    if (tags) DATA[index].tags = tags;
    
    save();
    res.json(DATA[index]);
});

// DELETE /photos/:id - удаление
app.delete('/photos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = DATA.findIndex(p => p.id === id);
    
    if (index === -1) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    
    DATA.splice(index, 1);
    save();
    
    res.status(200).json({ message: 'Deleted' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: err.message, stack: err.stack });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
