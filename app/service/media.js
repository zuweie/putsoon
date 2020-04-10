/*
 * @Author: your name
 * @Date: 2020-02-08 11:41:05
 * @LastEditTime: 2020-04-11 01:59:19
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/service/media.js
 */
'use strict';
const fs      = require('fs');
const FileType = require('file-type');
const path    = require('path');
const http    = require('http');
const https   = require('https');
//const URL     = require('url');
const Service = require('egg').Service;
const sequelize = require('../../database/conn')();
const Op = require('sequelize').Op;
const md5File = require('md5-file/promise');
const md5     = require('md5');
const Media = require('../../database/sequelize_model')('media');
const Task  = require('../../database/sequelize_model')('task');
class MediaService extends Service {

    async syncNetMediafile(file_url, _bucket, headers={}) {

        
        let context = this;
        let _m = await this.getMediaFile(file_url);
        if (_m) {
            return {signature: _m.signature};
        }

        let url = new URL(file_url);

        console.debug('media.js#syncNetMediafile@file_url', file_url);
        console.debug('media.js#syncNetMediafile@url', url);

        let download = new Promise((resolve, reject) => {

            let tmp_dir = context.service.task.mkTmpDir();
            let tmp_file = tmp_dir + '/donwload_' + Date.now() + '.tmp';
            let ws = fs.createWriteStream(tmp_file, {
                flags: 'w+'
            });
            let req_client = null;
            if (url.protocol == 'http:') {
                // use http
                req_client = http;
            }else if (url.protocol == 'https:') {
                // use https
                req_client = https;
            }
            if (req_client) {
                req_client.get(file_url, {
                    headers: headers
                }, res => {
                    if (res.statusCode !== 200) {
                        reject({ statusCode: res.statusCode, body: res.body });
                    }
                    ws.on('finish', () => {
                        ws.close();
                        resolve(tmp_file);
                    }).on('error', (err) => {
                        ws.close();
                        fs.unlinkSync(tmp_file);
                        reject(err);
                    });

                    res.pipe(ws);
                });
            } else {
                reject('unknown protocol')
            }
        });

        try {
            let donwload_file = await download;
            
            if (fs.existsSync(donwload_file)) {

                // TODO : copy the file to bucket;
                let file_info = await FileType.fromFile(donwload_file);
                let extname = file_info? '.'+file_info.ext: '';
                let mime = file_info? file_info.mime: 'application/octet-stream';
                let file_hash = await md5File(donwload_file);
                let signature = md5(file_url+file_hash);
                let dest = this.service.bucket.fullBucketDir(_bucket)+signature+extname;
                fs.renameSync(donwload_file, dest);

                let insert = {};
                insert.firstname = file_url;
                insert.firstname_hash = md5(file_url);
                insert.ext = extname;
                insert.query_params = '';
                insert.signature = signature;
                insert.bucket = _bucket.bucket;
                insert.file_hash = file_hash;
                insert.mime = mime;
                insert.path = dest;

                await Media.upsert(insert);
                return {signature};
            }
        }catch(e) {
            console.debug('media.js#syncNetMediafile@e', e);
            throw e;
        }
    }

    async syncNetMediafile2 (file_url, _bucket, headers={}, sync=false) {
        let context = this;
        let _m = await this.getMediaFile(file_url);
        if (_m) {
            return {signature: _m.signature};
        } 

        let _args = {};
        _args.headers =headers;
        _args.bucket = _bucket.bucket;
        let taskey = await this.postDownloadTask(file_url, _args);
        let down_taskey = await this.service.task.triggerTask(taskey, -1);
        //console.debug('media.js#syncNetMediafile2@_done_task', _done_task);
        return down_taskey
        // 还未有媒体。post the download task
    }

