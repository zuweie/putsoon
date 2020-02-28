/*
 * @Author: your name
 * @Date: 2020-02-27 08:17:41
 * @LastEditTime: 2020-02-28 17:33:58
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/backend-console/login.js
 */
const axios = require('axios');
const fs    = require('fs');
const colors = require('colors/safe');
const getport = require('./getport');
module.exports = async function (login='admin', password='123456') {
    
    try {
        let host = 'http://127.0.0.1';
        let port = getport();
        let response = await axios.post(host+':'+port+'/api/v1/backend/login2',{
            login: login,
            password: password
        });
        if (response.status == 200) {
            let fd = fs.openSync(__dirname+'/../.login-session.json','w+');
            let body = response.data;
            fs.writeSync(fd, JSON.stringify(response.data));
            console.log(colors.green('login success ~'));
        }else{
            console.log(colors.red(response.status));
        }

    }catch (e) {
        console.log(e);
    }
}