const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./sequelize');

module.exports.PixelLogs = sequelize.define('pixel_logs', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  headers: {
    type: DataTypes.JSON,
  },
  ip_address: {
    type: DataTypes.STRING,
  },
  pixel_id: {
    type: DataTypes.STRING,
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  timestamps: false,
});
