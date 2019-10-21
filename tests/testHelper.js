const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const Dataset = require('../models/dataset')
const User = require('../models/user')

const testDataset = {
  name: 'testDataset',
	headers: [
		'TEAM',
		'GP',
		'W'
	],
	instances: [
		[
			'Houston Rockets',
			'82',
			'65'
		],
		[
			'Toronto Raptors',
			'82',
			'59'
		],
		[
			'Golden State Warriors',
			'82',
			'58'
		]
	]
}
 
const createTestUser = async () => {
	const username = 'tester'
	const password = 'isHappy'
	//This needs to be changed if the /users router is changed
	const saltRounds = 10
	const passwordHash = await bcrypt.hash(password, saltRounds)
	const testUser = new User({ username, passwordHash })
	const savedTestUser = await testUser.save()
	return savedTestUser.toJSON()
}

const datasetsInDb = async () => {
  const datasets = await Dataset.find({})
  return datasets.map(dataset => dataset.toJSON())
}

const loginUser = async (user) => {
	const savedUser = await User.findOne({ username: user.username })
  const matchingUser = {
    username: savedUser.username,
    id: savedUser._id
  }
	const token = jwt.sign(matchingUser, process.env.SECRET)
	return token
}

module.exports = { 
	testDataset,
	createTestUser,
	datasetsInDb,
	loginUser
}