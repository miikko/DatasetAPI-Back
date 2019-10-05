const parseDataset = (content) => {
  const dataset = {}
  const lines = content.split('\n')
  let relationFound = false
  let readingDataInstances = false
  let lineNum = 0
  lines.forEach(line => {
    lineNum++
    //Check if line is empty/whitespace or comment
    if (/\S/.test(line) && line.charAt(0) !== '%') {
      const modLine = line.split('\r')[0].replace('\t', ' ')
      if (readingDataInstances) {
        const dataInstance = parseDataInstance(modLine)
        if (dataInstance.length !== dataset.headers.length) {
          console.log(`Data instance (on line ${lineNum}) value count didnt match the specification`)
          throw new Error('Invalid .arff-file')
        }
        dataset.instances ? dataset.instances.push(dataInstance) : dataset.instances = [dataInstance]
      } else if (modLine.substring(0, 9).toUpperCase() === '@RELATION') {
        dataset.relation = parseRelation(modLine)
        relationFound = true
      } else if (modLine.substring(0, 10).toUpperCase() === '@ATTRIBUTE') {
        if (!relationFound) {
          throw new Error('Invalid .arff-file')
        }
        const attribute = parseAttribute(modLine)
        dataset.headers ? dataset.headers.push(attribute) : dataset.headers = [attribute]
      } else if (modLine.substring(0, 5).toUpperCase() === '@DATA') {
        if (!relationFound) {
          throw new Error('Invalid .arff-file')
        }
        readingDataInstances = true
      }
    }
  })
  return dataset
}

const parseRelation = (line) => {
  if (line.indexOf("'") !== -1) {
    return line.split("'")[1]
  }
  return line.split(' ').filter(Boolean)[1]
}

const parseAttribute = (line) => {
  const attribute = {}
  if (line.indexOf('{') !== -1) {
    attribute.type = 'NOMINAL'
    attribute.nominalSpecification = line.substring(line.indexOf('{') + 1, line.indexOf('}')).split(',')
  }
  if (line.indexOf("'") !== -1) {
    attribute.name = line.split("'")[1]
    if (!attribute.type) {
      const restOfLine = line.split("'")[2]
      attribute.type = restOfLine.replace(/ /g, '').toUpperCase()
    }
  } else {
    attribute.name = line.split(' ').filter(Boolean)[1]
    if (!attribute.type) {
      //.filter(Boolean) is for removing empty strings that might appear after the split()
      attribute.type = line.split(' ').filter(Boolean)[2].toUpperCase()
    }
  }
  return attribute
}

const parseDataInstance = (line) => {
  return line.split(',')
}

module.exports = { parseDataset }