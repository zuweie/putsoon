/*
 * @Author: your name
 * @Date: 2020-03-09 18:20:43
 * @LastEditTime: 2020-03-10 16:51:06
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/service/task_executors/CopyExecutor.js
 */

'use strict';
const fs = require('fs');
const path = require('path');
class CopyExecutor {

    constructor(_task, _ctx) {
        this._task = _task;
        this._ctx = _ctx;
    }

    async exec () {

        let signature = this._task.name;
        let _media = await this._ctx.service.media.getMediaFile(signature);
   
        if (_media) {
            
            if (!fs.existsSync(_media.path)) {
                throw 'src file not exists !';
            }

            let handler = this._task.handler;
            let _args = this._task._params;
            
            console.debug('CopyExecutor.js#execTask@args', _args);
            let dest_dir = this._ctx.service.task.mkTmpDir();
            let _h = require('donkey-plugin-' + handler)(_media.path, dest_dir, _args, this._ctx, this._task);
            let result = await _h.exec();

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
            if (dest == '' || (dest != 'opath' && !fs.existsSync(dest))) {
                throw 'handler'+ this._task.handler+' did not return a valid dest'
            }

            //let file_info = {};
            if (dest == 'opath') {
                dest = _media.path;
                //file_info.mime = _media.mime;
            } else {
                /** 把输出文件搬到要使用的目录 **/

                //let dest_extname = path.extname(dest);
                // 只计算出key，其他就算了。
                let key = this._ctx.service.task.calKey(this._task.name, this._task.handler, this._task.params);
                let save_path = this._ctx.service.bucket.fullBucketDir(_media) + 'cache/' + key //+ dest_extname;
                fs.renameSync(dest, save_path);
                dest = save_path;
                
            }
            this._ctx.service.task.updateTaskDest(this._task.key, dest);
            // save the dest to task
            
        } else {
            throw  'media <'+signature+'> is not exists';
        }
    }
 }
 module.exports = CopyExecutor;