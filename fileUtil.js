const fs = require('fs')
const jsCharDet = require('jschardet')
const iconv = require('iconv-lite')

const supportedFileExtensions = ['arff', 'csv', 'json']

const validate = (file) => {
  const encoding = getEncoding(file)
  if (!iconv.encodingExists(encoding)) {
    console.log(`File was encoded in a format that is not supported: ${encoding}`)
    return false
  }
  return supportedFileExtensions.includes(getFileExtension(file)) ? true : false
}

const read = (file) => {
  const contentBuffer = fs.readFileSync(file.path)
  const content = iconv.decode(contentBuffer, getEncoding(file))
  const fileExtension = getFileExtension(file)
  if (fileExtension === 'arff') {
    return require('./arffUtil').parseDataset(content)
  }
  
}

const getEncoding = (file) => {
  return jsCharDet.detect(fs.readFileSync(file.path)).encoding
}

const getFileExtension = (file) => {
  return file.name.split('.').pop()
}

module.exports = { validate, read }