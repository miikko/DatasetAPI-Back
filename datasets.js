const datasetsRouter = require('express').Router()
const IncomingForm = require('formidable').IncomingForm
const fileUtil = require('./utils/fileUtil')
const Dataset = require('./models/dataset')

datasetsRouter.post('/', async (req, res) => {
  //TODO: Add user info to dataset, check if the user info is valid
  //Check if received data is a file or normal data
  if (req.is('multipart/form-data')) {
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
          instances: dataset.instances
        })
        saveDataset(datasetObject)
        //console.log(dataset)
      } catch (exception) {
        //Failed to read a dataset from the given file, return error code
        console.log(exception)
        res.status(400).send({ error: exception.message })
      }
    })
    form.on('end', () => {
      res.status(201).end()
    })
    form.parse(req)
    console.log('Request contains a file')
  } else if (req.is('application/json')) {
    console.log('Request contains json data')
    const body = req.body
    try {
      if (body.headers.length !== body.instances[0].length) {
        throw new Error('Received dataset contained missing attribute values!')
      }
      const dataset = new Dataset({
        name: body.name,
        relation: body.relation,
        headers: body.headers,
        instances: body.instances
      })
      await saveDataset(dataset)
      res.status(201).end()
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
    const datasets = await Dataset.find({})
    res.json(datasets.map(dataset => dataset.toJSON()))
  } catch (exception) {
    console.log(exception)
    res.status(500).end()
  }
})

datasetsRouter.get('/:id', async (req, res, next) => {
  try {
    const dataset = await Dataset.findById(req.params.id)
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
      const path = `${__dirname}/temp/${fileName}`
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
    //TODO: Validate token

    await Dataset.findByIdAndRemove(req.params.id)
    res.status(204).end()
  } catch (exception) {
    next(exception)
  }
})

const saveDataset = async (dataset) => {
  const savedDataset = await dataset.save()
  return savedDataset
}

module.exports = datasetsRouter