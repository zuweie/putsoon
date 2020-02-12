#!/usr/bin/env node
/*
 * @Author: your name
 * @Date: 2019-12-09 15:48:15
 * @LastEditTime : 2020-02-02 12:02:22
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-mini-admin/index.js
 */
'use strict';
const colors = require('colors/safe');
const install = require('./install');
const argv = require('yargs').argv;

console.log(colors.green('Welcome to install Egg Media Server ...'));

//console.log(process.argv[2]);
let action = process.argv[2];
// start installing

try {
    if (action == 'install') {
        install();
        //console.log('do installing');
    }else if (action == 'login') {

    }else if (action == 'create_upload_token' ) {

    }else if (action == 'create_bucket') {

    }else if (action == 'help') {
        
    }
}catch (err) {
    console.log(colors.red(err));
}


