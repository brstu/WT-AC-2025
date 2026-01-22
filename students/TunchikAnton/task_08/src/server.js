const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('build'));

app.get('/api/films', (req, res) => {
  res.json([
    {
      id: 1,
      title: 'Интерстеллар',
      director: 'Кристофер Нолан',
      year: 2014,
      rating: 8.6,
      duration: 169
    },
    {
      id: 2,
      title: 'Паразиты',
      director: 'Пон Чжун Хо',
      year: 2019,
      rating: 8.6,
      duration: 132
    }
  ]);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});