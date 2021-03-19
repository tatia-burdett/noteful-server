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
      it('responds with 200 and an empty list', () => { // RESPONDS 200 + EMPTY
        return supertest(app)
        .get('/api/folder')
        .expect(200, [])
      })
    })

    context('Given there are folders in db', () => {  // GIVE FOLDERS IN DB
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

      it('responds with 200 and all of the folders', () => { // RESPONDS ALL FOLDERS
        return supertest(app)
          .get('/api/folder')
          .expect(200, testFolders)
      })
    })
  })

  describe('GET /api/folder/:folder_id', () => { // GET FOLDER BY ID

    context('Given there are no folders', () => { // NO FOLDERS IN BD
      it('responds with 404', () => { // RESPONDS 404
        const folderId = 123456
        return supertest(app)
          .get(`/api/folder/${folderId}`)
          .expect(404, { error: { message: `Folder doesn't exist` } })
      })
    })

    context('Given there are folders in the db', () => { // GIVEN FOLDERS IN DB
      const testFolders = makeFolderArray()

      beforeEach('insert folders', () => {
        return db
          .into('noteful_folder')
          .insert(testFolders)
          .then(() => {
            return db
              .into('noteful_folder')
              .insert(testFolders)
          })
      })

      it('responds with 200 and the specified folder', () => { // RESPONDS SPECIFIC FOLDER
        const folderId = 2
        const expectedFolder = testFolders[folderId - 1]
        return supertest(app)
          .get(`/api/folder/${folderId}`)
          .expect(200, expectedFolder)
      })
    })
  })
})