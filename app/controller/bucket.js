/*
 * @Author: your name
 * @Date: 2020-02-06 09:30:29
 * @LastEditTime: 2020-04-03 07:43:25
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
   * @summary Create Bucket
   * @consumes application/x-www-form-urlencoded
   * @description Create Bucket
   * @router POST /api/v1/bucket/create
   * @request header string *Authorization Bearer <access_token>
   * @request formData string *bucket name of Bucket
   * @request formData integer *is_private 1 for private, 0 for public
   * @request formData string describe description of Bucket
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
   * @summary Show Bucket
   * @description Show Bucket
   * @router GET /api/v1/bucket/show
   * @request header string *Authorization Bearer <access_token>
   * @request query integer *page page number
   * @request query integer *perpage item number of perpage
   * @response 200 base_response ok
   */
  async show_buckets () {
    let {ctx} = this;
    let {payload} = ctx;
    let {page, perpage} = ctx.query;
    page = page ? page : 1;
    perpage = perpage ? perpage : 20;
    let result = await this.service.bucket.showBuckets(payload.user_id, page, perpage);
    ctx.status = 200;
    ctx.body = ctx.helper.JsonFormat_ok(result);
  }

  /**
   * @summary Update bucket (Abandoned)
   * @description Update bucket 
   * @router PUT /api/v1/bucket/update
   * @request header string *Authorization Bearer <access_token>
   * @request query integer *id bucket id
   * @request query string bucket bucket name
   * @request query string description bucket description
   * @request query integer is_private bucket is_private
   * @response 200 base_response ok
   */
  async update_bucket() {

    this.status = 400;
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
   * @summary Delete Buckets
   * @consumes application/x-www-form-urlencoded
   * @description Delete Buckets
   * @router DELETE /api/v1/bucket/delete
   * @request header string *Authorization Bearer <access_token>
   * @request formData integer *id[0] bucket id
   * @request formData integer id[1] bucket id
   * @response 200 base_response ok
   */
  async del_buckets () {
    let {ctx} = this;
    let {payload} = ctx;
    let {id, } = ctx.request.body;
    
    let del = await ctx.service.bucket.deleteBuckets(id, payload.user_id);
    ctx.status = 200;
    ctx.body = ctx.helper.JsonFormat_ok(del);
    //ctx.body = {}
  }

  /**
   * @summary Sync Bucket
   * @consumes application/x-www-form-urlencoded
   * @description You can upload some big files to the bucket folder by FTP, then Sync Bucket can create the new meida record for those new file.
   * @router POST /api/v1/bucket/sync
   * @request header string *Authorization Bearer <access_token>
   * @request formData string *bucket bucket to sync
   * @response 200 base_response ok
   */
  async sync_bucket () {
    let {ctx} = this;
    let {bucket} = ctx.request.body;
    console.debug('bucket.js#sync_bucket@bucket', bucket);
    let _bucket = await ctx.service.bucket.getBucket(bucket);

    if (_bucket) {
      try {
        let result = await ctx.service.bucket.syncBucketFile(_bucket);

      }catch (e) {
        console.debug('controller#bucket.js#sync_bucket@e', e);
        ctx.status = 400;
        ctx.body = e;
        return ;
      }
      ctx.status = 200;    
      ctx.body = ctx.helper.JsonFormat_ok();  
    }else {
      ctx.status = 404;
    }
  }
};

module.exports = BucketController;