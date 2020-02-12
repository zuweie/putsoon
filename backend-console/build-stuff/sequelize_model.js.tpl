/*
 * @Author: your name
 * @Date: 2020-02-03 11:10:36
 * @LastEditTime : 2020-02-03 15:30:16
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/backend-console/build-stuff/sequelize_model.js
 */
'use strict';
const Sequelize = require('sequelize');
const sequelize = require('./conn')();

module.exports = (m) => {
    let sequelize_model = require('./models/'+m)(sequelize, Sequelize);
    return sequelize_model;
}