const bcrypt = require('bcryptjs')
const usersRouter = require('express').Router()
const { validateToken } = require('../utils/authUtil')
const User = require('../models/user')
const Dataset = require('../models/dataset')

const hashPassword = async (password) => {
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)
  return passwordHash
}

usersRouter.post('/', async (req, res, next) => {
  let passwordHash
  try {
    const body = req.body
    passwordHash = await hashPassword(body.password)
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

usersRouter.delete('/:id', async (req, res, next) => {
  try {
    const token = validateToken(req.token)
    const userToRemove = await User.findById(req.params.id)
    if (token.id.toString() !== userToRemove._id.toString()) {
      return res.status(401).json({ error: 'invalid user' })
    }
    await Dataset.deleteMany({ user: userToRemove._id})
    await User.findByIdAndDelete(req.params.id)
    return res.status(204).end()
  } catch (exception) {
    next(exception)
  }
})

usersRouter.put('/:id', async (req, res, next) => {
  let passwordHash
  try {
    const token = validateToken(req.token)
    const userToUpdate = await User.findById(req.params.id)
    if (token.id.toString() !== userToUpdate._id.toString()) {
      return res.status(401).json({ error: 'invalid id or token' })
    }
    passwordHash = await hashPassword(req.body.password)
    const user = { username: userToUpdate.username, passwordHash}
    await User.findByIdAndUpdate(req.params.id, user, { new: true })
    res.status(201).end()
  } catch (exception) {
    if (!passwordHash) {
      return res.status(400).send({ error: 'Password missing or invalid' })
    } else {
      next(exception)
    }
  }
})

module.exports = usersRouter