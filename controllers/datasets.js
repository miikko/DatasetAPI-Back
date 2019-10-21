const datasetsRouter = require('express').Router()
const IncomingForm = require('formidable').IncomingForm
const fileUtil = require('../utils/fileUtil')
const jwt = require('jsonwebtoken')
const Dataset = require('../models/dataset')
const User = require('../models/user')

const validateToken = (token) => {
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    throw new Error('token missing or invalid')
  }
  return decodedToken
}

const saveDataset = async (dataset) => {
  const savedDataset = await dataset.save()
  const datasetWithUser = await Dataset.findById(savedDataset.id)
    .populate('user', { username: 1 })
  return datasetWithUser
}

const filterObjectKeys = (dataset, wantedKeys) => {
  const keys = Object.keys(dataset)
  keys.forEach(key => {
    if (!wantedKeys.includes(key)) {
      delete dataset[key]
    }
  })
}

const handleJSONPost = async (req, res, user) => {
  try {
    const body = req.body
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
    const savedDataset = await saveDataset(dataset, user._id)
    res.status(201).json(savedDataset.toJSON())
  } catch (exception) {
    //Received data was in the wrong format
    res.status(400).send({ error: exception.message })
  }
}

const handleFilePost = (req, res, next, user) => {
  let savePromise
  const form = new IncomingForm()
  form.on('file', (field, file) => {
    if (!fileUtil.validate(file)) {
      throw Error('Invalid file extension or file encoding')
    }
    const dataset = fileUtil.read(file)
    const datasetObject = new Dataset({
      name: file.name.split('.')[0],
      relation: dataset.relation,
      headers: dataset.headers,
      instances: dataset.instances,
      user: user._id
    })
    savePromise = saveDataset(datasetObject, user._id)
  })
  form.on('end', async () => {
    try {
      const savedDataset = await savePromise
      res.status(201).json(savedDataset.toJSON())
    } catch (exception) {
      next(exception)
    }
  })
  form.on('error', (err) => {
    res.status(400).send({ error: err.message })
  })
  form.parse(req)
}

datasetsRouter.post('/', async (req, res, next) => {
  let token
  try {
    token = validateToken(req.token)
  } catch (exception) {
    return next(exception)
  }
  const user = await User.findById(token.id)
  //Check if received data is a file or normal data
  if (req.is('multipart/form-data')) {
    handleFilePost(req, res, next, user)
  } else if (req.is('application/json')) {
    handleJSONPost(req, res, user)
  } else {
    res.status(400).send({ error: 'Invalid content-type header' })
  }
})

datasetsRouter.get('/', async (req, res) => {
  try {
    const datasets = await Dataset.find({}).populate('user')
    let jsonDatasets = await Promise.all(datasets.map(dataset => dataset.toJSON()))
    if (req.query.fields) {
      const fields = req.query.fields.split(',')
      jsonDatasets.forEach(dataset => {
        filterObjectKeys(dataset, fields)
      })
    }
    if (req.query.username) {
      jsonDatasets = jsonDatasets.filter(dataset => {
        return dataset.user ? dataset.user.username === req.query.username : false
      })
    }
    if (req.query.name) {
      jsonDatasets = jsonDatasets.filter(dataset => {
        return dataset.name ? dataset.name === req.query.name : false
      })
    }
    if (req.query.limit_instances) {
      jsonDatasets.forEach(dataset => {
        if (dataset.instances) {
          dataset.instances = dataset.instances.slice(0, req.query.limit_instances)
        }
      })
    }
    res.json(jsonDatasets)
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
      const jsonDataset = await dataset.toJSON()
      if (req.query.fields) {
        const fields = req.query.fields.split(',')
        filterObjectKeys(jsonDataset, fields)
      }
      if (req.query.limit_instances && jsonDataset.instances) {
        jsonDataset.instances = jsonDataset.instances.slice(0, req.query.limit_instances)
      }
      res.json(jsonDataset)
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
  try {
    const token = validateToken(req.token)
    const datasetId = req.params.id
    const datasetToRemove = await Dataset.findById(datasetId)
    if (token.id.toString() !== datasetToRemove.user._id.toString()) {
      return res.status(401).json({ error: 'invalid user' })
    }
    await Dataset.findByIdAndDelete(datasetId)
    res.status(204).end()
  } catch (exception) {
    next(exception)
  }
})

module.exports = datasetsRouter