/*
 * @Author: your name
 * @Date: 2020-02-28 18:09:17
 * @LastEditTime: 2020-02-28 18:32:53
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/backend-console/seeding.js
 */

 'use strict';

 const shell = require('shelljs');
 module.exports = () => {
    console.debug('migrating && seeding...')
    shell.exec('npx sequelize-cli db:migrate');
    shell.exec('npx sequelize-cli db:seed:all');
 }
