const path = require('path')
const express = require('express')
const xss = require('xss')
const FolderService = require('./folder-service')

const folderRouter = express.Router()
const jsonParser = express.json()

const serializeFolder = folder => ({
  id: folder.id,
  folder_name: xss(folder.folder_name)
})

folderRouter
  .get('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    FolderService.getAllFolders(knexInstance)
      .then(folders => {
        res.json(folders.map(serializeFolder))
      })
      .catch(next)
  })

  module.exports = folderRouter