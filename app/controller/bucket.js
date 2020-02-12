/*
 * @Author: your name
 * @Date: 2020-02-06 09:30:29
 * @LastEditTime : 2020-02-12 09:53:38
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/controller/bucket.js
 */
'use strict';

const Controller = require('egg').Controller;

/**
 * @controller Bucket
 */
class BucketController extends Controller {
  /**
   * @summary backend create bucket
   * @consumes application/x-www-form-urlencoded
   * @description backend create bucket
   * @router POST /api/v1/bucket/create
   * @request header string *Authorization access_token
   * @request formData string *bucket bucket name
   * @request formData integer is_private is private
   * @request formData string describe describe
   * @response 200 base_response ok
   */
  async create_bucket () {
    let {ctx}    = this;
    let {bucket, is_private, describe} = ctx.request.body;
    let {payload} = ctx;
    let result = await this.service.bucket.createBucket(bucket, describe, payload.user_id, is_private);
    //console.log('insert_result', result);
    ctx.body = this.ctx.helper.JsonFormat_ok(result);
    ctx.status = 200;
  }

  /**
   * @summary show buckets
   * @description show buckets
   * @router GET /api/v1/bucket/show
   * @request header string *Authorization access_token
   * @request query integer page eg:1
   * @request query integer perpage eg:20
   * @response 200 base_response ok
   */
  async show_buckets () {
    let {ctx} = this;
    let {payload} = ctx;
    let {page, perpage} = ctx.query;
    let result = await this.service.bucket.showBuckets(payload.user_id, page, perpage);
    ctx.status = 200;
    ctx.body = ctx.helper.JsonFormat_ok(result);
  }

  /**
   * @summary update bucket
   * @description update bucket 
   * @router PUT /api/v1/bucket/update
   * @request header string *Authorization access_token
   * @request query integer *id bucket id
   * @request query string bucket bucket name
   * @request query string description bucket description
   * @request query integer is_private bucket is_private
   * @response 200 base_response ok
   */
   async update_bucket () {
       
       let {ctx} = this;
       let {payload} = ctx;
       let {id} = ctx.query;
       let update_data = {};

       if (ctx.query.bucket ) update_data.bucket = ctx.query.bucket;
       if (ctx.query.description) update_data.description = ctx.query.description;
       if (ctx.query.is_private) update_data.is_private = ctx.query.is_private;

       let result = await this.service.bucket.updateBucket(update_data, id, payload.user_id);
       ctx.status = 200;
       ctx.body = ctx.helper.JsonFormat_ok(result);
   }

  /**
   * @summary delete buckets
   * @consumes application/x-www-form-urlencoded
   * @description delete buckets
   * @router DELETE /api/v1/bucket/delete
   * @request header string *Authorization access_token
   * @request formData integer *id[0] bucket id
   * @request formData integer *id[1] bucket id
   * @response 200 base_response ok
   */
  async del_buckets () {
    let {ctx} = this;
    let {payload} = ctx;
    let {id} = ctx.request.body;
    console.log('id', id);
    let del = await ctx.service.bucket.deleteBuckets(id, payload.user_id);
    ctx.status = 200;
    ctx.body = ctx.helper.JsonFormat_ok(del);
    //ctx.body = {}
  }
};

module.exports = BucketController;