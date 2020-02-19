/*
 * @Author: your name
 * @Date: 2020-02-15 15:01:49
 * @LastEditTime: 2020-02-19 11:17:32
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/service/task.js
 */
'use strict';
const md5 = require('md5');
const fs = require('fs');
const FileType = require('file-type');
const Service = require('egg').Service;
const Op = require('sequelize').Op;
const Task = require('../../database/sequelize_model')('task');
class TaskService extends Service {

    calKey (media, handler, args) {
        let key = media.firstname + '/'+handler;
        for (let i=0; i<args.length; ++i) {
            key += '/'+args[i];
        }
        console.debug('key for task', key);

        return md5(key);
    }

    implodeParams (args) {
        let params = '';
        for (let i=0; i<args.length; ++i) {
            params = '/'+args[i];
        }
        return params;
    }

    explodeParams (params) {
        params = params.split('\/');
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
                try: 1,
            });
            return true;
        }catch (e) {
            throw e;
        }
    }

    async execTask(task) {
        //console.debug('task#execTask@task', task);
        await this.updateTaskStatus(task.key, 'processing');
        let media = await this.service.media.getMediaFile(task.name);
        
        if (media) {

            let handler = task.handler;
            let args = this.explodeParams(task.params);
            console.debug('task#execTask@args', )
            let dest_dir = '';
            try{
                dest_dir = this.service.media.mkSaveDir(media, handler, args);
            }catch(e) {
                console.debug(e);
                await this.updateTaskErr(task.key, 'make Save dir err');
                return false;
            }
            
            for (let i=0; i<task.try; ++i) {
                try {
                    let _h = require('donkey-plugin-'+handler)(media.path, dest_dir, args);
                    let result = await _h.exec();
                    
                    // 这里要认真处理一下handler返回的结果

                    /** 返回检测，OK就行，不OK就throw **/
                    
                    console.debug('task.js#execTask@result', result);
                    let dest = ''
                    if (typeof result == 'string') {
                        dest = result;
                    }else if (typeof result == 'object') {
                        dest = result.dest;
                    }else {
                        throw 'unknown handler result!'
                    }
                    if (!fs.existsSync(dest)) {
                        throw 'plugin exec did not return the dest'
                    }

                    /** 返回检测 **/
                    /* try to calculate the file mime */
                    let file_info = {};
                    if (result.mime) {
                        file_info.mime = result.mime;
                    }else{
                        file_info.mime = media.mime;
                        let ff = await FileType.fromFile(dest);
                        if (ff) {
                            file_info.mime = ff.mime;
                        }
                    }
                    await this.updateTaskDone(task.key, dest, file_info);
                    return true;
                }catch(e) {
                    console.debug('taskjs.#execTask@e', typeof e, e); 
                    if (typeof e == 'object') {
                        await this.updateTaskErr(task.key, JSON.stringify(e));

                    }else if (typeof e == 'string') {
                        await this.updateTaskErr(task.key, e);

                    }else {
                        await this.updateTaskErr(task.key, 'unknown');
                    }
                    return false;
                }
            }
        }else{
            await this.updateTaskErr(task.key, 'media <'+signature+'> is not exists');
            return false;
        }
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

    async updateTaskStatus (key, status) {
        console.debug('task.js#updateTaskStatus@status', status, key);
        return await Task.update({status: status}, {where:{
            key: key,
        }});
    }

    async updateTaskErr( key, msg) {
        console.debug('task.js#updateTaskErr', 'err', key);
        return await Task.update({errmsg: msg, status: 'err'}, {where:{
            key: key,
        }});
    }
    async updateTaskDone(key, dest, file_info) {
        return await Task.update({errmsg:'', status:'done', dest: dest, file_info:this.fileInfo2Json(file_info)}, {where:{
            key:key
        }});
    }
    async getTaskStatus (key) {
        let task = await this.findTask(key);
        return task.status;
    }

    getTaskByStatus (status) {
        return Task.findAll({where:{status: status}});
    }
    getAllTasks() {
        return Task.findAll();
    }
    
    deleteTask (keys) {
        return Task.destroy({where:{
            key:key
        }});
    }

    deleteTasks(ids) {
        return Task.destroy({where:{
            id:{
                [Op.in]: ids
            }
        }});
    }
    
    fileInfo2Obj( file_info ) {
        let o_file_info = JSON.parse(file_info);
        return o_file_info;
    }

    fileInfo2Json( file_info ) {
        let j_file_info = JSON.stringify(file_info);
        return j_file_info;
    }
}

module.exports = TaskService;