const sendSuccess = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  })
}

const sendError = (res, statusCode, message, details = null) => {
  const finalMessage = (message === 'Server error' && details) ? details : message
  return res.status(statusCode).json({
    success: false,
    message: finalMessage,
    details,
  })
}

module.exports = { sendSuccess, sendError }