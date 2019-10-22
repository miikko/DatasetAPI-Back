const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (req, res, next) => {
  let passwordHash
  try {
    const body = req.body
    const saltRounds = 10
    passwordHash = await bcrypt.hash(body.password, saltRounds)
    const user = new User({
      username: body.username,
      passwordHash
    })
    const savedUser = await user.save()
    res.json(savedUser)
  } catch (exception) {
    if (!passwordHash) {
      return res.status(400).send({ error: 'Password missing or invalid' })
    } else {
      next(exception)
    }
  }
})

module.exports = usersRouter