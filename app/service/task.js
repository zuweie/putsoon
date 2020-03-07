/*
 * @Author: your name
 * @Date: 2020-02-15 15:01:49
 * @LastEditTime: 2020-03-07 10:37:33
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/service/task.js
 */
'use strict';
const md5 = require('md5');
const fs = require('fs');
const path = require('path');
const FileType = require('file-type');
const Service = require('egg').Service;
const Op = require('sequelize').Op;
const Task = require('../../database/sequelize_model')('task');
class TaskService extends Service {

    calKey (_media, handler, args) {
        let key = _media.firstname + '/'+handler;
        for (let i=0; i<args.length; ++i) {
            key += '/'+args[i];
        }
        console.debug('task.js#calKey@key', key);

        return md5(key);
    }

    implodeParams (args) {
        let params = '';
        for (let i=0; i<args.length; ++i) {
            params += '/'+args[i];
        }
        return params;
    }

    explodeParams (params) {
        params = params.split('\/');
        console.debug('task.js#explodeParams@params', params);
        for (let i=0; i<params.length; ++i) {
            if (params[i] == ''||params[i]==null||typeof(params[i])==undefined) {
                params.splice(i, 1);
            }
        }
        return params;
    }
    async postTask (media, handler, args, force = false) {

        if (force) {
            await this.deleteTask(task);
        }

        let name = media.signature;
        let key = this.calKey(media, handler, args);
        let params = this.implodeParams(args);

        try {
            await Task.upsert({
                name: name,
                key: key,
                handler: handler,
                params: params,
                src: media.path,
                dest: '',
                status: 'idle',
                errmsg: '',
                try: 0,
            });
            return true;
        }catch (e) {
            throw e;
        }
    }

    async execTask(_task) {
        //console.debug('task#execTask@task', task);
        await this.updateTaskStatus(_task, 'processing');
        let _media = await this.service.media.getMediaFile(_task.name);
        
        if (_media) {

            let handler = _task.handler;
            let args = this.explodeParams(_task.params);
            console.debug('task#execTask@args', args);
            
            try {
                let dest_dir = this.mkTmpDir();
                let _h = require('donkey-plugin-' + handler)(_media.path, dest_dir, args, this.ctx);
                let result = await _h.exec();

                // 这里要认真处理一下handler返回的结果
                /** 返回检测，OK就行，不OK就throw **/

                // 这个是
                
                console.debug('task.js#execTask@result', result);
                let dest = ''
                if (typeof result == 'string') {
                    dest = result;
                } else if (typeof result == 'object') {
                    dest = result.dest;
                } else {
                    throw 'unknown handler result!'
                }
                console.debug('task.js#execTask@dest', dest);
                if ( dest == '' || (dest != 'opath' && !fs.existsSync(dest)) ) {
                    throw 'plugin exec did not return the dest'
                }

                let file_info = {};
                if (dest == 'opath') {
                    dest = _media.path;
                    file_info.mime = _media.mime;
                } else {
                    /** 把输出文件搬到要使用的目录 **/

                    let dest_extname = path.extname(dest);
                    let save_path = this.service.bucket.fullBucketDir(_media) + 'cache/' + this.calKey(_media, handler, args) + dest_extname;
                    fs.renameSync(dest, save_path);
                    dest = save_path;
                    let ff = await FileType.fromFile(dest);
                    if (ff) {
                        file_info.mime = ff.mime;
                    }else {
                        file_info.mime = _media.mime;
                    }
                }
                
                await this.updateTaskDone(_task, dest, file_info);
                return true;
            } catch (e) {
                console.debug('taskjs.#execTask@e', typeof e, e);
                if (typeof e == 'object') {
                    await this.updateTaskErr(_task, JSON.stringify(e));

                } else if (typeof e == 'string') {
                    await this.updateTaskErr(_task, e);

                } else {
                    await this.updateTaskErr(_task, 'unknown');
                }
                return false;
            }
        }else{
            await this.updateTaskErr(_task, 'media <'+signature+'> is not exists');
            return false;
        }
    }

    mkTmpDir() {
        let dir =  this.app.config.bucket.root+'.tmp/worker_'+process.pid+'/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive: true});
        }
        return dir;
    }
    async findTask(key) {
        return await Task.findOne({where:{
            key: key,
        }});
    } 

    async isTaskExists (key) {
        let task = await this.findTask(key);
        return task != null;
    }

    async updateTaskStatus (_task, status) {
        console.debug('task.js#updateTaskStatus@status', status, _task.key);
        return await Task.update({status: status}, {where:{
            key: _task.key,
        }});
    }
    
    async resetTaskStatus(_task) {
        console.debug('task.js#resetTaskStatus');
        return await this.updateTaskStatus(_task, 'idle');
    }

    async updateTaskErr(_task, msg) {
        //console.debug('task.js#updateTaskErr@_task.key', _task.key);
        let errmsgs = [];
        if (_task.errmsg != '') {
            try {
                errmsgs = JSON.parse(_task.errmsg);
            }catch(e){
                console.debug('task.js#uplodateTask#JSON.parse@e', e);
            }
        }
        errmsgs.push(msg);
        return await Task.update({errmsg: JSON.stringify(errmsgs), status: 'err', try:(_task.try+1)}, {where:{
            key: _task.key,
        }});
    }
    async updateTaskDone(_task, dest, file_info) {
        return await Task.update({errmsg:'', status:'done', dest: dest, file_info:this.fileInfo2Json(file_info)}, {where:{
            key:_task.key
        }});
    }
    
    async getTaskStatus (key) {
        let task = await this.findTask(key);
        return task.status;
    }

    async getTaskByStatus (status) {
        return await Task.findAll({where:{status: status}});
    }

    async getAllTasks() {
        return await Task.findAll();
    }
    
    /*
    deleteTask (key) {
        return Task.destroy({where:{
            key:key
        }});
    }
    */

    async deleteTasks(ids) {
        
        let _ids = [];
        if (typeof ids == 'string' || typeof ids == 'number') {
            _ids.push(ids);
        }else {
            _ids = ids;
        }
        console.debug('task.js#deleteTask@ids', ids);
        
        for(let i=0; i<_ids.length; ++i) {
            let task = await Task.findByPk(_ids[i]);
            if (task) {
                //console.debug('task.js#deleteTasks@task', task);
                try {
                    if (task.dest != '') {

                        if (fs.existsSync(task.dest)) {
                            fs.unlinkSync(task.dest);
                        }
        
                        let dest_dir = path.dirname(task.dest);
                        if (fs.existsSync(dest_dir)) {
                            fs.rmdirSync(dest_dir);
                        } 
                    }  
                    return await Task.destroy({where: {id:_ids[i]}});
                }catch(e) {
                    console.debug('task.js#deleteTasks@e', e);
                }
            }
        }
    }
    
    fileInfo2Obj( file_info ) {
        let o_file_info = JSON.parse(file_info);
        return o_file_info;
    }

    fileInfo2Json( file_info ) {
        let j_file_info = JSON.stringify(file_info);
        return j_file_info;
    }

    getLastErrmsg( _task ) {
        let errmsgs = JSON.parse(_task.errmsg);
        return errmsgs[errmsgs.length-1];
    }
}

module.exports = TaskService;