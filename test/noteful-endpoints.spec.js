const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeFolderArray } = require('./folder-fixtures')

describe('Noteful Endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db('noteful_folder').truncate())

  afterEach('cleanup', () => db('noteful_folder').truncate())

  describe('GET /api/folder', () => { // GET FOLDER
    context('Given there are no folders', () => { // NO FOLDERS IN DB
      return supertest(app)
        .get('/api/folder')
        .expect(200, [])
    })

    context('Given there are folders in db', () => {
      const testFolders = makeFolderArray()

      beforeEach('insert folder', () => {
        return db
          .into('noteful_folder')
          .insert(testFolders)
          .then(() => {
            return db
              .into('noteful_folder')
              .insert(testFolders)
          })
      })

      it('responds with 200 and all of the folders', () => {
        return supertest(app)
          .get('./api/folder')
          .expect(200, testFolders)
      })
    })
  })
})