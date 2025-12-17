const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 5174;

// CORS simple
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, If-None-Match');
  next();
});

const DATA_PATH = path.join(__dirname, 'data', 'tracks.json');
let TRACKS = [];
try{
  TRACKS = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
}catch(e){
  console.error('Failed to load tracks.json', e);
  TRACKS = [];
}

function makeEtag(obj){
  const hash = crypto.createHash('md5').update(JSON.stringify(obj)).digest('hex');
  return `W/"${hash}"`;
}

function svgPosterData(title){
  const safe = String(title).replace(/&/g,'&amp;').replace(/"/g,'').replace(/</g,'').replace(/>/g,'');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><rect width='100%' height='100%' fill='%2310212a'/><text x='50%' y='50%' fill='%239aa6b2' dominant-baseline='middle' text-anchor='middle' font-family='Arial, Helvetica, sans-serif' font-size='20'>${safe}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// GET /tracks?_page=1&_limit=10&title_like=...  (supports Russian search)
app.get('/tracks', (req, res) => {
  const limit = Math.max(1, Math.min(50, parseInt(req.query._limit || '10')));
  const page = Math.max(1, parseInt(req.query._page || '1'));
  const title_like = req.query.title_like ? String(req.query.title_like).toLowerCase() : null;

  let filtered = TRACKS.slice();
  if (title_like) {
    const q = title_like;
    filtered = filtered.filter(t => (t.title && t.title.toLowerCase().includes(q)) || (t.album && t.album.toLowerCase().includes(q)) || (t.artist && t.artist.toLowerCase().includes(q)));
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const pageItems = filtered.slice(start, start + limit);

  // ensure each item has a poster field (data URI SVG) for reliable client display
  const pageItemsWithPoster = pageItems.map(item => {
    return Object.assign({}, item, { poster: item.poster || svgPosterData(item.title || ('Track ' + item.id)) });
  });

  const etag = makeEtag(pageItemsWithPoster);
  res.setHeader('X-Total-Count', String(total));
  res.setHeader('ETag', etag);

  const clientEtag = req.headers['if-none-match'];
  if (clientEtag && clientEtag === etag) {
    res.status(304).end();
    return;
  }

  res.json(pageItemsWithPoster);
});

app.listen(PORT, () => {
  console.log(`Mock API server (ETag) listening on http://localhost:${PORT}`);
});
