'use strict';
module.exports = (sequelize, DataTypes) => {
  const Token = sequelize.define('Token', {
    name: DataTypes.STRING,
    ak: DataTypes.STRING,
    sk: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    expireIn: DataTypes.INTEGER
  }, {});
  Token.associate = function(models) {
    // associations can be defined here
  };
  return Token;
};