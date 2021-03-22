const { expect } = require('chai')
const knex = require('knex')
const supertest = require('supertest')
const app = require('../src/app')
const { makeFolderArray } = require('./folder-fixtures')

describe('Noteful Endpoints', function() {
  let db

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
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

  describe('POST /api/folder', () => { // POST 
    it('creates a folder, responding with 201 and the new folder', () => { // CREATES A FOLDER
      const newFolder = {
        folder_name: 'New Test Folder'
      }
      return supertest(app)
        .post('/api/folder')
        .send(newFolder)
        .expect(201)
        .expect(res => {
          expect(res.body.folder_name).to.eql(newFolder.folder_name)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/api/folder/${res.body.id}`)
        })
        .then(res => {
          supertest(app)
            .get(`/api/folder/${res.body.id}`)
            .expect(res.body)
        })
    })

    const requiredFields = ['folder_name']

    requiredFields.forEach(field => {
      const newFolders = {
        folder_name: 'Test Folder'
      }

      it(`Responds with 400 and an error when the ${field} is missing`, () => { // MISSING FIELD
        delete newFolders[field]

        return supertest(app)
          .post('/api/folder')
          .send(newFolders)
          .expect(400, {
            error: { message: `Missing ${field} in request body` }
          })
      })
    }) 
  })

  describe('DELETE /api/folder/:folder_id', () => { // DELETE
    context('Given no folders', () => { // GIVEN NO FOLDER
      it('Responds with 404', () => { // RESPONDS 404
        const folderId = 123456
        return supertest(app)
          .delete(`/api/folder/${folderId}`)
          .expect(404, { error: { message: `Folder doesn't exist` } })
      })
    })

    context('Given there are folders in the db', () => { // GIVEN FOLDERS
      const testFolders = makeFolderArray()

      beforeEach('insert folder', () => {
        return db
          .into('noteful_folder')
          .insert(testFolders)
      })

      it('Responds with 204 and then removes the folder', () => { // RESPONDS 204 AND DELETES
        const idToRemove = 2
        const expectedFolder = testFolders.filter(folder => folder.id !== idToRemove)
        return supertest(app)
          .delete(`/api/folder/${idToRemove}`)
          .expect(204)
          .then(res => {
            supertest(app)
              .get('/api/folder')
              .expect(expectedFolder)
          })
      })
    })
  })
})