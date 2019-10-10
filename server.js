require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const datasetsRouter = require('./controllers/datasets')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')

const server = express()

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB: ' + error.message)
  })

server.use(cors())
server.use(bodyParser.json())
server.use(middleware.requestLogger)
server.use(middleware.tokenExtractor)

server.use('/datasets', datasetsRouter)
server.use('/users', usersRouter)
server.use('/login', loginRouter)

server.use(middleware.errorHandler)
server.use(middleware.unknownEndpoint)

const PORT = process.env.PORT

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})