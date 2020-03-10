/*
 * @Author: your name
 * @Date: 2020-02-15 14:59:54
 * @LastEditTime: 2020-03-09 20:47:46
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/backend-console/build-stuff/models/task.js
 */
'use strict';
module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    name: DataTypes.STRING,
    key: DataTypes.STRING,
    handler: DataTypes.STRING,
    params: DataTypes.STRING,
    src: DataTypes.STRING,
    dest: DataTypes.STRING,
    file_info: DataTypes.STRING,
    status: DataTypes.STRING,
    percent: DataTypes.INTEGER,
    worker:DataTypes.INTEGER,
    executor:DataTypes.STRING,
    errmsg: DataTypes.STRING,
    try: DataTypes.INTEGER
  }, {});
  Task.associate = function(models) {
    // associations can be defined here
  };
  return Task;
};