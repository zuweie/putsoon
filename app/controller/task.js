/*
 * @Author: your name
 * @Date: 2020-02-17 12:40:44
 * @LastEditTime: 2020-03-10 10:12:39
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/controller/task.js
 */
'use strict'

const Controller = require('egg').Controller;

/**
 * @controller Task
 */
class TaskController extends Controller {


  /**
   * @summary show task
   * @description show task
   * @router GET /api/v1/task/show
   * @request header string *Authorization access_token
   * @request query status status eg 'idle'
   * @request query integer page eg:1
   * @request query integer perpage eg:20
   * @response 200 base_response ok
   */
    async index () {
        let {page, perpage, status} = this.ctx.query;
        let task;
        if (status) {
            task = await this.service.task.getTaskByStatus(status);
        }else{
            task = await this.service.task.getAllTasks();
        }
        this.ctx.body = this.ctx.helper.JsonFormat_ok(task);
    }

    /**
      * @summary delete task 
      * @consumes application/x-www-form-urlencoded
      * @description delete task
      * @router DELETE /api/v1/task/delete
      * @request header string *Authorization access_token
      * @request formData string *id[] upload token id
      * @response 200 base_response ok
      */
     async delete () {
        let {payload} = this.ctx;
        let ids = this.ctx.request.body.id;
        let del = await this.service.task.deleteTasks(ids);
        this.ctx.status = 200;
        this.ctx.body = this.ctx.helper.JsonFormat_ok(del);
    }

    async test () {
        try {
            this.ctx.service.task.postTask('aaa', 'ccc', 'hhh',  JSON.stringify(['aaa', 'bbb']), 'ccc', 'eee');
        }catch (e) {
            console.debug(e);
        }
        this.ctx.status = 200;
    }
}

module.exports = TaskController;