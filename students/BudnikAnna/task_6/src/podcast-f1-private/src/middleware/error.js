function notFound(req, res) {
  res.status(404).json({ message: 'Not found' })
}

function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500
  const message = err.message || 'Internal server error'
  res.status(status).json({ message })
}

module.exports = { notFound, errorHandler }