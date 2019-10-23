const jwt = require('jsonwebtoken')

const validateToken = (token) => {
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    throw new Error('token missing or invalid')
  }
  return decodedToken
}

module.exports = { validateToken }