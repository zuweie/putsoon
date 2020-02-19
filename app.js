/*
 * @Author: your name
 * @Date: 2020-02-05 10:28:31
 * @LastEditTime : 2020-02-05 11:21:16
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app.js
 */

let Tasklistener = [];
const process = require('process');
module.exports = (app) => {
    app.passport.verify(async (ctx, user) => {
        ctx.payload = user.payload;
        return user.payload;
    });
    
    app.messenger.on('exec_task', (task) => {
        console.debug('app (pid '+process.pid+') receive a message to exec task');
        //console.debug('task', task);
        const ctx = app.createAnonymousContext();
        ctx.runInBackground( async () => {
            try{
                console.debug('app.js#app.messenger@exec_task start');
                await ctx.service.task.execTask(task);
                console.debug('app.js#app.messenger@exec_task end')
            }catch(e){
                console.debug(e);
            }
            
            console.debug('app (pid ' +process.pid +') send a message all the app to update task status');
            //let new_status_task = await ctx.service.task.findTask(task.key);
            //console.debug('app (pid '+process.id +') now task (before send)', new_status_task);
            ctx.app.messenger.sendToApp('task_done', task.key);
        })
    });

    app.messenger.on('task_done', (key)=>{
        console.debug('app (pid '+ process.pid +') receive a message to update by new task status');
        console.debug('app (pid '+ process.pid +') has listener '+Tasklistener.length);
        Tasklistener.forEach(l=>{
            l.onTaskStatus(key);
        })
    });

    app.addTasklistener = (l) =>{
        console.debug('pid '+process.pid+' add listener!');
        Tasklistener.push(l);
    };
    
    app.rmTasklistener = (l) => {
        for(let i=0; i<Tasklistener.length; ++i) {
            if (l == Tasklistener[i]) {
                console.debug('app pid '+ process.pid + ' rm listener !');
                Tasklistener.splice(i, 1);
                console.debug('app pid '+ process.pid + ' has listener '+Tasklistener.length);
                break;
            }
        }
    }
    app.publishTaskStatus = (key) => {
        listener.forEach(l=>{
            l.onTaskStatus(key);
        });
    }
}