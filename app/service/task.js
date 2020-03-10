/*
 * @Author: your name
 * @Date: 2020-02-15 15:01:49
 * @LastEditTime: 2020-03-10 16:38:10
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

    /*
    calKey (_media, handler, args) {
        let key = _media.firstname + '/'+handler;
        for (let i=0; i<args.length; ++i) {
            key += '/'+args[i];
        }
        console.debug('task.js#calKey@key', key);

        return md5(key);
    }
    */
    /*
    calKey(name, handler, args) {
        let key = name + '/' + handler;
        for (let i = 0; i < args.length; ++i) {
            key += '/' + args[i];
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
    */
    
    calKey (... ppp) {
        let key = '';
        for (let p of ppp) {
            key += '/'+p;
        }
        console.debug('task.js#calKey@key', key);
        return md5(key);
    }

    async execTask (_task) {
        try {
            if (_task.try < this.app.config.task.try_limit) {

                this.updateTaskStart(_task.key);
                let CopyExecutor = require(__dirname+'/task_executors/'+_task.executor+'-executor');
                let executor = new CopyExecutor(_task, this);
                //1 set task processing
                await executor.exec();
                this.updateTaskDone(_task.key)
                return true;
            }else {
                throw 'try time out of limit';
            }
            //2 set task done !
        } catch (e) {
            // set task err !
            console.debug('task.js#execTask@e', typeof e, e);
            //console.debug('task.js#execTask@_task', _task);
            if (typeof e == 'object') {
                
                await this.updateTaskErr(_task, JSON.stringify(e));

            } else if (typeof e == 'string') {
                await this.updateTaskErr(_task, e);

            } else {
                await this.updateTaskErr(_task, 'unknown');
            }
        }
        return false;
    }
    
    async postTask (name, key, handler, params, src, exe, force = false) {
        return await Task.upsert({
            name: name,
            key: key,
            handler: handler,
            params: params,
            src: src,
            dest: '',
            status: 'idle',
            errmsg: '',
            executor: exe,
            percent: 0,
            worker: 0,
            try: 0,
        });
    }
    
    /*
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
                let _h = require('donkey-plugin-' + handler)(_media.path, dest_dir, args, this.ctx, _task);
                let result = await _h.exec();

                // 这里要认真处理一下handler返回的结果

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

                    let dest_extname = path.extname(dest);
                    let save_path = this.service.bucket.fullBucketDir(_media) + 'cache/' + this.calKey(_media.firstname, handler, args) + dest_extname;
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
    */
   
    mkTmpDir() {
        let dir =  this.app.config.bucket.root+'.tmp/worker_'+process.pid+'/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive: true});
        }
        return dir;
    }

    async findTask(key) {
        let _task =  await Task.findOne({where:{
            key: key,
        }});

        if (_task) {
            
            //_task._file_info = this.fileInfo2Obj(_task.file_info);
            _task._params = this.params2Obj(_task.params);
            _task._errmsg = this.errmsgInfo2Obj(_task.errmsg);
            
        }
        return _task;
    } 

    async findTaskByStatus (status) {
        let _tasks =  await Task.findAll({where:{status: status}});
        for (let _t of _tasks) {
            _t._params = this.params2Obj(_task.params)
            _t._err_msg = this.errmsgInfo2Obj(_task.errmsg);
        }
        return _tasks;
    }

    async isTaskExists (key) {
        let task = await this.findTask(key);
        return task != null;
    }

    async updateTaskDest (key, dest) {
        return await Task.update({dest: dest}, {where:{key: key}});
    }
    async updateTaskStatus (key, status) {
        console.debug('task.js#updateTaskStatus@status', status, key);
        return await Task.update({status: status}, {where:{
            key: key,
        }});
    }

    
    async resetTaskStatus(key) {
        console.debug('task.js#resetTaskStatus');
        return await this.updateTaskStatus(key, 'idle');
    }

    async updateTaskErr(_task, msg) {
        //console.debug('task.js#updateTaskErr@_task.key', _task.key);
        _task._errmsg.push(msg);
        return await Task.update({errmsg: this.errmsgInfo2Json(_task._errmsg), status: 'err', try:(_task.try+1)}, {where:{
            key:_task.key,
        }});
    }

    async updateTaskDone(key) {
        return await Task.update({errmsg:'', status:'done'}, {where:{
            key:key
        }});
    }
    async updateTaskStart(key) {
        return await Task.update({status:'processing', worker:process.pid}, {where:{
            key: key
        }});
    }
    async getTaskStatus (key) {
        let _task = await this.findTask(key);
        return _task.status;
    }



    async getAllTasks() {
        return await Task.findAll();
    }
    
    async setTaskPercent(key, percent) {
        return await Task.update({percent: percent}, {where:{
            key:key
        }});
    }

    
    async deleteTasks(ids) {
        
        let _ids = [];
        if (typeof ids == 'string' || typeof ids == 'number') {
            _ids.push(ids);
        }else {
            _ids = ids;
        }
        console.debug('task.js#deleteTask@ids', ids);
        
        return await Task.destroy({where: {id:{[Op.in]:ids}}});
        /*
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
        */
    }
    
    errmsgInfo2Obj (err_msg) {
        let _err_msg = [];
        try{
            _err_msg = err_msg != ''? JSON.parse(err_msg) : [];
        }catch(e) {
            console.debug('task.js#errmsginof2Obj@e', e.stack);
            console.debug('task.js#errmsgInfo2Obj@e', e);
        }
        return _err_msg;
    }

    errmsgInfo2Json (_err_msg) {
        try{
            return JSON.stringify(_err_msg);
        }catch(e) {
            console.debug('task.js#errmsgInfo2Json@e', e);
            return JSON.stringify([]);
        }
    }

    params2Json (_params) {
        return _params? JSON.stringify(_params) : JSON.stringify({});
    }

    params2Obj (params) {
        return params != ''?JSON.parse(params) : {};
    }

    getLastErrmsg( _task ) {
        return _task._errmsg.length > 0 ?_task._errmsg[_task._errmsg.length-1] : "";
    }
}

module.exports = TaskService;