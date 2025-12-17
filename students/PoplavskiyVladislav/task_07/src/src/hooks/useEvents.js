import { useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  fetchEvents,
  fetchEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  clearCurrentEvent,
  clearError,
  clearSuccessMessage
} from '../features/events/eventsSlice'

export function useEvents() {
  const dispatch = useDispatch()
  const eventsState = useSelector(state => state.events)
  
  const loadEvents = useCallback(() => {
    dispatch(fetchEvents())
  }, [dispatch])
  
  const loadEventById = useCallback((id) => {
    dispatch(fetchEventById(id))
  }, [dispatch])
  
  const addEvent = useCallback((eventData) => {
    return dispatch(createEvent(eventData)).unwrap()
  }, [dispatch])
  
  const editEvent = useCallback((id, eventData) => {
    return dispatch(updateEvent({ id, eventData })).unwrap()
  }, [dispatch])
  
  const removeEvent = useCallback((id) => {
    return dispatch(deleteEvent(id)).unwrap()
  }, [dispatch])
  
  const clearEvent = useCallback(() => {
    dispatch(clearCurrentEvent())
  }, [dispatch])
  
  const dismissError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])
  
  const dismissSuccess = useCallback(() => {
    dispatch(clearSuccessMessage())
  }, [dispatch])
  
  return {
    ...eventsState,
    loadEvents,
    loadEventById,
    addEvent,
    editEvent,
    removeEvent,
    clearEvent,
    dismissError,
    dismissSuccess
  }
}

export function useEventById(id) {
  const dispatch = useDispatch()
  const { currentEvent, loading, error } = useSelector(state => state.events)
  
  useEffect(() => {
    if (id) {
      dispatch(fetchEventById(id))
    }
    
    return () => {
      dispatch(clearCurrentEvent())
    }
  }, [dispatch, id])
  
  return { event: currentEvent, loading, error }
}

export function useEventFilters() {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'date',
    sortOrder: 'asc'
  })
  
  const { items: events } = useSelector(state => state.events)
  
  const filteredEvents = events.filter(event => {
    // Поиск
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch = 
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.location.toLowerCase().includes(searchLower)
      
      if (!matchesSearch) return false
    }
    
    // Категория
    if (filters.category && event.category !== filters.category) {
      return false
    }
    
    // Статус
    if (filters.status && event.status !== filters.status) {
      return false
    }
    
    // Дата от
    if (filters.dateFrom && new Date(event.date) < new Date(filters.dateFrom)) {
      return false
    }
    
    // Дата до
    if (filters.dateTo && new Date(event.date) > new Date(filters.dateTo)) {
      return false
    }
    
    return true
  })
  
  // Сортировка
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    let aValue, bValue
    
    switch (filters.sortBy) {
      case 'title':
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        break
      case 'date':
        aValue = new Date(a.date)
        bValue = new Date(b.date)
        break
      case 'participants':
        aValue = a.currentParticipants
        bValue = b.currentParticipants
        break
      default:
        aValue = a[filters.sortBy]
        bValue = b[filters.sortBy]
    }
    
    if (filters.sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })
  
  const categories = [...new Set(events.map(event => event.category))]
  const statuses = ['active', 'cancelled', 'completed']
  
  return {
    events: sortedEvents,
    filters,
    setFilters,
    categories,
    statuses,
    total: events.length,
    filtered: filteredEvents.length
  }
}

export function useEventStats() {
  const { items: events } = useSelector(state => state.events)
  
  const stats = {
    total: events.length,
    active: events.filter(e => e.status === 'active').length,
    cancelled: events.filter(e => e.status === 'cancelled').length,
    completed: events.filter(e => e.status === 'completed').length,
    totalParticipants: events.reduce((sum, event) => sum + event.currentParticipants, 0),
    maxCapacity: events.reduce((sum, event) => sum + event.maxParticipants, 0),
    upcoming: events.filter(e => new Date(e.date) > new Date() && e.status === 'active').length
  }
  
  stats.occupancyRate = stats.maxCapacity > 0 
    ? Math.round((stats.totalParticipants / stats.maxCapacity) * 100) 
    : 0
  
  return stats
}