const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const storage = process.env.DB_STORAGE || path.join(__dirname, 'database.sqlite');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage,
  logging: false,
});

const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  passwordHash: { type: DataTypes.STRING, allowNull: false },
});

const Task = sequelize.define('Task', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
});

User.hasMany(Task, { foreignKey: 'ownerId' });
Task.belongsTo(User, { foreignKey: 'ownerId' });

module.exports = { sequelize, User, Task };
