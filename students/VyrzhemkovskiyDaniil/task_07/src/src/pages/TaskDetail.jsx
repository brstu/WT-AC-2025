import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGetTaskQuery, useDeleteTaskMutation } from '../store.js'
import Button from '../components/ui/Button.jsx'

const TaskDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: task, isLoading, error } = useGetTaskQuery(id)
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation()

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(id).unwrap()
        navigate('/')
      } catch (error) {
        console.error('Failed to delete task:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error || !task) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-gray-600 mb-8">Task not found</p>
          <Link to="/">
            <Button variant="primary">Back to tasks</Button>
          </Link>
        </div>
      </div>
    )
  }

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status) => {
    const colors = {
      todo: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      done: 'bg-green-100 text-green-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{task.title}</h1>
          <div className="flex gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(task.status)}`}>
              {task.status.replace('_', ' ')}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/tasks/${id}/edit`}>
            <Button variant="outline">Edit</Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Description</h2>
        <p className="text-gray-700 whitespace-pre-wrap">
          {task.description || 'No description provided'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-semibold mb-2">Details</h3>
          <div className="space-y-2">
            <div>
              <p className="text-sm text-gray-500">Created</p>
              <p>{new Date(task.createdAt).toLocaleDateString()}</p>
            </div>
            {task.dueDate && (
              <div>
                <p className="text-sm text-gray-500">Due Date</p>
                <p>{new Date(task.dueDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        <Link to="/">
          <Button variant="outline">← Back to tasks</Button>
        </Link>
      </div>
    </div>
  )
}

export default TaskDetail