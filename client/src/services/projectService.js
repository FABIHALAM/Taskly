import api from './api'

export const createProject = async (projectData) => {
  const response = await api.post('/projects', projectData)
  return response.data
}

export const getMyProjects = async () => {
  const response = await api.get('/projects')
  return response.data
}

export const getProjectById = async (id) => {
  const response = await api.get(`/projects/${id}`)
  return response.data
}

export const updateProject = async (id, projectData) => {
  const response = await api.put(`/projects/${id}`, projectData)
  return response.data
}

export const deleteProject = async (id) => {
  const response = await api.delete(`/projects/${id}`)
  return response.data
}

// Member management
export const addMember = async (projectId, email) => {
  const response = await api.post(`/projects/${projectId}/members`, { email })
  return response.data
}

export const removeMember = async (projectId, userId) => {
  const response = await api.delete(`/projects/${projectId}/members/${userId}`)
  return response.data
}