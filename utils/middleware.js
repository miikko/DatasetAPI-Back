const logger = require('./logger')

const requestLogger = (req, res, next) => {
  logger.info('Method:', req.method)
  logger.info('Path:  ', req.path)
  logger.info('Body:  ', req.body)
  //logger.info('Headers: ', req.headers)
  logger.info('---')
  next()
}

const errorHandler = (error, req, res, next) => {
  if (error.kind) {
    logger.error(error.kind)
  }
  logger.error(error.message)
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return res.status(400).json({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message })
  } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
          error: 'invalid token'
      })
  }
  return res.status(404).send({ error: 'unknown endpoint' })
}

const tokenExtractor = (req, res, next) => {
  const auth = req.get('authorization')
  if (auth && auth.toLowerCase().startsWith('bearer ')) {
    req.token = auth.substring(7)
  }
  next()
}

module.exports = {
  requestLogger, errorHandler, tokenExtractor
}