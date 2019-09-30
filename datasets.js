const datasetsRouter = require('express').Router()
const IncomingForm = require('formidable').IncomingForm
const fileUtil = require('./fileUtil')

datasetsRouter.post('/', (req, res) => {
  //Check if received data is a file or normal data
  if (req.is('multipart/form-data')) {
    const form = new IncomingForm()
    form.on('file', async (field, file) => {
      //Do things with the received file
      if (!fileUtil.validate(file)) {
        //Not a valid file, return error code
        //return
      }
      console.log(fileUtil.read(file))
      //console.log(file)
    })
    form.on('end', () => {
      res.json()
    })
    form.parse(req)
    //If received data is a file, use fileUtil to validate
    //and parse the data to a mongoose Object
    console.log('Request contains a file')
  } else if (req.is('application/json')) {
    console.log('Request contains json data')
  } else {
    //Request didnt have a file or json header, return error code
  }


  //Otherwise do the normal procedure (Follow instructions)

  //Send the mongoose Object to database

})

module.exports = datasetsRouter