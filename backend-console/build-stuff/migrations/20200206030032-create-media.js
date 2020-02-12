/*
 * @Author: your name
 * @Date: 2020-02-06 13:46:44
 * @LastEditTime : 2020-02-09 10:59:33
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/backend-console/build-stuff/migrations/20200206030032-create-media.js
 */
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Media', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstname: {
        type: Sequelize.STRING
      },
      ext: {
        type: Sequelize.STRING
      },
      query_params: {
        type: Sequelize.STRING
      },
      signature: {
        type: Sequelize.STRING
      },
      file_hash: {
        type: Sequelize.STRING
      },
      mime: {
        type: Sequelize.STRING
      },
      bucket: {
        type: Sequelize.STRING
      },
      path: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('Media');
  }
};