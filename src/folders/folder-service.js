const FolderService = {
  getAllFolders(knex) {
    return knex.select('*').from('noteful_folder')
  }
}

module.exports = FolderService