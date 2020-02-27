/*
 * @Author: your name
 * @Date: 2020-02-27 11:38:57
 * @LastEditTime: 2020-02-27 11:53:15
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/backend-console/showbucket.js
 */

const fs = require('fs');
const colors = require('colors/safe');
const axios = require('axios');

module.exports = async function (host="http://127.0.0.1", port="7001") {
    if (fs.existsSync('./.login-session.json') ) {
        
        let info =  fs.readFileSync('./.login-session.json');
        let login_session = JSON.parse(info);
        let access_token = login_session.data.access_token;

        try {
            let result = await axios({
                method: 'get',
                url: host+':'+port+'/api/v1/bucket/show?page=1&perpage=100000000',
                headers: {
                    Authorization: 'Bearer '+access_token
                }
            });
            console.log(colors.green(result.data));
        }catch( e ) {
            console.log(colors.red(e));
        }

    }else {
        console.log(colors.red('please login first ~'));
    }
}