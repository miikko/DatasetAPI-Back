const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const datasetsRouter = require('./datasets')

const server = express()

/*
const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
}*/

const requestLogger = (req, res, next) => {
  console.log('Method:', req.method)
  console.log('Path:  ', req.path)
  console.log('Body:  ', req.body)
  console.log('Headers: ', req.headers)
  console.log('---')
  next()
}

server.use(cors(/*corsOptions*/))
server.use(bodyParser.json())
server.use(requestLogger)

server.use('/datasets', datasetsRouter)

//Create errorHandler and use it here

const PORT = 8000

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})