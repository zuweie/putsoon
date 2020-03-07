/*
 * @Author: your name
 * @Date: 2020-03-07 13:31:22
 * @LastEditTime: 2020-03-07 16:13:40
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/backend-console/syncnetmedia.js
 */
'use strict';
const fs = require('fs');
const getport = require('./getport');
const axios = require('axios');
const colors = require('colors/safe');

module.exports = async function (bucket, ... urls) {

    let enable_url = [];
    for (let l of urls) {
        if (l) {
            enable_url.push({url:l, headers:{}});
        }
    }

    if ( fs.existsSync (process.cwd()+'/.login-session.json') ) {
        let info =  fs.readFileSync(process.cwd()+'/.login-session.json');
        let login_session = JSON.parse(info);
        let access_token = login_session.data.access_token;
        let host = "http://127.0.0.1";
        let port = getport();

        try {
            let result = await axios({
                method: 'post',
                url: host+':'+port+'/api/v1/sync/net/media?bucket='+bucket,
                headers: {
                    'content-type': 'application/json',
                },
                data:{
                    targets: enable_url,
                },
            });
            console.log(colors.green(result.data));
        }catch (e) {
            console.log(e);
        }
    }else {
        console.log(colors.red('please login first ~'));
    }

}