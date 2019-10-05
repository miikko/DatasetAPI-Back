require('dotenv').config()
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const datasetsRouter = require('./datasets')
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

server.use('/datasets', datasetsRouter)

//Create errorHandler and use it here
server.use(middleware.errorHandler)
server.use(middleware.unknownEndpoint)

const PORT = process.env.PORT

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})