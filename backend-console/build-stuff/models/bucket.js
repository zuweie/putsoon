'use strict';
module.exports = (sequelize, DataTypes) => {
  const Bucket = sequelize.define('Bucket', {
    bucket: DataTypes.STRING,
    description: DataTypes.STRING,
    is_private: DataTypes.BOOLEAN,
    user_id: DataTypes.INTEGER
  }, {});
  Bucket.associate = function(models) {
    // associations can be defined here
  };
  return Bucket;
};