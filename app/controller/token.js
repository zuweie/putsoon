/*
 * @Author: your name
 * @Date: 2020-02-07 07:37:10
 * @LastEditTime : 2020-02-07 09:43:48
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/controller/token.js
 */
'use strict'
const Controller = require('egg').Controller;

/**
 * @controller Token
 */

class TokenController extends Controller {
    
  /**
   * @summary new upload token
   * @description new upload token
   * @router POST /api/v1/token/upload
   * @request header string *Authorization access_token
   * @response 200 base_response ok
   */
    async gen_upload_token () {
        let {payload} = this.ctx;
        let token =  await this.service.token.genUploadToken(payload.user_id);
        this.ctx.status = 200;
        this.ctx.body = this.ctx.helper.JsonFormat_ok(token);
    }

    /**
     * @summary get upload token
     * @description get upload token
     * @router GET /api/v1/token/upload
     * @request header string *Authorization access_token
     * @response 200 base_response ok
     */

     async get_upload_token () {
         let {payload} = this.ctx;
         let token = await this.service.token.getUploadToken(payload.user_id);
         this.ctx.status = 200;
         this.ctx.body = this.ctx.helper.JsonFormat_ok(token);
     }

     /**
      * @summary delete upload token
      * @consumes application/x-www-form-urlencoded
      * @description delete upload token
      * @router DELETE /api/v1/token/upload
      * @request header string *Authorization access_token
      * @request formData string *id[] upload token id
      * @response 200 base_response ok
      */
      async delete_upload_token () {
          let {payload} = this.ctx;
          let ids = this.ctx.request.body.id;
          let del = await this.service.token.deleteUploadToken(payload.user_id, ids);
          this.ctx.status = 200;
          this.ctx.body = this.ctx.helper.JsonFormat_ok(del);
      }

      /**
       * @summary verify upload token
       * @consumes application/x-www-form-urlencoded
       * @description verify upload token
       * @router POST /api/v1/token/upload/verify
       * @request formData string *upload_token upload_token
       * @response 200 base_response ok
       */
       async verify_upload_token () {
           let upload_token = this.ctx.request.body.upload_token;
           let result = this.ctx.service.token.explodeToken(upload_token);
           this.ctx.status = 200;
           this.ctx.body = this.ctx.helper.JsonFormat_ok(result);
       }

       /**
        * @summary combine upload token
        * @consumes application/x-www-form-urlencoded
        * @description combine upload token in back
        * @router POST /api/v1/token/upload/combine
        * @request formData string *ak ak
        * @request formData string *sk sk
        * @request formData string *bucket bucket
        * @response 200 base_response ok
        */
       async combine_upload_token () {
            let {ak,sk,bucket} = this.ctx.request.body;
            console.log('request body', this.ctx.request.body);
            console.log('combine', ak, sk, bucket);
            let result = this.ctx.service.token.implodeToken(ak,sk,bucket);
            this.ctx.status = 200;
            this.ctx.body = this.ctx.helper.JsonFormat_ok(result);
       }
} 

module.exports = TokenController;