import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetTaskQuery, useCreateTaskMutation, useUpdateTaskMutation } from '../store.js'
import { z } from 'zod'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'

const taskSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(100, 'Title must be less than 100 characters'),
  
  description: z.string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  
  status: z.enum(['todo', 'in_progress', 'done'], {
    required_error: 'Status is required'
  }),
  
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: 'Priority is required'
  }),
  
  dueDate: z.string().optional(),
  
  tags: z.string().optional()
})

const TaskForm = ({ isEdit = false }) => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: 'todo',
      priority: 'medium'
    }
  })
  
  const { data: task, isLoading: isLoadingTask } = useGetTaskQuery(id, { 
    skip: !isEdit 
  })
  
  const [createTask] = useCreateTaskMutation()
  const [updateTask] = useUpdateTaskMutation()

  useEffect(() => {
    if (isEdit && task) {
      const formattedTask = {
        ...task,
        tags: task.tags?.join(', ') || ''
      }
      reset(formattedTask)
    }
  }, [isEdit, task, reset])

  const onSubmit = async (data) => {
    try {
      const formattedData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      }
      
      if (isEdit && id) {
        await updateTask({ id, data: formattedData }).unwrap()
      } else {
        await createTask(formattedData).unwrap()
      }
      navigate('/')
    } catch (error) {
      console.error('Failed to save task:', error)
    }
  }

  if (isEdit && isLoadingTask) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">
        {isEdit ? 'Edit Task' : 'Create New Task'}
      </h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          label="Title"
          {...register('title')}
          error={errors.title?.message}
          placeholder="Enter task title"
        />
        
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            {...register('description')}
            rows={4}
            className={`w-full px-3 py-2 border rounded-lg ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Enter task description"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              {...register('status')}
              className={`w-full px-3 py-2 border rounded-lg ${errors.status ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Priority</label>
            <select
              {...register('priority')}
              className={`w-full px-3 py-2 border rounded-lg ${errors.priority ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            {errors.priority && (
              <p className="mt-1 text-sm text-red500">{errors.priority.message}</p>
            )}
          </div>
        </div>
        
        <Input
          label="Due Date"
          type="date"
          {...register('dueDate')}
          error={errors.dueDate?.message}
        />
        
        <Input
          label="Tags (comma separated)"
          {...register('tags')}
          placeholder="work, urgent, personal"
        />
        
        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isEdit ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default TaskForm