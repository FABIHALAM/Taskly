import api from './api'

export const getDashboardAnalytics = async () => {
  const response = await api.get('/analytics/dashboard')
  return response.data
}

export const getProjectAnalytics = async (projectId) => {
  const response = await api.get(`/analytics/projects/${projectId}`)
  return response.data
}
