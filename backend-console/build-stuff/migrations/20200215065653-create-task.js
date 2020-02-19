/*
 * @Author: your name
 * @Date: 2020-02-15 14:56:53
 * @LastEditTime: 2020-02-15 14:57:37
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/database/migrations/20200215065653-create-task.js
 */
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Tasks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      key: {
        type: Sequelize.STRING,
        unique: true
      },
      handler: {
        type: Sequelize.STRING
      },
      params: {
        type: Sequelize.STRING
      },
      src: {
        type: Sequelize.STRING
      },
      dest: {
        type: Sequelize.STRING
      },
      file_info:{
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.STRING
      },
      errmsg: {
        type: Sequelize.STRING
      },
      try: {
        type: Sequelize.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Tasks');
  }
};