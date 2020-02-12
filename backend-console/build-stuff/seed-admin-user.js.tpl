/*
 * @Author: your name
 * @Date: 2019-12-12 12:02:53
 * @LastEditTime: 2019-12-12 13:30:34
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-mini-admin/build-staff/seed-admin-user.js
 */
'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('{tablename}', [{
      nickname: '{nickname}',
      login:    '{login}',
      email:    '{email}',
      password: '{password}',
      createdAt: new Date(),
      updatedAt: new Date(),
    }], {});
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    return queryInterface.bulkDelete('AdminUser', null, {});
  }
};
