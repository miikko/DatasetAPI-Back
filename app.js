const config = require('./utils/config')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const datasetsRouter = require('./controllers/datasets')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')

global.appRoot = __dirname

const app = express()

mongoose.connect(config.MONGODB_URI,
  { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB: ' + error.message)
  })

app.use(cors())
app.use(bodyParser.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use('/datasets', datasetsRouter)
app.use('/users', usersRouter)
app.use('/login', loginRouter)

app.use(middleware.errorHandler)

module.exports = app