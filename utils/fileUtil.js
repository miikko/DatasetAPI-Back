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
  } else if (fileExtension === 'csv') {
    return require('./csvUtil').parseDataset(content)
  } else if (fileExtension === 'json') {
    return JSON.parse(content)
  }
}

const write = (dataset, fileExtension) => {
  if (!supportedFileExtensions.includes(fileExtension)) {
    throw new Error('Requested file-extension is not supported')
  }
  const fileName = `${dataset.name}.${fileExtension}`
  let content = ''
  if (fileExtension === 'arff') {
    content = require('./arffUtil').datasetToString(dataset)
  } else if (fileExtension === 'csv') {
    content = require('./csvUtil').datasetToString(dataset)
  } else if (fileExtension === 'json') {
    content = JSON.stringify(dataset)
  }
  fs.writeFileSync(`temp/${fileName}`, content)
  return fileName
}

const remove = (path) => {
  fs.unlinkSync(path)
}

const getEncoding = (file) => {
  return jsCharDet.detect(fs.readFileSync(file.path)).encoding
}

const getFileExtension = (file) => {
  return file.name.split('.').pop()
}

module.exports = { validate, read, write, remove }