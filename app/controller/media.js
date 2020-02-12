/*
 * @Author: your name
 * @Date: 2020-02-06 13:49:20
 * @LastEditTime : 2020-02-12 11:22:49
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/controller/media.js
 */
'use strict';
const md5 = require('md5');
const Controller = require('egg').Controller;

/**
 * @controller Media
 */

class MediaController extends Controller {
    

    /**
     * @summary upload media file
     * @consumes multipart/form-data
     * @description combine upload token in back
     * @router POST /api/v1/upload
     * @request query string *_token upload_token
     * @request formData file *upload upload file
     * @response 200 base_response ok
     */
    async upload () {
        const {ctx} = this;
        const file = ctx.request.files[0];
        let _token = ctx.request.query._token;
        _token = this.service.token.explodeToken(_token);
        //console.log(file);
        let result = await this.service.media.saveUploadMedia(file, _token.bucket);
        ctx.status = 200;
        ctx.body = result;
    }

    /**
     * @summary show files
     * @description show file
     * @router GET /api/v1/files
     * @request header string *Authorization access_token
     * @request query string *bucket bucket
     * @request query integer page=1
     * @request query integer perpage=20
     * @response 200 base_response ok
     */

     async show_files () {
         const {ctx} = this;
         const {payload} = ctx;
         const {bucket, page, perpage} = ctx.request.query;
         let _bucket = await this.service.bucket.getBucket(bucket);
         console.log('_bucket', _bucket);
         console.log('payload', payload);
         if (_bucket) {
            if (_bucket.user_id == payload.user_id) {
                let files = await this.service.media.getUploadMedia(bucket, page, perpage);
                ctx.status = 200;
                ctx.body = ctx.helper.JsonFormat_ok(files);
             }else{
                ctx.status = 401;
             }
         }else{
             ctx.status = 404;
         }


     }

    /**
     * @summary delete file
     * @consumes application/x-www-form-urlencoded
     * @description delete file
     * @router DELETE /api/v1/files
     * @request header string *Authorization access_token
     * @request formData integer *id[0] media id
     * @response 200 base_response ok
     */

    async delete_files () {
        const {ctx} = this;
        const {payload} = ctx;
        const {id} = ctx.request.body;
        let del_count = await this.service.media.delUploadMedia(id, payload.user_id);
        ctx.status = 200;
        ctx.body = ctx.helper.JsonFormat_ok(del_count);
    }

    /**
     * @summary export file 
     * @description export file
     * @router GET /e/{signature}/{p0}/{p1}/{p2}/{p3}
     * @request path string *signature
     * @request path string p0 media handler
     * @request path string p1 media handler parameter 1
     * @request path string p2 media handler parameter 2
     * @request path string p3 media handler parameter 3
     * @response 200 base_response ok
     */

    async export_file () {
        const {ctx} = this;
        let path = ctx.path;
        let params = ctx.service.media.parseParameters(path);
        
        /**
         * find the original file.
         */
        //let _media = await ctx.service.media.getMediaFile(params.signature);
        let result = false;
        if (params.query != '') {
            // 处理
            result = await ctx.service.media.getCopyMediaFileReadStream(params.signature, params.media_handler, params.handler_parameters);
        }else{
            result = await ctx.service.media.getMediaFileReadStream(params.signature);
        }
        if (result) {
            ctx.status = 200;
            ctx.set('Content-Type', result.mime);  
            ctx.body = result.stream;          
        }else{
            ctx.status = 404;
        }
    }
} 

module.exports = MediaController;