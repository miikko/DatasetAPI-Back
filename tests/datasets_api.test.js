const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const testHelper = require('./testHelper')
const Dataset = require('../models/dataset')
const User = require('../models/user')
const api = supertest(app)
let testUser
let token
let testDataset
let testDatasetObject

beforeAll(async () => {
  await User.deleteMany({})
  testUser = await testHelper.createTestUser()
  token = await testHelper.loginUser(testUser)
  testDataset = testHelper.testDataset
  testDataset.user = testUser.id
})

describe('GET Requests', () => {
  
  beforeEach(async () => {
    await Dataset.deleteMany({})
    testDatasetObject = new Dataset(testDataset)
    await testDatasetObject.save()
  })

  describe('Request all datasets', () => {

    test('asking for all datasets returns them as JSON', async () => {
      await api
        .get('/datasets')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })
  })
  
  describe('Request single dataset', () => {

    test('asking without format returns the dataset as JSON', async () => {
      await api
        .get(`/datasets/${testDatasetObject.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })
  
    test('asking with format returns the dataset as a file', async () => {
      await api
        .get(`/datasets/${testDatasetObject.id}/csv`)
        .expect(200)
        .expect('Content-Type', /text\/csv/)
    })
  })
})

describe('POST Requests', () => {

  beforeEach(async () => {
    await Dataset.deleteMany({})
  })

  test('a valid dataset-JSON can be added', async () => {
    await api
      .post('/datasets')
      .set('Authorization', `bearer ${token}`)
      .send(testDataset)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const datasetsInDb = await testHelper.datasetsInDb()
    expect(datasetsInDb.length).toBe(1)
  })

  test('a valid dataset-file can be added', async () => {
    await api
      .post('/datasets')
      .set('Authorization', `bearer ${token}`)
      .attach('file', `${__dirname}/kohtaus_v1.csv`)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    const datasetsInDb = await testHelper.datasetsInDb()
    expect(datasetsInDb.length).toBe(1)
  })

  test ('cannot add datasets without a valid authorization token', async () => {
    await api
      .post('/datasets')
      .set('Authorization', 'bearer notAValidToken')
      .attach('file', `${__dirname}/kohtaus_v1.csv`)
      .expect(401)
    const datasetsInDb = await testHelper.datasetsInDb()
    expect(datasetsInDb.length).toBe(0)
  })
})

describe('DELETE Requests', () => {

  beforeEach(async () => {
    await Dataset.deleteMany({})
    testDatasetObject = new Dataset(testDataset)
    await testDatasetObject.save()
  })

  test('user that didnt upload dataset cannot delete that dataset', async () => {
    await api
      .delete(`/datasets/${testDatasetObject.id}`)
      .set('Authorization', 'bearer notAValidToken')
      .expect(401)
    const datasetsInDb = await testHelper.datasetsInDb()
    expect(datasetsInDb.length).toBe(1)
  })

  test('user that uploaded dataset can delete that dataset', async () => {
    await api
      .delete(`/datasets/${testDatasetObject.id}`)
      .set('Authorization', `bearer ${token}`)
      .expect(204)
    const datasetsInDb = await testHelper.datasetsInDb()
    expect(datasetsInDb.length).toBe(0)
  })
})



afterAll(() => {
  mongoose.connection.close()
})