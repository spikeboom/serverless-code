const Sequelize = require('sequelize');

const sequelize = new Sequelize('innodb', 'admin', 'adminroot123', {
  dialect: 'mysql', port: 3306,
  host: 'database-2.cgri2measzkv.us-east-2.rds.amazonaws.com'
});

// const sequelize = new Sequelize('database-1', 'root', 'rootROOT123', {
//   dialect: 'mysql', port: 3306,
//   host: 'localhost'
// });

module.exports = sequelize;