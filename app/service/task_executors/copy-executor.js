/*
 * @Author: your name
 * @Date: 2020-03-09 18:20:43
 * @LastEditTime: 2020-03-17 14:40:21
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/service/task_executors/copy-executor.js
 */
/*
 * @Author: your name
 * @Date: 2020-03-09 18:20:43
 * @LastEditTime: 2020-03-12 12:49:27
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
            console.debug('CopyExecutor.js#execTask@plugin', this._ctx.app.config.plugin.prefix+handler);
            let dest_dir = this._ctx.service.task.mkTmpDir();
            let _h = require(this._ctx.app.config.plugin.prefix+handler)(_media.path, dest_dir, _args, this._ctx, this._task);
            let result = await _h.exec();

            console.debug('task.js#execTask@result', result);
            // 
            if (typeof result == 'string') {
                let tmp_dest = result;
                result = {};
                result.dest = tmp_dest;
            } else if (typeof result.dest != 'string') {
                throw 'unknown handler result!'
            }

            // executor 有权处理任何结果。
            console.debug('task.js#execTask@dest', result.dest);
            if (result.dest == '' || (result.dest != 'opath' && !fs.existsSync(result.dest))) {
                throw 'handler <'+ this._task.handler+'> did not return a valid dest'
            }

            //let file_info = {};
            if (result.dest == 'opath') {
                // 不需要处理，直接用就的原文件。
                result.dest = _media.path;
                //file_info.mime = _media.mime;
            } else {
                /** 把输出文件搬到要使用的目录 **/

                //let dest_extname = path.extname(dest);
                // 只计算出key，其他就算了。
                let key = this._ctx.service.task.calKey(this._task.name, this._task.handler, this._task.params);
                let save_path = this._ctx.service.bucket.fullBucketDir(_media) + 'cache/' + key //+ dest_extname;
                fs.renameSync(result.dest, save_path);
                result.dest = save_path;
            }
            //await this._ctx.service.task.updateTaskDest(this._task.key, dest);
            // save the dest to task
            return result;
            
        } else {
            throw  'media <'+signature+'> is not exists';
        }
    }
 }
 module.exports = CopyExecutor;