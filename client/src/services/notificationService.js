import api from './api'

export const getNotifications = async () => {
  const res = await api.get('/notifications')
  return res.data
}

export const markAllRead = async () => {
  const res = await api.patch('/notifications/read-all')
  return res.data
}

export const markOneRead = async (id) => {
  const res = await api.patch(`/notifications/${id}/read`)
  return res.data
}
