/*
 * @Author: your name
 * @Date: 2020-02-03 10:50:06
 * @LastEditTime : 2020-02-06 13:51:08
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/service/backend.js
 */
'use strict';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Service = require('egg').Service;
const AdminUser = require('../../database/sequelize_model')('adminuser');

class BackendService extends Service {
  async authorize(login, plaint_pass) {
    let adminuser = await AdminUser.findOne({where:{
        login: login,
    }});
    
    if (bcrypt.compareSync(plaint_pass, adminuser.password)) {
      return adminuser;
    }else{
      return null;
    }
  }

  genToken(payload) {
    let {app} = this;
    return new Promise((reslove, reject) => {
      jwt.sign(payload, app.config.passportJwt.secret, {expiresIn: 36000}, (err, token)=>{
        if(err) {
          reject(err);
        }
        reslove(token);
      });
    });
  }

}

module.exports = BackendService;