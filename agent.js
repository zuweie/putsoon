/*
 * @Author: your name
 * @Date: 2020-02-15 11:22:42
 * @LastEditTime: 2020-02-28 17:08:07
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/agent.js
 */
const fs = require('fs');
const Task = require('./database/sequelize_model')('task');
module.exports = agent => {

    // processing the task.
    agent.messenger.on('new_task', async key => {

        console.debug('new task has create, send the task to one of app process!');

        if (key != '') {
            // find all idle task 
            let task = await Task.findOne({where:{
                key: key,
                status: 'idle'
            }})
            if (task) {
                agent.messenger.sendRandom('exec_task', task);
                console.debug('1 agent sendRandom message with key '+task.key);
            }
        }else{
            // one idle task
            let tasks = await Task.findAll({where:{
                status: 'idle'
            }});
            if (tasks && tasks.length > 0) {
                tasks.forEach(t => {
                    agent.messenger.sendRandom('exec_task', t);
                    console.debug('2 agent sendRandom message with key '+ t.key);
                })
            }
        }
    });
    agent.messenger.on('egg-ready', () => {
        agent.messenger.sendRandom('_port');
    });
}