#!/usr/bin/env node
/*
 * @Author: your name
 * @Date: 2019-12-09 15:48:15
 * @LastEditTime: 2020-03-07 13:48:44
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
    }else if (action == 'seeding') {
        const seeding = require('./seeding');
        seeding();
    }else if (action == 'login') {
        console.log(colors.yellow('usage: login <account (default admin)> <password (default 123456)>'));
        let acc = process.argv[3]? process.argv[3] : 'admin';
        let pwd = process.argv[4]? process.argv[4] : '123456';
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
        console.log(colors.yellow('usage: bucket:delete <bucket id or name (required)>'));
        let bucket_id = process.argv[3];
        if (bucket_id) {
            const deleteBucket = require('./deletebucket');
            deleteBucket(bucket_id);
        }else {
            console.log(colors.red('bucket id required'));
        } 
    }else if (action == 'sync:bucket') {
        console.log(colors.yellow('usage: bucket:sync <bucket name (required)>'));
        let bucket = process.argv[3];
        if (bucket) {
            const syncBucket = require('./syncbucket');
            syncBucket(bucket);
        }else {
            console.log(colors.red('bucket name required'));
        }
    }else if (action == "upload:media") {
        console.log(colors.yellow('usage: upload <bucket name (required)> <file1 (required)> <file3> <file4>...'));
        let bucket = process.argv[3];
        if (bucket) {
            const uploadmedia = require('./uploadmedia');
            uploadmedia(bucket, process.argv[4],process.argv[5],process.argv[6],process.argv[7],process.argv[8],process.argv[9],process.argv[10],process.argv[11],process.argv[12],process.argv[13],);
        }else {
            console.log(colors.red('bucket or upload required ~ '));
        }
    }else if (action == "download:media") {
        console.log(colors.yellow('usage: download <bucket name (require)> <url1 (required)> <url2> <url3>...'));
        let bucket = process.argv[3];
        if (bucket) {
            const syncNetmedia = require('./donwloadmedia');
            syncNetmedia(bucket, process.argv[4],process.argv[5],process.argv[6],process.argv[7],process.argv[8],process.argv[9],process.argv[10],process.argv[11],process.argv[12],process.argv[13]);
        }
    }
}catch (err) {
    console.log(colors.red(err));
}


