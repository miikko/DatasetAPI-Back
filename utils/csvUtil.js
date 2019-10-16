const parseDataset = (content) => {
  const dataset = {}
  const lines = content.split('\n')
  let lineNum = 0
  let separator = ','
  lines.forEach(line => {
    lineNum++
    //Check if line is empty/whitespace
    if (/\S/.test(line)) {
      const modLine = line.split('\r')[0]
      if (lineNum == 1) {
        if (modLine.indexOf(';') !== -1) {
          separator = ';'
        }
      }
      const lineSplit = modLine.split(separator)
      const instance = []
      let sameItem = false
      let itemSoFar = ""
      for (let i = 0; i < lineSplit.length; i++) {
        if (sameItem) {
          itemSoFar += lineSplit[i]
          if (lineSplit.indexOf('"') !== -1) {
            if (lineNum == 1) {
              dataset.headers ? dataset.headers.push(itemSoFar) : dataset.headers = [itemSoFar]
            } else {
              instance.push(itemSoFar)
            }
            sameItem = false
            itemSoFar = ""
          }
        } else {
          if (lineNum == 1) {
            dataset.headers ? dataset.headers.push(lineSplit[i]) : dataset.headers = [lineSplit[i]]
          } else {
            instance.push(lineSplit[i])
          }
        }
      }
      if (lineNum > 1) {
        if (dataset.headers.length !== instance.length) {
          console.log(`Data instance (on line ${lineNum}) value count didnt match the specification`)
          throw new Error('Invalid .csv-file')
        }
        dataset.instances ? dataset.instances.push(instance) : dataset.instances = [instance]
      }
    }
  })
  return dataset
}

const datasetToString = (dataset) => {
  let content = ''
  if (dataset.headers) {
    dataset.headers.forEach(header => {
      if (header.name) {
        content += elementToString(header.name) + ','
      } else {
        content += elementToString(header) + ','
      }
    })
    content = content.substring(0, content.length - 1) + '\n'
  }
  dataset.instances.forEach(instance => {
    let line = ''
    instance.forEach(value => {
      line += elementToString(value) + ','
    })
    content += line.substring(0, line.length - 1) + '\n'
  })
  return content
}

const elementToString = (element) => {
  if (element.indexOf(',') !== -1) {
    return '"' + element + '"'
  }
  return element
}

module.exports = { parseDataset, datasetToString }