/*
 * @Author: your name
 * @Date: 2020-02-03 11:10:14
 * @LastEditTime : 2020-02-03 15:30:28
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/backend-console/build-stuff/conn.js
 */
'use strict';
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname+'/config/database.json');
const Sequelize = require('sequelize');
let conn = null;

module.exports = () => {
    if (!conn) {
        conn = new Sequelize({
            dialect: 'sqlite',
            storage: config[env].storage,
            pool: {
                max: 5,
                min: 0,
                acquire: 30000,
                idle: 10000
              }
        });
    }
    return conn;
}
