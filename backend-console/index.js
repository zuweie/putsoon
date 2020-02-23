#!/usr/bin/env node
/*
 * @Author: your name
 * @Date: 2019-12-09 15:48:15
 * @LastEditTime: 2020-02-23 11:21:35
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-mini-admin/index.js
 */
'use strict';
const colors = require('colors/safe');

console.log(colors.green('Welcome to install Egg Media Server ...'));

//console.log(process.argv[2]);
let action = process.argv[2];
// start installing

try {
    if (action == 'install') {
        const install = require('./install');
        install();
        //console.log('do installing');
    }else if (action == 'packing') {
        const packup = require('./packup');
        packup();
    }
}catch (err) {
    console.log(colors.red(err));
}


