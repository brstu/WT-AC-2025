// In-memory storage for notes
let notes = [];
let currentId = 1;

const generateId = () => currentId++;

const notesStorage = {
  getAll: (filters = {}) => {
    let filteredNotes = [...notes];

    // Search by query
    if (filters.q) {
      const query = filters.q.toLowerCase();
      filteredNotes = filteredNotes.filter(note => 
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query)
      );
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      filteredNotes = filteredNotes.filter(note =>
        filters.tags.some(tag => note.tags.includes(tag))
      );
    }

    // Filter by archive status
    if (filters.isArchived !== undefined) {
      filteredNotes = filteredNotes.filter(note => note.isArchived === filters.isArchived);
    }

    // Filter by done status
    if (filters.isDone !== undefined) {
      filteredNotes = filteredNotes.filter(note => note.isDone === filters.isDone);
    }

    // Apply pagination
    const limit = parseInt(filters.limit) || 10;
    const offset = parseInt(filters.offset) || 0;
    
    const total = filteredNotes.length;
    const paginatedNotes = filteredNotes.slice(offset, offset + limit);

    return {
      notes: paginatedNotes,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    };
  },

  getById: (id) => {
    return notes.find(note => note.id === id);
  },

  create: (noteData) => {
    const newNote = {
      id: generateId(),
      ...noteData,
      isArchived: false,
      isDone: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    notes.push(newNote);
    return newNote;
  },

  update: (id, updateData) => {
    const noteIndex = notes.findIndex(note => note.id === id);
    if (noteIndex === -1) return null;

    notes[noteIndex] = {
      ...notes[noteIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    return notes[noteIndex];
  },

  delete: (id) => {
    const noteIndex = notes.findIndex(note => note.id === id);
    if (noteIndex === -1) return false;

    notes.splice(noteIndex, 1);
    return true;
  },

  // Additional methods for specific operations
  archive: (id) => {
    const note = notesStorage.getById(id);
    if (!note) return null;
    return notesStorage.update(id, { isArchived: true });
  },

  unarchive: (id) => {
    const note = notesStorage.getById(id);
    if (!note) return null;
    return notesStorage.update(id, { isArchived: false });
  },

  markAsDone: (id) => {
    const note = notesStorage.getById(id);
    if (!note) return null;
    return notesStorage.update(id, { isDone: true });
  },

  markAsUndone: (id) => {
    const note = notesStorage.getById(id);
    if (!note) return null;
    return notesStorage.update(id, { isDone: false });
  }
};

module.exports = notesStorage;