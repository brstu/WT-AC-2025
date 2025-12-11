// Views module
import * as api from './api.js';
import { navigate } from './router.js';

var app;
var isLoading = false;

export function setAppElement(element) {
    app = element;
}

function showLoading() {
    console.log('Show loading');
    isLoading = true;
    app.innerHTML = '<div class="loading">Loading...</div>';
}

function showError(message) {
    console.log('Show error', message);
    isLoading = false;
    app.innerHTML = '<div class="error">' + message + '</div>';
}

function showSuccess(message) {
    console.log('Show success', message);
    var successDiv = document.createElement('div');
    successDiv.className = 'success';
    successDiv.textContent = message;
    app.insertBefore(successDiv, app.firstChild);
    
    setTimeout(function() {
        successDiv.remove();
    }, 3000);
}

export async function showTaskList(params, searchParams) {
    console.log('Show task list', searchParams);
    showLoading();
    
    try {
        var search = searchParams.search || '';
        var tasks = await api.getTasks(search);
        
        var html = '';
        html += '<div class="search-box">';
        html += '<input type="text" id="searchInput" placeholder="Search tasks..." value="' + search + '">';
        html += '</div>';
        
        if (tasks.length === 0) {
            html += '<div class="empty">No tasks found</div>';
        } else {
            html += '<div class="task-list">';
            
            for (var i = 0; i < tasks.length; i++) {
                var task = tasks[i];
                html += '<div class="task-item">';
                html += '<div>';
                html += '<h3>' + task.title + '</h3>';
                html += '<p>' + task.description.substring(0, 100) + '...</p>';
                html += '<span class="priority ' + task.priority + '">' + task.priority + '</span>';
                html += '</div>';
                html += '<div class="task-actions">';
                html += '<a href="#/items/' + task.id + '" class="btn btn-primary">View</a>';
                html += '<a href="#/items/' + task.id + '/edit" class="btn btn-secondary">Edit</a>';
                html += '<button class="btn btn-danger" onclick="window.deleteTask(' + task.id + ')">Delete</button>';
                html += '</div>';
                html += '</div>';
            }
            
            html += '</div>';
        }
        
        app.innerHTML = html;
        isLoading = false;
        
        var searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                var value = e.target.value;
                window.location.hash = '#/items' + (value ? '?search=' + encodeURIComponent(value) : '');
            });
        }
    } catch (error) {
        showError('Error loading tasks: ' + error.message);
    }
}

export async function showTaskDetail(params) {
    console.log('Show task detail', params);
    showLoading();
    
    try {
        var task = await api.getTask(params.id);
        
        var html = '';
        html += '<div class="task-detail">';
        html += '<h2>' + task.title + '</h2>';
        html += '<div class="meta">';
        html += '<span class="priority ' + task.priority + '">' + task.priority + '</span>';
        html += ' | Status: ' + task.status;
        html += ' | Created: ' + new Date(task.createdAt).toLocaleDateString();
        html += '</div>';
        html += '<div class="description">' + task.description + '</div>';
        html += '<div class="actions">';
        html += '<a href="#/items" class="btn btn-secondary">Back to List</a>';
        html += '<a href="#/items/' + task.id + '/edit" class="btn btn-primary">Edit</a>';
        html += '<button class="btn btn-danger" onclick="window.deleteTask(' + task.id + ')">Delete</button>';
        html += '</div>';
        html += '</div>';
        
        app.innerHTML = html;
        isLoading = false;
    } catch (error) {
        showError('Error loading task: ' + error.message);
    }
}

export function showTaskForm(params) {
    console.log('Show task form', params);
    
    var isEdit = params.id ? true : false;
    
    if (isEdit) {
        showLoading();
        api.getTask(params.id).then(function(task) {
            renderForm(task);
        }).catch(function(error) {
            showError('Error loading task: ' + error.message);
        });
    } else {
        renderForm(null);
    }
}

function renderForm(task) {
    var isEdit = task ? true : false;
    
    var html = '';
    html += '<h2>' + (isEdit ? 'Edit Task' : 'Create New Task') + '</h2>';
    html += '<form id="taskForm">';
    html += '<div class="form-group">';
    html += '<label for="title">Title</label>';
    html += '<input type="text" id="title" name="title" required value="' + (task ? task.title : '') + '">';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label for="description">Description</label>';
    html += '<textarea id="description" name="description" required>' + (task ? task.description : '') + '</textarea>';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label for="priority">Priority</label>';
    html += '<select id="priority" name="priority">';
    html += '<option value="low"' + (task && task.priority === 'low' ? ' selected' : '') + '>Low</option>';
    html += '<option value="medium"' + (task && task.priority === 'medium' ? ' selected' : '') + '>Medium</option>';
    html += '<option value="high"' + (task && task.priority === 'high' ? ' selected' : '') + '>High</option>';
    html += '</select>';
    html += '</div>';
    html += '<div class="form-group">';
    html += '<label for="status">Status</label>';
    html += '<select id="status" name="status">';
    html += '<option value="pending"' + (task && task.status === 'pending' ? ' selected' : '') + '>Pending</option>';
    html += '<option value="in-progress"' + (task && task.status === 'in-progress' ? ' selected' : '') + '>In Progress</option>';
    html += '<option value="completed"' + (task && task.status === 'completed' ? ' selected' : '') + '>Completed</option>';
    html += '</select>';
    html += '</div>';
    html += '<div class="form-actions">';
    html += '<button type="submit" class="btn btn-primary">Save</button>';
    html += '<a href="#/items" class="btn btn-secondary">Cancel</a>';
    html += '</div>';
    html += '</form>';
    
    app.innerHTML = html;
    isLoading = false;
    
    var form = document.getElementById('taskForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        var submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Saving...';
        
        var formData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            priority: document.getElementById('priority').value,
            status: document.getElementById('status').value
        };
        
        if (isEdit) {
            api.updateTask(task.id, formData).then(function() {
                showSuccess('Task updated successfully');
                navigate('#/items/' + task.id);
            }).catch(function(error) {
                showError('Error updating task: ' + error.message);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save';
            });
        } else {
            api.createTask(formData).then(function(newTask) {
                showSuccess('Task created successfully');
                navigate('#/items/' + newTask.id);
            }).catch(function(error) {
                showError('Error creating task: ' + error.message);
                submitBtn.disabled = false;
                submitBtn.textContent = 'Save';
            });
        }
    });
}

window.deleteTask = async function(id) {
    console.log('Delete task', id);
    
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            await api.deleteTask(id);
            showSuccess('Task deleted successfully');
            navigate('#/items');
        } catch (error) {
            showError('Error deleting task: ' + error.message);
        }
    }
};
