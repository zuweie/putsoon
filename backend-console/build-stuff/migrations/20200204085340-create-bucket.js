/*
 * @Author: your name
 * @Date: 2020-02-04 16:55:03
 * @LastEditTime: 2020-02-05 11:23:28
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/backend-console/build-stuff/migrations/20200204085340-create-bucket.js
 */
'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Buckets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      bucket: {
        type: Sequelize.STRING,
        unique: true
      },
      description: {
        type: Sequelize.STRING
      },
      is_private: {
        type: Sequelize.BOOLEAN
      },
      user_id: {
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
    return queryInterface.dropTable('Buckets');
  }
};