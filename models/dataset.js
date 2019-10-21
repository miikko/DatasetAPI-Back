const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

mongoose.set("useFindAndModify", false)

const datasetSchema = mongoose.Schema({
  name: { type: String, required: true, unique: true },
  relation: String,
  headers: { type: [], required: true },
  instances: { type: [[String]], required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
})

datasetSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

datasetSchema.plugin(uniqueValidator)

module.exports = mongoose.model('Dataset', datasetSchema)