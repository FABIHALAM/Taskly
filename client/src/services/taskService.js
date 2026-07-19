import api from './api'

export const getTasksByProject = async (projectId, filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString()
  const response = await api.get(`/tasks/${projectId}?${queryParams}`)
  return response.data
}

export const createTask = async (projectId, taskData) => {
  const response = await api.post(`/tasks/${projectId}`, taskData)
  return response.data
}

export const deleteTask = async (taskId) => {
  const response = await api.delete(`/tasks/${taskId}`)
  return response.data
}

export const updateTaskStatus = async (taskId, status) => {
  const response = await api.patch(`/tasks/${taskId}/status`, { status })
  return response.data
}

export const updateTask = async (taskId, data) => {
  const response = await api.put(`/tasks/${taskId}`, data)
  return response.data
}

export const getTaskById = async (taskId) => {
  const response = await api.get(`/tasks/${taskId}`)
  return response.data
}