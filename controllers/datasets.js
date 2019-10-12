const datasetsRouter = require('express').Router()
const IncomingForm = require('formidable').IncomingForm
const fileUtil = require('../utils/fileUtil')
const jwt = require('jsonwebtoken')
const Dataset = require('../models/dataset')
const User = require('../models/user')

const validateToken = (req, res, next) => {
  try {
    const decodedToken = jwt.verify(req.token, process.env.SECRET)
    if (!req.token || !decodedToken.id) {
      res.status(401).json({ error: 'token missing or invalid' })
      return
    }
    return decodedToken
  } catch (exception) {
    next(exception)
  }
}

datasetsRouter.post('/', async (req, res, next) => {
  const token = validateToken(req, res, next)
  if (!token) {
    return
  }
  const body = req.body
  const user = await User.findById(token.id)
  //Check if received data is a file or normal data
  if (req.is('multipart/form-data')) {
    console.log('Request contains a file')
    const form = new IncomingForm()
    form.on('file', (field, file) => {
      //Do things with the received file
      if (!fileUtil.validate(file)) {
        res.status(400).send({ error: 'Invalid file extension or file encoding' })
      }
      try {
        const dataset = fileUtil.read(file)
        const datasetObject = new Dataset({
          name: file.name.split('.')[0],
          relation: dataset.relation,
          headers: dataset.headers,
          instances: dataset.instances,
          user: user._id
        })
        saveDataset(datasetObject, user)
      } catch (exception) {
        //Failed to read a dataset from the given file, return error code
        console.log(exception)
        res.status(400).send({ error: exception.message })
      }
    })
    form.on('end', async () => {
      res.status(201).end()
    })
    form.parse(req)
  } else if (req.is('application/json')) {
    console.log('Request contains json data')
    try {
      if (body.headers.length !== body.instances[0].length) {
        throw new Error('Received dataset contained missing attribute values!')
      }
      const dataset = new Dataset({
        name: body.name,
        relation: body.relation,
        headers: body.headers,
        instances: body.instances,
        user: user._id
      })
      const savedDataset = await saveDataset(dataset, user)
      const datasetWithUser = await Dataset.findById(savedDataset.id)
        .populate('user', { username: 1 })
      res.status(201).json(datasetWithUser.toJSON())
    } catch (exception) {
      //Received data was in the wrong format
      res.status(400).send({ error: exception.message })
    }
  } else {
    res.status(400).send({ error: 'Invalid content-type header' })
  }
})

datasetsRouter.get('/', async (req, res) => {
  try {
    const datasets = await Dataset
      .find({}).populate('user', { username: 1 })
    res.json(datasets.map(dataset => dataset.toJSON()))
  } catch (exception) {
    console.log(exception)
    res.status(500).end()
  }
})

datasetsRouter.get('/:id', async (req, res, next) => {
  try {
    const dataset = await Dataset
      .findById(req.params.id).populate('user', { username: 1 })
    if (dataset) {
      res.json(dataset.toJSON())
    } else {
      res.status(204).end()
    }
  } catch (exception) {
    next(exception)
  }
})

datasetsRouter.get('/:id/:format', async (req, res, next) => {
  try {
    const dataset = await Dataset.findById(req.params.id)
    if (dataset) {
      const fileName = fileUtil.write(dataset.toJSON(), req.params.format)
      // eslint-disable-next-line no-undef
      const path = `${appRoot}/temp/${fileName}`
      //Remove file after creating it to save memory
      res.download(path, (err) => {
        if (err) {
          console.log(err)
        } else {
          fileUtil.remove(path)
        }
      })
    } else {
      res.status(204).end()
    }
  } catch (exception) {
    next(exception)
  }
})

datasetsRouter.delete('/:id', async (req, res, next) => {
  const token = validateToken(req, res, next)
  if (!token) {
    return
  }
  try {
    const datasetToRemove = await Dataset.findById(req.params.id)
    if (token.id.toString() !== datasetToRemove.user._id.toString()) {
      return res.status(401).json({ error: 'invalid user' })
    }
    await Dataset.findByIdAndDelete(req.params.id)
    res.status(204).end()
  } catch (exception) {
    next(exception)
  }
})

const saveDataset = async (dataset, user) => {
  const savedDataset = await dataset.save()
  user.datasets = user.datasets.concat(savedDataset._id)
  await user.save()
  return savedDataset
}

module.exports = datasetsRouter