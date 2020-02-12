/*
 * @Author: your name
 * @Date: 2020-02-01 13:54:38
 * @LastEditTime: 2020-02-03 10:48:19
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/controller/home.js
 */
'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = 'hi, egg';
  }
}

module.exports = HomeController; 
