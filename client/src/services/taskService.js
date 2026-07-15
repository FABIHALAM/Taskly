import api from './api'

export const getTasksByProject = async (projectId) => {
  const response = await api.get(`/tasks/${projectId}`)
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