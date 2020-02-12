'use strict';
module.exports = (sequelize, DataTypes) => {
  const AdminUser = sequelize.define('AdminUser', {
    nickname: DataTypes.STRING,
    login: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    role: DataTypes.STRING,
    permissions: DataTypes.STRING
  }, {});
  AdminUser.associate = function(models) {
    // associations can be defined here
  };
  return AdminUser;
};