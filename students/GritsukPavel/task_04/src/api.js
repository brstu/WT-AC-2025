var allNotes = mockNotes;

function getNotes() {
    console.log('Getting all notes...');
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            console.log('Data received:', allNotes);
            resolve(allNotes);
        }, 300);
    });
}

function getNote(id) {
    console.log('Getting note with id:', id);
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            var note = allNotes.find(function(n) { return n.id == id; });
            if (note) {
                console.log('Note data:', note);
                resolve(note);
            } else {
                console.log('Note not found');
                reject(new Error('Note not found'));
            }
        }, 200);
    });
}

function createNote(noteData) {
    console.log('Creating note with data:', noteData);
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            currentId++;
            var newNote = {
                id: currentId,
                title: noteData.title,
                body: noteData.body,
                userId: noteData.userId || 1
            };
            allNotes.unshift(newNote);
            mockNotes.unshift(newNote);
            console.log('Created note:', newNote);
            resolve(newNote);
        }, 400);
    });
}

function updateNote(id, noteData) {
    console.log('Updating note', id, 'with data:', noteData);
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            var index = allNotes.findIndex(function(n) { return n.id == id; });
            if (index !== -1) {
                allNotes[index].title = noteData.title;
                allNotes[index].body = noteData.body;
                var mockIndex = mockNotes.findIndex(function(n) { return n.id == id; });
                if (mockIndex !== -1) {
                    mockNotes[mockIndex].title = noteData.title;
                    mockNotes[mockIndex].body = noteData.body;
                }
                console.log('Updated note:', allNotes[index]);
                resolve(allNotes[index]);
            } else {
                reject(new Error('Note not found'));
            }
        }, 400);
    });
}

function deleteNote(id) {
    console.log('Deleting note with id:', id);
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            var index = allNotes.findIndex(function(n) { return n.id == id; });
            if (index !== -1) {
                allNotes.splice(index, 1);
                var mockIndex = mockNotes.findIndex(function(n) { return n.id == id; });
                if (mockIndex !== -1) {
                    mockNotes.splice(mockIndex, 1);
                }
                console.log('Note deleted');
                resolve(true);
            } else {
                reject(new Error('Note not found'));
            }
        }, 300);
    });
}

function searchNotes(query) {
    console.log('Searching notes with query:', query);
    if (!query) {
        return Promise.resolve(allNotes);
    }
    
    var filtered = allNotes.filter(function(note) {
        return note.title.toLowerCase().indexOf(query.toLowerCase()) !== -1 || 
               note.body.toLowerCase().indexOf(query.toLowerCase()) !== -1;
    });
    
    console.log('Search results:', filtered);
    return Promise.resolve(filtered);
}
