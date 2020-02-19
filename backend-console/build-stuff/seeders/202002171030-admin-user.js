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
    return queryInterface.bulkInsert('AdminUsers', [{
      nickname: 'joe',
      login:    'admin',
      email:    '1234@qq.com',
      password: '$2b$10$tUf.3wsUJa5M9F9n824vreI7uTmE3sLU1xNc/F1oVHv1eBWSeg9ou',
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
