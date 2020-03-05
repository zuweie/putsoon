/*
 * @Author: your name
 * @Date: 2020-02-28 17:13:42
 * @LastEditTime: 2020-03-05 15:37:01
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/backend-console/getport.js
 */

 const fs = require('fs');

 module.exports = () => {
    //console.debug(__dirname);
    if (fs.existsSync(process.cwd()+'/.port')) {
        let port = fs.readFileSync(process.cwd()+'/.port');
        return port.toString('utf-8');
    }
    return false;
 }