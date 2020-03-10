/*
 * @Author: your name
 * @Date: 2020-02-15 11:22:42
 * @LastEditTime: 2020-03-10 13:42:40
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/agent.js
 */
const fs = require('fs');
const Task = require('./database/sequelize_model')('task');
const shell = require('shelljs');

module.exports = agent => {

    // processing the task.
    agent.messenger.on('new_task', (... keys) => {

        console.debug('new task has create, send the task to one of app process!');
        
        for (let k of keys) {
            agent.messenger.sendRandom('exec_task', k);
            console.debug('agent.js#key@key ', k);
        }
        
    });
    agent.messenger.on('egg-ready', () => {
        // clear all the tmp file folder
        let bucket_tmp = agent.config.bucket.root+'.tmp/*';
        console.debug('agent.js#egg-ready@bucket_tmp', bucket_tmp);
        shell.rm('-rf', bucket_tmp);
        
        agent.messenger.sendRandom('_port');
    });
}