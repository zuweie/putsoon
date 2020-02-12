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
      email:    'qq@qq.com',
      password: '$2b$10$AfllOnNd8gG5cb7nY994kurIatBG1t5IpHEjYScqqe2mQOo9ArWNu',
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
