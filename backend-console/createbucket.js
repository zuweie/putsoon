/*
 * @Author: your name
 * @Date: 2020-02-27 09:05:33
 * @LastEditTime: 2020-02-27 11:38:12
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/backend-console/createbucket.js
 */

const fs = require('fs');
const colors = require('colors/safe');
const axios = require('axios');

module.exports = async function (bucket, host="http://127.0.0.1", port="7001") {
    if (fs.existsSync('./.login-session.json')) {
        let info =  fs.readFileSync('./.login-session.json');
        let login_session = JSON.parse(info);
        let access_token = login_session.data.access_token;
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