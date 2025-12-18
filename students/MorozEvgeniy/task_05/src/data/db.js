let albums = [
    { id: 1, title: 'Thriller', artist: 'Michael Jackson', year: 1982, genre: 'Pop' },
    { id: 2, title: 'Back in Black', artist: 'AC/DC', year: 1980, genre: 'Rock' },
    { id: 3, title: 'The Dark Side of the Moon', artist: 'Pink Floyd', year: 1973, genre: 'Progressive Rock' }
  ];
  
  let nextId = albums.length ? Math.max(...albums.map(a => a.id)) + 1 : 1;
  
  function getAll() {
    return albums;
  }
  
  function getById(id) {
    return albums.find(a => a.id === id);
  }
  
  function create(albumData) {
    const newAlbum = { id: nextId++, ...albumData };
    albums.push(newAlbum);
    return newAlbum;
  }
  
  function update(id, patch) {
    const idx = albums.findIndex(a => a.id === id);
    if (idx === -1) return null;
    albums[idx] = { ...albums[idx], ...patch };
    return albums[idx];
  }
  
  function remove(id) {
    const idx = albums.findIndex(a => a.id === id);
    if (idx === -1) return false;
    albums.splice(idx, 1);
    return true;
  }
  
  module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    _internal: { albums }
  };
  