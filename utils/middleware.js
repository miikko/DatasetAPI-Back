const requestLogger = (req, res, next) => {
  console.log('Method:', req.method)
  console.log('Path:  ', req.path)
  console.log('Body:  ', req.body)
  console.log('Headers: ', req.headers)
  console.log('---')
  next()
}

const errorHandler = (error, req, res, next) => {
  console.log(error.message)
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
          error: 'invalid token'
      })
  }
  next(error)
}

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

const tokenExtractor = (req, res, next) => {
  const auth = req.get('authorization')
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    req.token = auth.substring(7)
  }
  next()
}

module.exports = {
  requestLogger, unknownEndpoint, errorHandler, tokenExtractor
}