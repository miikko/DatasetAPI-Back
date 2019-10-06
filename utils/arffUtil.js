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
    attribute.name = line.split(' ').filter(Boolean)[1]
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

const datasetToString = (dataset) => {
  let content = ''
  let relation = dataset.relation || dataset.name
  if (relation.indexOf(' ') !== -1) {
    relation = "'" + relation + "'"
  }
  content += `@RELATION ${relation}\n\n`
  for (let i = 0; i < dataset.headers.length; i++) {
    content += writeAttributeLine(dataset.headers[i], dataset.instances[0][i]) + '\n'
  }
  content += '\n@DATA\n'
  dataset.instances.forEach(instance => {
    instance.forEach(value => {
      content += value + ','
    })
    content = content.substring(0, content.length - 1) + '\n'
  })
  return content
}

const writeAttributeLine = (header, sampleValue) => {
  let line = '@ATTRIBUTE '
  if (header.type) {
    if (header.type === 'NOMINAL') {
      line += `${header.name} {`
      header.nominalSpecification.forEach(specification => {
        if (specification.indexOf(' ') !== -1) {
          line += "'" + specification + "',"
        } else {
          line += specification + ","
        }
      })
      line = line.substring(0, line.length - 1) + '}'
    } else {
      let name = header.name
      if (name.indexOf(' ') !== -1) {
        name = "'" + name + "'"
      }
      line += `${name} ${header.type}`
    }
  } else {
    if (isNaN(sampleValue)) {
      line += `${header.name || header} STRING`
    } else {
      line += `${header.name || header} NUMERIC`
    }
  }
  return line
}

module.exports = { parseDataset, datasetToString }