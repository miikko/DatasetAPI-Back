const mongoose = require('mongoose')

mongoose.set("useFindAndModify", false)

const datasetSchema = mongoose.Schema({
  relation: String,
  headers: { type: [], required: true },
  instances: {type: [[String]], required: true }
})

datasetSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Dataset', datasetSchema)