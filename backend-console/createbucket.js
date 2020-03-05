/*
 * @Author: your name
 * @Date: 2020-02-27 09:05:33
 * @LastEditTime: 2020-03-05 15:36:15
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/backend-console/createbucket.js
 */

const fs = require('fs');
const colors = require('colors/safe');
const axios = require('axios');
const getport = require('./getport');

module.exports = async function (bucket) {
    if (fs.existsSync(process.cwd()+'/.login-session.json')) {
        let info =  fs.readFileSync(process.cwd()+'/.login-session.json');
        let login_session = JSON.parse(info);
        let access_token = login_session.data.access_token;
        let port = getport();
        let host = "http://127.0.0.1";
        try {
            let result = await axios({
                method: 'post',
                url: host+':'+port+'/api/v1/bucket/create',
                data: {
                    bucket: bucket
                },
                headers: {
                    Authorization: 'Bearer '+access_token
                }
            });
            console.debug(result.data);
        }catch (e) {
            console.log(colors.red(e));
        }
    } else {
        console.log(colors.red('please login first ~'));
    }
}