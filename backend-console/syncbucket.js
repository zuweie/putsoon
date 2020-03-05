/*
 * @Author: your name
 * @Date: 2020-02-29 00:33:59
 * @LastEditTime: 2020-03-05 15:37:56
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/backend-console/syncbucket.js
 */

const fs = require('fs');
const getport = require('./getport');
const axios = require('axios');
const colors = require('colors/safe');

module.exports = async function (bucket) {

    if ( fs.existsSync (process.cwd()+'/.login-session.json') ) {
        let info =  fs.readFileSync(process.cwd()+'/.login-session.json');
        let login_session = JSON.parse(info);
        let access_token = login_session.data.access_token;
        let host = "http://127.0.0.1";
        let port = getport();

        try {
            let result = await axios({
                method: 'post',
                url: host+':'+port+'/api/v1/bucket/sync',
                data:{
                    bucket: bucket,
                },
                headers: {
                    Authorization: 'Bearer '+access_token
                }
            });
            console.log(colors.green(result.data));
        }catch (e) {
            console.log(e);
        }
    }else {
        console.log(colors.red('please login first ~'));
    }

}
