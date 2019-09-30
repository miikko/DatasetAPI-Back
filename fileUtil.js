const fs = require('fs')
const jsCharDet = require('jschardet')
const iconv = require('iconv-lite')

const supportedFileExtensions = ['.arff', '.csv', '.json']

const validate = (file) => {
  const encoding = getEncoding(file)
  if (!iconv.encodingExists(encoding)) {
    console.log(`File was encoded in a format that is not supported: ${encoding}`)
    return false
  }
  return supportedFileExtensions.includes(getFileExtension(file)) ? true : false
}

const read = async (file) => {
  const dataset = {}
  await fs.readFile(file.path, (err, data) => {
    if (err) {
      throw err
    }
    const content = iconv.decode(data, getEncoding(file))
    const fileExtension = getFileExtension(file)
  })

}

const getEncoding = (file) => {
  return jsCharDet.detect(fs.readFileSync(file.path)).encoding
}

const getFileExtension = (file) => {
  return file.name.split('.').pop()
}

module.exports = { validate, read }