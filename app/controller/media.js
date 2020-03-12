/*
 * @Author: your name
 * @Date: 2020-02-06 13:49:20
 * @LastEditTime: 2020-03-12 15:35:16
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/controller/media.js
 */
'use strict';
const md5 = require('md5');
const Controller = require('egg').Controller;
const fs = require('fs');
/**
 * @controller Media
 */

class MediaController extends Controller {
    
    /**
     * @summary Sync Net Media
     * @description donwload the media file from network
     * @router POST /api/v1/sync/net/media
     * @request query string _token upload token, IF the upload_guard is on, the api need upload token, see /api/v1/token/upload/combine
     * @request query string bucket IF the upload_guard is off, this api dose`t need upload token, but you must tall api which bucket you want to upload.
     * @request body download_media *target
     * @response 200 base_response ok
     */

    async syncNetMedia () {
        const {ctx} = this;
        console.debug('controller#media.js@ctx.request.body', ctx.request.body);
        ctx.body = ctx.request.body;
        let bucket = '';
        if (ctx.app.config.bucket.upload_guard) {
            _token = this.service.token.explodeToken(ctx.request.query._token);
            bucket = _token.bucket;
        }else {
            bucket = ctx.request.query.bucket;
        }
        
        let _bucket = await ctx.service.bucket.getBucket(bucket);

        if (_bucket) {
            let targets = ctx.request.body.targets;
            let signatures = [];
            for (let t of targets) {
                try {
                    let headers = t.headers? t.headers: {};
                    let sign = await this.service.media.syncNetMediafile2(t.url, _bucket, headers);
                    signatures.push(sign);
                }catch (e) {
                    console.debug('controller#media.js#SyncNetMedia@e',e);
                };
            }
            ctx.status = 200;
            ctx.body = ctx.helper.JsonFormat_ok(signatures);
        }else{
            ctx.status = 404;
        }
    }

    /**
     * @summary Upload file 
     * @consumes multipart/form-data
     * @description upload file and the server will new a Media record stand for this file
     * * 1 when success, return the signature of this file
     * * 2 expose this file, with params signature or the name of this file. see: /e/{signature}/p0/p1/p2 ...
     * @router POST /api/v1/upload
     * @request query string _token upload token, IF the upload_guard is on, the api need upload token, see /api/v1/token/upload/combine     
     * @request query string bucket IF the upload_guard is off, this api dose`t need upload token, but you must tall api which bucket you want to upload.
     * @request formData file *upload[0] upload file
     * @response 200 base_response ok
     */
    async upload () {
        const {ctx} = this;
        const upload_files = ctx.request.files;
        
        let bucket = '';
        
        if (ctx.app.config.bucket.upload_guard) {
            _token = this.service.token.explodeToken(ctx.request.query._token);
            bucket = _token.bucket;
        }else{
            bucket = ctx.request.query.bucket;
        }

        let _bucket = await ctx.service.bucket.getBucket(bucket);
        //console.debug('media.js#upload@bucket', _bucket);
        console.debug('media.js#upload@upload_files', upload_files);
        console.debug('media.js#upload@body', ctx.request.body);
        if (_bucket) {
            let result;
            try {
                
                if (upload_files.length == 1) {
                    result = await this.service.media.syncMediafile(upload_files[0].filepath, _bucket, upload_files[0]);
                    //console.debug('controller#media.js#upload@result', result);
                }else if (upload_files.length > 1){
                    result = [];
                    for (let ufile of upload_files) {
                        let res = await this.service.media.syncMediafile(ufile.filepath, _bucket, ufile);
                        result.push(res);
                    }
                }else{
                    throw 'upload file 0';
                }
                
            }catch (e) {
                console.debug('controller#media.js#upload@e', e);
                ctx.status = 400;
                ctx.body = e;
                return;
            }
            ctx.status = 200;
            ctx.body = ctx.helper.JsonFormat_ok(result);
            
        }else{
            ctx.status = 404;
        }
    }

    /**
     * @summary Show the files
     * @description show the files
     * @router GET /api/v1/files
     * @request header string *Authorization Bearer <access_token>
     * @request query string *bucket bucket
     * @request query integer *page=1
     * @request query integer *perpage=20
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
     * @summary Delete file
     * @consumes application/x-www-form-urlencoded
     * @description Delete file
     * @router DELETE /api/v1/files
     * @request header string *Authorization Bearer <access_token>
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
     * @summary Expose file 
     * @description Expose file
     * * 1 signatrure, It can be the signature or filename of the file that you had upload or sync.
     * * 2 p0, A donkey plugin. Install it in console by command: npm install donkey-plugin-xxx.
     * * 3 Aafter you had install the plugin. p0 is name of plugin(without perfix 'donkey-plugin-') that can be use to process expose file. 
     * For example, We can scale-down to 50% of your png or jpg by donkey-plugin-slim plugin to display. 
     * eg: http://yourhost/e/yourupload.png/slim/0.5/
     * * 4 p1 .... pn, is the arguments for the plugin
     * @router GET /e/{signature}/{p0}/{p1}/{p2}/{p3}
     * @request path string *signature
     * @request path string p0 media plugin
     * @request path string p1 media plugin parameter 1
     * @request path string p2 media plugin parameter 2
     * @request path string p3 media plugin parameter 3
     * @response 200 base_response ok
     */

    async expose_file () {
        const {ctx} = this;
        let path = ctx.path;
        let params = ctx.service.media.parseParameters(path);
        
        /**
         * find the original file.
         */
        //let _media = await ctx.service.media.getMediaFile(params.signature);
        let result = false;
        if (params.query != '') {
            // 处理handler
            try {
                let _media = await this.service.media.getMediaFile(params.signature);
                if (_media) {
                    result = await ctx.service.media.getCopyMediafileStream(_media, params.media_handler, params.handler_parameters);
                }else{
                    ctx.status = 404;
                }
            }catch(e) {
                console.log('controller#media.js#explose_file@e',e);
                ctx.status = 400;
                ctx.body = e;
                return;
            }
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