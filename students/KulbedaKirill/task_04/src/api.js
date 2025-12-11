// API module with localStorage
var tasks = [];
var currentId = 1;

function initStorage() {
    console.log('Init storage');
    var stored = localStorage.getItem('tasks');
    if (stored) {
        tasks = JSON.parse(stored);
        if (tasks.length > 0) {
            currentId = Math.max(...tasks.map(t => t.id)) + 1;
        }
    } else {
        tasks = [
            {
                id: 1,
                title: 'Complete project documentation',
                description: 'Write comprehensive documentation for the task tracker application',
                priority: 'high',
                status: 'pending',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                title: 'Fix bugs in authentication',
                description: 'Resolve login issues reported by users',
                priority: 'medium',
                status: 'in-progress',
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                title: 'Update dependencies',
                description: 'Update all npm packages to latest versions',
                priority: 'low',
                status: 'pending',
                createdAt: new Date().toISOString()
            }
        ];
        currentId = 4;
        saveToStorage();
    }
}

function saveToStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    console.log('Saved to storage');
}

function delay() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve();
        }, Math.random() * 500 + 200);
    });
}

export async function getTasks(search) {
    console.log('Getting tasks', search);
    await delay();
    
    var result = tasks;
    if (search) {
        result = tasks.filter(task => 
            task.title.toLowerCase().indexOf(search.toLowerCase()) !== -1 ||
            task.description.toLowerCase().indexOf(search.toLowerCase()) !== -1
        );
    }
    
    return result;
}

export async function getTask(id) {
    console.log('Getting task', id);
    await delay();
    
    var task = tasks.find(t => t.id == id);
    if (!task) {
        throw new Error('Task not found');
    }
    return task;
}

export async function createTask(data) {
    console.log('Creating task', data);
    await delay();
    
    var newTask = {
        id: currentId++,
        title: data.title,
        description: data.description,
        priority: data.priority || 'medium',
        status: data.status || 'pending',
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    saveToStorage();
    
    return newTask;
}

export async function updateTask(id, data) {
    console.log('Updating task', id, data);
    await delay();
    
    var index = tasks.findIndex(t => t.id == id);
    if (index === -1) {
        throw new Error('Task not found');
    }
    
    tasks[index] = {
        ...tasks[index],
        ...data,
        id: tasks[index].id,
        createdAt: tasks[index].createdAt
    };
    
    saveToStorage();
    return tasks[index];
}

export async function deleteTask(id) {
    console.log('Deleting task', id);
    await delay();
    
    var index = tasks.findIndex(t => t.id == id);
    if (index === -1) {
        throw new Error('Task not found');
    }
    
    tasks.splice(index, 1);
    saveToStorage();
    
    return true;
}

initStorage();
