import api from './api'

export const getRecentActivity = async () => {
  const response = await api.get('/activity')
  return response.data
}