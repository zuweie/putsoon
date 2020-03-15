/*
 * @Author: your name
 * @Date: 2020-03-14 09:46:44
 * @LastEditTime: 2020-03-14 10:37:42
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/schedule/watch_task.js
 */
const ps = require('find-process');
const Subscription = require('egg').Subscription;

class WatchTask extends Subscription {
    static get schedule() {
        return {
            interval: '10s',
            type:'worker',
        };
    }

    async subscribe () {
        let _processing_tasks = await this.ctx.service.task.findTaskByStatus('processing');
        console.debug(`watch_task.js#subscribe@find working ${_processing_tasks.length} task`);
        //console.debug('watch_task#subscribe@_processing_tasks', _processing_tasks);
        for (let _t of _processing_tasks) {
            let pid = _t.worker;
            try {
                let ps_list = await ps('pid', pid);
                //console.debug('watch_task.js#subscribe@ps_list', ps_list);
                if (ps_list.length == 0 ){
                    console.debug('watch_task.js#subscribe@ps_list.length==0@pid dead', pid);
                    //console.debug('watch_task.js#subscribe@ps_list.length==0@_t', _t);
                    this.ctx.service.task.updateTaskErr(_t, `worker ${pid} is dead!`);
                }

            }catch (e) {
                console.debug('watch_task.js#subscribe@e', e);
            }
        }
    }
}

module.exports = WatchTask;