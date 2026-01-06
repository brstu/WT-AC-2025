import React, { useState, useEffect } from 'react'
import TaskCard from './TaskCard'
import { fetchTasks, addTask, toggleTaskCompletion, deleteTask } from './api'
import './styles.css'

function App() {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all') // 'all', 'completed', 'pending'
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: ''
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const data = await fetchTasks()
      setTasks(data)
      setError(null)
    } catch (err) {
      setError('Failed to load tasks. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!newTask.title.trim()) return

    try {
      const addedTask = await addTask(newTask)
      setTasks([...tasks, addedTask])
      setNewTask({ title: '', description: '', dueDate: '' })
    } catch (err) {
      setError('Failed to add task')
    }
  }

  const handleToggleComplete = async (id) => {
    try {
      const updatedTask = await toggleTaskCompletion(id)
      setTasks(tasks.map(task => 
        task.id === id ? updatedTask : task
      ))
    } catch (err) {
      setError('Failed to update task')
    }
  }

  const handleDeleteTask = async (id) => {
    try {
      await deleteTask(id)
      setTasks(tasks.filter(task => task.id !== id))
    } catch (err) {
      setError('Failed to delete task')
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed
    if (filter === 'pending') return !task.completed
    return true
  })

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    pending: tasks.filter(t => !t.completed).length
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📋 Task Tracker</h1>
        <p>Track and manage your daily tasks efficiently</p>
      </header>

      <main className="app-main">
        <div className="task-form-container">
          <form onSubmit={handleAddTask} className="task-form">
            <h2>➕ Add New Task</h2>
            
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                placeholder="Enter task title"
                required
                data-testid="task-title-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                placeholder="Enter task description"
                rows="3"
                data-testid="task-desc-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                data-testid="task-date-input"
              />
            </div>

            <button 
              type="submit" 
              className="submit-btn"
              data-testid="add-task-btn"
            >
              Add Task
            </button>
          </form>

          <div className="stats-panel">
            <h3>📊 Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card total">
                <span className="stat-number">{stats.total}</span>
                <span className="stat-label">Total Tasks</span>
              </div>
              <div className="stat-card completed">
                <span className="stat-number">{stats.completed}</span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="stat-card pending">
                <span className="stat-number">{stats.pending}</span>
                <span className="stat-label">Pending</span>
              </div>
            </div>

            <div className="filters">
              <h3>🔍 Filter Tasks</h3>
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                  data-testid="filter-all"
                >
                  All
                </button>
                <button 
                  className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                  onClick={() => setFilter('pending')}
                  data-testid="filter-pending"
                >
                  Pending
                </button>
                <button 
                  className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                  onClick={() => setFilter('completed')}
                  data-testid="filter-completed"
                >
                  Completed
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-alert" role="alert">
            ⚠️ {error}
            <button onClick={() => setError(null)} className="close-error">
              ×
            </button>
          </div>
        )}

        <section className="tasks-section">
          <h2>
            {loading ? 'Loading tasks...' : `Tasks (${filteredTasks.length})`}
          </h2>
          
          {loading ? (
            <div className="loading">Loading tasks...</div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <p>📭 No tasks found. Add your first task above!</p>
            </div>
          ) : (
            <div className="tasks-grid">
              {filteredTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>Task Tracker v1.0 • Built with React • Lab 08</p>
        <p className="footer-info">
          {stats.completed} of {stats.total} tasks completed • 
          {stats.pending > 0 ? ` ${stats.pending} pending` : ' All done! 🎉'}
        </p>
      </footer>
    </div>
  )
}

export default App