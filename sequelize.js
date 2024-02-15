const { Sequelize } = require('sequelize');
const DB_FILE_PATH = './.data/pixel.db';

module.exports = new Sequelize({
  dialect: 'sqlite',
  storage: DB_FILE_PATH,
});
