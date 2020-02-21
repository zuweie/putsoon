/*
 * @Author: your name
 * @Date: 2020-02-08 11:41:05
 * @LastEditTime: 2020-02-22 02:08:20
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/service/media.js
 */
'use strict';
const fs      = require('fs');
const fx = require('mkdir-recursive');
const FileType = require('file-type');
const path    = require('path');
const Service = require('egg').Service;
const sequelize = require('../../database/conn')();
const Op = require('sequelize').Op;
const md5File = require('md5-file/promise');
const md5     = require('md5');
const Media = require('../../database/sequelize_model')('media');
const Task  = require('../../database/sequelize_model')('task');


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
                    return this.ctx.helper.JsonFormat_err(-1, 'bucket <'+bucket+'> not exists')
                }
                                
            }else{
                return this.ctx.helper.JsonFormat_err(-1, 'file exists!');
            }
        }catch (e) {
            return this.ctx.helper.JsonFormat_err(-1, e);
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
        let context = this;
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
                            //console.log(e);
                            console.debug('media.js#delUploadMedia@e', e);
                        }

                        // delete task
                        let tasks = await Task.findAll({where:{name:_m.signature}});

                        tasks.forEach(async _t => {
                            //console.debug('media.js#delUploadMedia@_t', _t);
                            await context.service.task.deleteTasks(_t.id);
                        });

                        if (!fs.existsSync(file_path)) {
                            del_count = await Media.destroy({ where: { id: _m.id } });
                        }
                    }
                });

            }catch (e) {
                console.debug('media.js#delUploadMedia@e', e);
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
   
    /**
     * BIG BIG IMPORT FUNCTION
     * @param {*} _media 
     * @param {*} _handler 
     * @param {*} args 
     */
    async TryToGetCopyMediafile(_media, _handler, args=[], sync=true) {

        /**
         * make the cacheDir first
         */
        let context = this;
        return new Promise( async (resolve, reject) => {

            let taskey = context.service.task.calKey(_media, _handler, args);
            let task = await context.service.task.findTask(taskey);
            let timer = -1;
            let tasklistener = null;
            /* if no task try to post a new one */
            if (!task) {
                try{
                    let res = await context.service.task.postTask(_media, _handler, args);
                    if (res) {

                        // add listener here ?
                        // 1 listene the message
                        tasklistener = {};
                        tasklistener.onTaskStatus = async (taskey) => {
                            console.debug('media.js#tasklistener#onTaskStatus@taskey', taskey);
                            let on_task = await context.service.task.findTask(taskey);
                            //console.debug('media.js#tasklistener#onTaskStataus@task.status', on_task);
                            if (on_task.status == 'done') {
                                let info = context.service.task.fileInfo2Obj(on_task.file_info);
                                resolve({ file: on_task.dest, mime: info.mime });
                                console.debug('media.js#tasklistener#onTaskStatus@task.status == done@task.dest & info', on_task.dest, info);
                                if (timer != -1){
                                    console.debug('media.js#tasklistener@clearTimeout !');
                                    clearTimeout(timer);
                                }
                            } else if (on_task.status == 'err') {
                                reject(on_task.errmsg);
                                if (timer != -1) {
                                    console.debug('media.js#tasklistener@clearTimeout !');
                                    clearTimeout(timer);
                                }
                            }
                            context.app.rmTasklistener(tasklistener);
                        };
                        context.app.addTasklistener(tasklistener);

                        context.app.messenger.sendToAgent('new_task', taskey);
                        console.debug('media#trytoGetCopyMediafiel', 'sendToAgent '+taskey)
                    }

                    if (!sync) {
                        reject('task processing');
                    }
                }catch(e) {
                    console.debug(e);
                    throw e;
                }
            }

            if (!task) {
                task = await context.service.task.findTask(taskey);
            }

            if (!task) {
                reject('task fail');
            }

            if ( (task.status == 'processing') || (task.status == 'idle') ) {
                if (!sync)
                    reject('task is processing');
                else {
                    
                    // 双重保障，
                    console.debug('media.js#TryToGetMediafile@setTimeout');
                    timer = setTimeout( async ()=>{
                        // time out checking the task;
                        task = await context.service.task.findTask(taskey);
                        console.debug('media.js#Timer@task.status', task.status);
                        if (task.status == 'done') {
                            let info = context.service.task.fileInfo2Obj(task.file_info);
                            resolve({file:task.dest, mime:info.mime});
                        }else if (task.status == 'err') {
                            reject(task.errmsg);
                        }else{
                            reject('task time out');
                        }
                        if (tasklistener) {
                            context.app.rmTasklistener(tasklistener);
                        }
                    }, 30*1000);
                }
            }else if (task.status == 'done') {
                let info = context.service.task.fileInfo2Obj(task.file_info);
                console.debug('media.js#TryToGetCopy@task.status == done@task.dest & info', task.dest, info);
                resolve({file:task.dest, mime:info.mime});
            }else {
                reject(task.errmsg);
            }
        });
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

    calSaveDir(media, handler, args=[]) {

        let hargs_save_dir = '/'+media.firstname+'/'+handler
        for (let i=0; i<args.length; ++i) {
            hargs_save_dir += '/'+args[i];
        }
        
        console.debug('media.js#calSaveDir@hargs_save_path', hargs_save_dir);
        hargs_save_dir = md5(hargs_save_dir);
        let save_dir =  path.dirname(media.path)+'/cache/'+hargs_save_dir+'/';
        console.debug('media.js#calSaveDir', save_dir)

        return save_dir;
    }

    mkSaveDir(media, handler, args=[]) {
        let dir = this.calSaveDir(media, handler, args);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive: true});
        }
        return dir;
    }
}

module.exports = MediaService;