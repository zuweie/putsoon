/*
 * @Author: your name
 * @Date: 2020-02-08 11:41:05
 * @LastEditTime : 2020-02-12 12:09:04
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/service/media.js
 */
'use strict';
const mime    = require('mime');
const fs      = require('fs');
const path    = require('path');
const Service = require('egg').Service;
const sequelize = require('../../database/conn')();
const Op = require('sequelize').Op;
const md5File = require('md5-file/promise');
const md5     = require('md5');
const Media = require('../../database/sequelize_model')('media');

class MediaService extends Service {

    async saveUploadMedia(file_upload, bucket) {

        try{
            /**
             * 文件处理去掉文件后缀
             * 
             */
            let file_hash = await md5File(file_upload.filepath);
            let extname = path.extname(file_upload.filepath); 
            let file_name = path.basename(file_upload.filename, extname);
            
            let media = await Media.findOne({where:{file_hash:file_hash, firstname:file_name}});
            
            if (!media) {
                // file is not exists, save it
                /**
                 * 1 check the bucket first
                 */

                let _bucket = await this.service.bucket.getBucket(bucket);
                if (_bucket) {

                    if(this.service.bucket.syncBucketPath(_bucket)){

                        // 1 copy the upload file to bucket
                        let signature = md5(file_name);
                        let src = file_upload.filepath;
                        let dest = this.service.bucket.fullBucketPath(_bucket)+signature+extname;
                        fs.copyFileSync(src, dest);
                        if (fs.existsSync(dest)) {
                            // 2 insert the record to database;
                            try{
                                // remove upload file.
                                fs.unlinkSync(src);
                            }catch(e) {
                                console.log(e);
                            }
                            let insert = {};
                            insert.firstname = file_name;
                            insert.ext = extname;
                            insert.query_params = '';
                            insert.signature = signature;
                            insert.mime = file_upload.mime;
                            insert.bucket = bucket;
                            insert.file_hash = file_hash;
                            insert.path = dest;
                            let result = await Media.upsert(insert);
                            return this.ctx.helper.JsonFormat_ok({signature:signature});
                            
                        }
                    }else{
                        return this.ctx.helper.JsonFormat_err(-1, 'bucket sync fail');
                    }
                    
                }else {
                    return this.ctx.helper.Jsonformat_err(-1, 'bucket <'+bucket+'> not exists')
                }
                                
            }
        }catch (e) {
            return this.ctx.helper.Jsonformat_err(-1, e);
        }
    }   

    getUploadMedia(bucket, page=1, perpage=20) {
        return Media.findAll({
            where:{
                bucket: bucket,
            }, 
            limit:perpage, 
            offset:(page-1)*page
        });
    }

    getAllUploadMedia(bucket) {
        return Media.findAll({
            where: {
                bucket: bucket
            }
        });
    }

    async delUploadMedia(media_ids, user_id) {
        let del_count = 0;
        for (let i=0; i<media_ids.length; ++i) {
            try {
                let id = parseInt(media_ids[i]);
                let query_sql = 'SELECT Media.*, Buckets.user_id FROM Media LEFT OUTER JOIN Buckets ON Media.bucket = Buckets.bucket WHERE Media.id = ? AND Buckets.user_id = ?';
                let _media = await sequelize.query(query_sql,{replacements:[id, user_id], type: sequelize.QueryTypes.SELECT});
                _media.forEach( async _m => {
                    if (_m) {
                        let file_path = _m.path;
                        try {
                            fs.unlinkSync(file_path);
                        }catch(e) {
                            console.log(e);
                        }
                        if (!fs.existsSync(file_path)) {
                            del_count = await Media.destroy({ where: { id: _m.id } });
                        }
                    }
                });

            }catch (e) {
                console.log('err', e);
            }
        }
        return del_count;
    }

    async getMediaFileReadStream (signature) {
        let _media = await this.getMediaFile(signature);
        if (_media && fs.existsSync(_media.path)) {
            return {stream: fs.createReadStream(_media.path), mime: _media.mime};
        }
        return false;
    }

    async getMediaFile (signature) {

        return Media.findOne({where:{
            [Op.or]: [{signature: signature}, {firstname: signature}]
        }});
    }

    async getCopyMediaFileReadStream (signature, handler, args) {
        let media = await this.getMediaFile(signature);
        if (media) {
            let copy_file_path = await this.TryToGetCopyMediafile(media, handler, args);

            if (copy_file_path && fs.existsSync(copy_file_path)) {
                return {stream: fs.createReadStream(copy_file_path), mime:mime.getType(copy_file_path)};
            }
        }
        return false;
    }

    async TryToGetCopyMediafile(_media, _handler, args) {
        let handler = this.getMediaHandler(_media, _handler, args);
        if (handler) {
            let result = await handler.exec();
            //console.log('handler.exec()', result);
            if (result) return handler.export_file_path();
        }
        return false;
    } 
    
    getMediaHandler(_media, _handler, args) {
        //找一下有没有这个 handler。
        let handler_script = __dirname+'/../../media_handlers/'+_handler+'.js';        
        if (fs.existsSync(handler_script)) {
            let handler = require(handler_script)(_media, args);
            return handler;
        }
        return false;
    }

    parseParameters (_path) {
        let params = _path.split('\/');
        for (let i=0; i<params.length; ++i) {
            if (params[i] == ''||params[i]==null||typeof(params[i])==undefined) {
                params.splice(i, 1);
            }
        }
        let process_data = {};
        let query = '/'+params[2];
        process_data._ = params[0];
        let extname = path.extname(params[1]);
        let basename = path.basename(params[1], extname);
        process_data.signature = basename;
        process_data.ext = extname;
        if (params.length>=3) {
            process_data.media_handler = params[2];
            process_data.handler_parameters = [];
            for (let j=3; j<params.length; ++j) {
                process_data.handler_parameters.push(params[j]);
                query += '/'+params[j];
            }
            process_data.query = query;
        }else{
            process_data.media_handler = ''
            process_data.query = '';
            process_data.handler_parameters = [];
        }
        process_data.path = _path;
        return process_data;
    }

    
    
}

module.exports = MediaService;