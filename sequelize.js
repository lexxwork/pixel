const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.NODE_ENV === 'production') {
  sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    dialectOptions: {
      ssl: true,
    },
  });
} else {
  const DB_FILE_PATH = './.data/pixel.db';
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: DB_FILE_PATH,
  });
}

module.exports = sequelize;
