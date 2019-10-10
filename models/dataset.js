const mongoose = require('mongoose')

mongoose.set("useFindAndModify", false)

const datasetSchema = mongoose.Schema({
  name: { type: String, required: true },
  relation: String,
  headers: { type: [], required: true },
  instances: { type: [[String]], required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

datasetSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Dataset', datasetSchema)