/*
 * @Author: your name
 * @Date: 2020-02-27 11:39:03
 * @LastEditTime: 2020-02-28 17:44:07
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/backend-console/deletebucket.js
 */

const fs = require('fs');
const colors = require('colors/safe');
const axios = require('axios');
const getport = require('./getport');
module.exports = async function (bucket_id) {
    if (fs.existsSync(__dirname+'/../.login-session.json') ) {
        
        let info =  fs.readFileSync(__dirname+'/../.login-session.json');
        let login_session = JSON.parse(info);
        let access_token = login_session.data.access_token;
        let host = "http://127.0.0.1";
        let port = getport();
        
        try {
            let result = await axios({
                method: 'delete',
                url: host+':'+port+'/api/v1/bucket/delete',
                data:{
                    id: [bucket_id],
                },
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