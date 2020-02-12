/*
 * @Author: your name
 * @Date: 2020-02-03 10:47:49
 * @LastEditTime : 2020-02-06 09:32:23
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/controller/backend.js
 */
'use strict';

const Controller = require('egg').Controller;

/**
 * @controller Backend
 */
class BackendController extends Controller {

  /**
   * @summary backend login
   * @description backend login
   * @router POST /api/v1/backend/login
   * @request body authorize_login *login
   * @response 200 base_response ok
   */
  async login() {
    let {login, password} = this.ctx.request.body;
    let {ctx} = this;
    let adminuser = await ctx.service.backend.authorize(login,password);
    
    if (adminuser) {
      let token = await ctx.service.backend.genToken({login:adminuser.login, nickname:adminuser.nickname, user_id:adminuser.id});
      ctx.status = 200;
      ctx.body = this.ctx.helper.JsonFormat_ok({access_token:token});
    }else{
      ctx.status = 401;
    }
  }
}

module.exports = BackendController;