    /**
     * _xx 下划线开头的变量，意味这个变量已经存在于内存，不用再从数据库load，否则它只是一个字符串。
     */
    async syncMediafile (file_path, _bucket, save_info = null, del_original = true) {
        console.debug('media.js#syncMedia@file_path', file_path);
        
        if (fs.existsSync(file_path)) {

            /** 拆解文件信息 */

            let filehash = await md5File(file_path);

            let extname;
            let filename;
            let filename_hash;

            if (save_info && save_info.filename) {
                extname = path.extname(save_info.filename);
                filename = path.basename(save_info.filename, extname);
                filename_hash = md5(filename);
            }else {
                extname = path.extname(file_path);
                filename = path.basename(file_path, extname);
                filename_hash = md5(filename);
            }
            
            console.debug('media.js#syncMediafile@extname', extname);
            console.debug('media.js#syncMediafile@filename', filename);
            let medias = await Media.findAll({where:{file_hash:filehash, bucket:_bucket.bucket}});

            //console.debug('media.js#syncMediafile@medias', medias);
            
            let signature = md5(filename+filehash+_bucket.bucket);

            /**
             * case 1 完全是新的文件。
             * case 2 已经有相同的实体文件存在，但是文件名字不同。
             * case 3 已经有相同的实体文件存在，且文件名字与数据库在案记录的文件名字一样。
             * case 4 已经有相同的实体文件存在, 且文件名字与数据库在案记录的签名名字一样。
             */
            let _case = 1;
            let _m = null;

            if (medias.length != 0) {

                _case = 2;
                _m = medias[0];

                for(let i=0; i<medias.length; ++i) {
                    if (medias[i].firstname_hash == filename_hash) {
                        _m = medias[i];
                        _case = 3;
                        break;
                    }else if (medias[i].signature == filename) {
                        _m = medias[i];
                        _case = 4;
                        break;
                    }
                }
            }
            
            // case 1 需要移动文件到当前 bucket 目录。 
            console.debug('media.js#syncMediafile@_case', _case);
            
            let dest = '';
            if (_case == 1) {
                let _bucket_dir = this.service.bucket.fullBucketDir(_bucket);
                dest = _bucket_dir + signature + extname;
                
                let file_dir = path.dirname(file_path);

                if (_bucket_dir == file_dir) {
                    // 在同一个文件夹中 则重命名即可
                    fs.renameSync(file_path, dest);
                    console.debug('media.js#syncMediafile#_bucket_dir == file_dir#renameSync@file_path', file_path);

                }else {
                    // 在不同文件夹中
                    fs.copyFileSync(file_path, dest);
                    if (del_original) {
                        console.debug('media.js#syncMediafile#_case == 1#del_original@file_path', file_path);
                        fs.unlinkSync(file_path);
                    } 

                }
            }else if (_case == 2 || _case == 3) {
                dest = _m.path;
                console.debug('media.js#syncMediafile#_case == 2 || _case == 3#unlinkSync@file_path', file_path);
                fs.unlinkSync(file_path);
            }

           if (_case == 1 || _case == 2) {
               // case 1 || case 2 保存一条记录，指向文件实体。
               console.debug('media.js#syncMediafile@dest', dest);
               if (dest != '' && fs.existsSync(dest)) {
                    let insert = {};
                    insert.firstname = filename;
                    insert.firstname_hash = filename_hash;
                    insert.ext = extname;
                    insert.query_params = '';
                    insert.signature = signature;
                    insert.bucket = _bucket.bucket;
                    insert.file_hash = filehash;
                    insert.path = dest;

                    if (_m != null) {
                        insert.mime = _m.mime;
                    }else {
                        if (save_info && save_info.mime) {
                            insert.mime = save_info.mime
                        }else {
                            let file_info = await FileType.fromFile(dest);
                            if (file_info) {
                                insert.mime = file_info.mime;
                            }else{
                                insert.mime = '';
                            }
                        }
                    }
                    await Media.upsert(insert);
               }else {
                   throw 'saving file entity fail';
               }
            }
           return {signature};
        }else {
            throw 'file no exists';
        }

    }
    
    async insertMedia (insert) {
        return await Media.upsert(insert);
    }
    
    /*
    async getUploadMedia(bucket, user_id, page=1, perpage=20) {
        let count_sql = "SELECT COUNT(Buckets.user_id) as count FROM Media LEFT OUTER JOIN Buckets ON Media.bucket = Buckets.bucket WHERE Buckets.user_id = ? AND Media.bucket = ? ";
        let count_medias = await sequelize.query(count_sql, {replacements:[user_id, bucket], type: sequelize.QueryTypes.SELECT});
        console.debug('media.js#getUploadMeida@count_medias', count_medias);
        
        let query_sql = "SELECT Buckets.user_id, Media.* FROM Media LEFT OUTER JOIN Buckets ON Media.bucket = Buckets.bucket WHERE Buckets.user_id = ? AND Media.bucket = ? LIMIT ? OFFSET ? ";
        let _medias = await sequelize.query(query_sql,{replacements:[user_id, bucket, perpage, (page-1)*perpage], type: sequelize.QueryTypes.SELECT});
        return {medias:_medias, count: count_medias[0].count};
    }
    */

    async getAllUploadMedia(bucket) {
        return await Media.findAll({
            where: {
                bucket: bucket
            }
        });
    }

