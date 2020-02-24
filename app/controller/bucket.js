/*
 * @Author: your name
 * @Date: 2020-02-06 09:30:29
 * @LastEditTime: 2020-02-24 12:35:04
 * @LastEditors: Please set LastEditors
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
   * @summary 创建 Bucket
   * @consumes application/x-www-form-urlencoded
   * @description 创建 bucket
   * @router POST /api/v1/bucket/create
   * @request header string *Authorization Bearer <access_token>
   * @request formData string *bucket Bucket的名字
   * @request formData integer *is_private 是否私有：1为私有Bucket，0为公有Bucket
   * @request formData string describe Bucket的描述
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
   * @summary 显示当前的 Bucket
   * @description 显示当前的 Bucket
   * @router GET /api/v1/bucket/show
   * @request header string *Authorization Bearer <access_token>
   * @request query integer *page 页数
   * @request query integer *perpage 每页数量
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
   * @summary update bucket (弃用)
   * @description update bucket 
   * @router PUT /api/v1/bucket/update
   * @request header string *Authorization Bearer <access_token>
   * @request query integer *id bucket id
   * @request query string bucket bucket name
   * @request query string description bucket description
   * @request query integer is_private bucket is_private
   * @response 200 base_response ok
   */
  async update_bucket() {

    this.ctx.body = this.ctx.helper.JsonFormat_err('')
    return;
    
    let { ctx } = this;
    let { payload } = ctx;
    let { id } = ctx.query;
    let update_data = {};

    if (ctx.query.bucket) update_data.bucket = ctx.query.bucket;
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
   * @request header string *Authorization Bearer <access_token>
   * @request formData integer *id[0] bucket id
   * @request formData integer *id[1] bucket id
   * @response 200 base_response ok
   */
  async del_buckets () {
    let {ctx} = this;
    let {payload} = ctx;
    let {id} = ctx.request.body;
    let del = await ctx.service.bucket.deleteBuckets(id, payload.user_id);
    ctx.status = 200;
    ctx.body = ctx.helper.JsonFormat_ok(del);
    //ctx.body = {}
  }

  /**
   * @summary sync bucket
   * @consumes application/x-www-form-urlencoded
   * @description sync bucket, save the unrecored file to database
   * @router POST /api/v1/bucket/sync
   * @request header string *Authorization Bearer <access_token>
   * @request formData string *bucket bucket to sync
   * @response 200 base_response ok
   */
  async sync_bucket () {
    let {ctx} = this;
    let {bucket} = ctx.request.body;
    console.debug('bucket.js#sync_bucket@bucket', bucket);
    let b = await ctx.service.bucket.getBucket(bucket);
    console.debug('bucket.js#sync_bucket@b', b);

    if (b) {
      let result = await ctx.service.bucket.syncBucketFile(b);
      ctx.status = 200;    
      ctx.body = result;  
    }else {
      ctx.status = 404;
    }
  }
};

module.exports = BucketController;