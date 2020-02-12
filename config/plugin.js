/*
 * @Author: your name
 * @Date: 2020-02-01 13:54:38
 * @LastEditTime : 2020-02-04 14:46:52
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/config/plugin.js
 */
'use strict';

/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }
  swaggerdoc: {
    enable: true,
    package: 'egg-swagger-doc',
  },
  passport: {
    enable: true,
    package: 'egg-passport',
  },
  passportJwt: {
    enable: true,
    package: 'egg-passport-jwt'
  }
};
