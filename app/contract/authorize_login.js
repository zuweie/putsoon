/*
 * @Author: your name
 * @Date: 2020-02-03 12:18:11
 * @LastEditTime : 2020-02-03 12:18:58
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/contract/authorize_login.js
 */
'use strict';

module.exports = {
    authorize_login: {
      login: {type:'string', required:true, description:'登录账号',example:'admin'},
      password: {type:'string', required:true, description:'登录密码', example:'123456'},
    },
  };