#!/usr/bin/env node
/*
 * @Author: your name
 * @Date: 2019-12-09 15:48:15
 * @LastEditTime: 2020-02-27 12:17:40
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-mini-admin/index.js
 */
'use strict';
const colors = require('colors/safe');


//console.log(process.argv[2]);
let action = process.argv[2];
// start installing

try {
    if (action == 'install') {
        console.log(colors.green('Welcome to install Egg Media Server ...'));
        const install = require('./install');
        install();
    }else if (action == 'login') {
        console.log(colors.yellow('usage: login <account (default admin)> <password (default 123456)>'));
        let acc = process.argv[3]? process.argv[3] : 'admin';
        let pwd = process.argv[4]? process.args[4] : '123456';
        const login = require('./login');
        login(acc, pwd);

    }else if (action == 'create:bucket') {
        console.log(colors.yellow('usage: bucket:create <bucket name(required)>'));
        //console.log(process.argv[3]);
        let bucket = process.argv[3];
        if (bucket) {
            const createBucket = require('./createbucket');
            createBucket(bucket);
        }else{
            console.log(colors.red('bucket name required'));
        }
        
    }else if (action == 'show:bucket') {
        const showBucket = require('./showbucket');
        showBucket();
    }else if (action == 'delete:bucket') {
        console.log(colors.yellow('usage: bucket:delete <bucket id(required)>'))
        let bucket_id = process.argv[3];
        if (bucket_id) {
            const deleteBucket = require('./deletebucket');
            deleteBucket(bucket_id);
        }else {
            console.log(colors.red('bucket id required'));
        } 
        
    }
}catch (err) {
    console.log(colors.red(err));
}


