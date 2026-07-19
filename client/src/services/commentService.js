import api from './api'

export const getComments = async (taskId) => {
  const res = await api.get(`/comments/${taskId}`)
  return res.data
}

export const addComment = async (taskId, text) => {
  const res = await api.post(`/comments/${taskId}`, { text })
  return res.data
}

export const deleteComment = async (commentId) => {
  const res = await api.delete(`/comments/edit/${commentId}`)
  return res.data
}