    async getUserUploadMedia(user_id, bucket='', page=1, perpage=20) {

        let count_sql = "SELECT COUNT(Buckets.user_id) as count FROM Media LEFT OUTER JOIN Buckets ON Media.bucket = Buckets.bucket WHERE Buckets.user_id = ?" + (bucket!=''? ' AND Media.bucket = ?':'');
        console.debug('getUserUploadMedia@count_sql', count_sql, bucket);
        let count_medias = await sequelize.query(count_sql, {replacements:(bucket!=''?[user_id, bucket]:[user_id]), type: sequelize.QueryTypes.SELECT});
        //console.debug('media.js#getUploadMedia@count_medias', count_medias);
        if (count_medias[0].count == 0 ) {
            return {medias:[], count: 0};
        }
        
        let query_sql = 'SELECT Media.id, Media.firstname, Media.ext, Media.signature, Media.mime, Media.bucket, Buckets.user_id, Buckets.is_private FROM Media LEFT OUTER JOIN Buckets ON Media.bucket = Buckets.bucket WHERE Buckets.user_id = ? '+ (bucket != ''? ' AND Media.bucket = ? ':'') +' LIMIT ? OFFSET ? ';
        let _medias = await sequelize.query(query_sql,{replacements:(bucket!=''?[user_id, bucket, perpage, (page-1)*perpage]:[user_id, perpage, (page-1)*perpage]), type: sequelize.QueryTypes.SELECT});
        //return _medias;
        return {medias:_medias, count: count_medias[0].count};
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

    async getMediaFileReadStream (_media) {
        if (_media && fs.existsSync(_media.path)) {
            let stat = fs.statSync(_media.path);
            return {stream: fs.createReadStream(_media.path), mime: _media.mime, length: stat.size};
        }
        return false;
    }

    async getMediaFile (signature) {

        let query_sql = 'SELECT Media.*, Buckets.is_private FROM Media LEFT OUTER JOIN Buckets ON Media.bucket = Buckets.bucket WHERE Media.signature = ? or Media.firstname_hash = ? or Media.firstname_hash = ? limit 1 offset 0';
        let _medias = await sequelize.query(query_sql,{replacements:[signature, md5(signature), signature], type: sequelize.QueryTypes.SELECT});
        //console.debug('media.js#getMediafile@_media', _media);
        
        return (_medias && _medias.length > 0) ? _medias[0]: null;
    }

    async postCopyTask (_media, handler, _args) {
        let taskey = this.service.task.calKey(_media.firstname, handler, JSON.stringify(_args));
        console.debug('media.js#postCopyTask@taskey', taskey);
        await this.service.task.newTask(
            _media.firstname, 
            taskey, 
            handler, 
            JSON.stringify(_args),
            _media.path,
            'copy'
        );
        return taskey;
    }

    async postDownloadTask (url, _args) {
        let taskey = this.service.task.calKey(url, JSON.stringify(_args));
        console.debug('media.js#postDownloadTask@taskey', taskey);
        await this.service.task.newTask(
            'download '+url,
            taskey,
            '',
            JSON.stringify(_args),
            url,
            'download'
        );
        return taskey;
    }

    async getCopyMediafileStream (_media, handler, _args) {
        let key = this.service.task.calKey(_media.firstname, handler, JSON.stringify(_args));
        let cache_file = this.service.bucket.fullBucketDir(_media)+'/cache/'+key;
        if (fs.existsSync(cache_file)) {
            let fileinfo = await FileType.fromFile(cache_file);
            let stat = fs.statSync(cache_file);
            return {stream: fs.createReadStream(cache_file), mime: (fileinfo? fileinfo.mime: 'application/octet-stream'), length:stat.size};
        }else {
            let result = await this.TryToGetCopyMediafile(_media, handler, _args);
            console.debug('media.js#getCopyMediafileStream@result, _args', result, _args);
            if (fs.existsSync(result.file)) {
                let fileinfo = await FileType.fromFile(result.file);
                let stat = fs.statSync(result.file);
                return {stream: fs.createReadStream(result.file), mime: (fileinfo? fileinfo.mime: 'application/octet-stream'), length:stat.size};
            }else{
                throw 'copy file not exists!jsjflaksfas';
            }
        }
        
    }

    /**
     * BIG BIG IMPORT FUNCTION
     * @param {*} _media 
     * @param {*} handler 
     * @param {*} _args 
     */
    /*
    async TryToGetCopyMediafile(_media, handler, _args=[], sync=true) {

        let context = this;
        return new Promise( async (resolve, reject) => {

            let taskey = context.service.task.calKey(_media.firstname, handler, JSON.stringify(_args));
            let _task = await context.service.task.findTask(taskey);
            let timer = -1;
            let _tasklistener = null;
            // if no task try to post a new one 
            if (!_task || _task.try < context.app.config.task.try_limit ) {
                try{

                    if (!_task) {
                        await context.postCopyTask(_media,handler, _args);//context.postCopyMediaTask(_media, _handler, _args);
                    }else{
                        await context.service.task.resetTaskStatus(_task.key);
                    }

                    
                    // 定义监听器。
                    _tasklistener = {};
                    _tasklistener.onTaskStatus = async (taskey) => {
                        console.debug('media.js#tasklistener#onTaskStatus@taskey', taskey);
                        let _on_task = await context.service.task.findTask(taskey);
                        //console.debug('media.js#tasklistener#onTaskStataus@task.status', on_task);
                        if (_on_task.status == 'done') {
                            //let info = context.service.task.fileInfo2Obj(_on_task.file_info);
                            resolve({ file: _on_task._dest.dest });
                            console.debug('media.js#tasklistener#onTaskStatus@task.status == done@task.dest & info', _on_task.dest);
                            if (timer != -1) {
                                console.debug('media.js#tasklistener@clearTimeout', timer);
                                clearTimeout(timer);
                            }
                        } else if (_on_task.status == 'err') {
                            if (timer != -1) {
                                console.debug('media.js#tasklistener@clearTimeout', timer);
                                clearTimeout(timer);
                            }
                            reject(context.service.task.getLastErrmsg(_on_task));

                        }
                        // 用完了把监听器移除。
                        context.app.rmTasklistener(_tasklistener);
                    };
                    // 移除监听器。
                    context.app.addTasklistener(_tasklistener);

                    //发送消息去启动task
                    context.app.messenger.sendToAgent('new_task', taskey);
                    console.debug('media#trytoGetCopyMediafiel', 'sendToAgent ' + taskey);

                    if (!sync) {
                        reject('task processing');
                    }
                }catch(e) {
                    console.debug('media.js#TryToGetCopyMediafile@e', e);
                    reject(e);
                }
            }

            // 刚刚插入的情况，插入了不会返回内存对象。
            if (!_task) {
                _task = await context.service.task.findTask(taskey);
            }

            // 再找一遍还是没有的话就直接reject
            if (!_task) {
                reject('task fail');
            }

            if ( (_task.status == 'processing') || (_task.status == 'idle') ) {
                if (!sync)
                    reject('task is processing');
                else {
                    
                    // 双重保障，30秒超时。
                    console.debug('media.js#TryToGetMediafile@setTimeout');
                    timer = setTimeout( async ()=>{
                        // time out checking the task;
                        _task = await context.service.task.findTask(taskey);
                        console.debug('media.js#Timer@task.status', _task.status);
                        if (_task.status == 'done') {
                            //let info = context.service.task.fileInfo2Obj(_task.file_info);
                            resolve({file:_task._dest.dest});
                        }else if (_task.status == 'err') {
                            //reject(_task.errmsg);
                            reject(context.service.task.getLastErrmsg(_task));
                        }else{
                            reject('task time out task id '+_task);
                        }
                        if (_tasklistener) {
                            context.app.rmTasklistener(_tasklistener);
                        }
                    }, 30*1000);
                }
            }else if (_task.status == 'done') {
                resolve({file:_task._dest.dest});
            } else {
                console.debug('media.js#TryToGetCopy@task.status == err & task.try > try_limit');
                reject(context.service.task.getLastErrmsg(_task));
            }
        });
    } 
    */
    async TryToGetCopyMediafile(_media, handler, _args=[], sync=true) {

        let taskey = this.service.task.calKey(_media.firstname, handler, JSON.stringify(_args));
        
        let _task = await this.service.task.findTask(taskey);
        if (!_task) {
            await this.postCopyTask(_media,handler, _args);
        }
        let _done_task = await this.service.task.triggerTask(taskey, sync?30:-1);
        //console.debug('media.js#TryToGetCopyMediafile@_done_task', [_done_task.key, _done_task.params]);
        
        if (_done_task.status == 'done') {
            return { file: _done_task._dest.dest };
        } else {
            if (_done_task.status == 'error')
                throw this.service.task.getLastErrmsg(_done_task);
            else
                throw 'task status error <'+_done_task.status + '>';
        }
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