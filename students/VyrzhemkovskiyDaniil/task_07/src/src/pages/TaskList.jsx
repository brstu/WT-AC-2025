import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGetTasksQuery } from '../store.js'
import TaskCard from '../components/TaskCard.jsx'
import TaskFilters from '../components/TaskFilters.jsx'
import Button from '../components/ui/Button.jsx'

const TaskList = () => {
  const [filters, setFilters] = useState({})
  const [debouncedFilters, setDebouncedFilters] = useState({})
  
  const { data: tasks = [], isLoading, error, refetch } = useGetTasksQuery(debouncedFilters)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters)
    }, 300)

    return () => clearTimeout(timer)
  }, [filters])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">Failed to load tasks</div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Task Tracker</h1>
        <div className="flex gap-4">
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-blue-600 hover:text-blue-800"
          >
            Refresh
          </button>
          <Link to="/tasks/new">
            <Button variant="primary">+ New Task</Button>
          </Link>
        </div>
      </div>

      <TaskFilters onChange={setFilters} />

      {tasks.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-6">
            <svg className="w-24 h-24 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks found</h3>
          <p className="text-gray-500 mb-8">Create your first task to get started</p>
          <Link to="/tasks/new">
            <Button variant="primary">Create Task</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  )
}

export default TaskList