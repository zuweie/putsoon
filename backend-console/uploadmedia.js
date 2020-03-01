/*
 * @Author: your name
 * @Date: 2020-03-01 08:21:54
 * @LastEditTime: 2020-03-01 13:30:52
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/backend-console/uploadmeida.js
 */

'use strict'
const fs = require('fs');
const getport = require('./getport');
const colors = require('colors/safe');
const http = require('http');
const path = require('path');
const FileType = require('file-type');
module.exports = async function (bucket, ... upload_file) {
    if ( fs.existsSync (__dirname+'/../.login-session.json') ) { 

        let info =  fs.readFileSync(__dirname+'/../.login-session.json');
        let login_session = JSON.parse(info);
        let access_token = login_session.data.access_token;
        let host = "127.0.0.1";
        let port = getport();
        try {
            let res_chunk = '';
            let boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
            const req = http.request({
                hostname: host,
                port: port,
                path: '/api/v1/upload?bucket='+bucket,
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data; boundary='+boundary,
                    'Accept': 'application/json'
                }
            }, (res)=> {
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    res_chunk += chunk;
                });
                res.on('end', () => {
                    console.log(res_chunk);
                });
            });
            // upload file html 拼接。
            for (let f of upload_file) {
                if (f) {
                    let filename = path.basename(f);
                    let info = await FileType.fromFile(f);
                    req.write("--"+boundary+'\r\n')
                    req.write('Content-Disposition: form-data; name="upload"; filename="'+filename+'"\r\n');
                    if (info) {
                        req.write('Content-Type: '+info.mime+'\r\n');
                    }else {
                        req.write('Content-Type: application/octet-stream\r\n');
                    }
                    req.write('\r\n\r\n');
                    //req.write(Buffer.from(f));
                    let buffer = fs.readFileSync(f);
                    req.write(buffer);
                    req.write('\r\n');
                }
            }
            req.write('--'+boundary+'--\r\n');
            req.end();
        }catch (e) {
            console.log(e);
        }
        
    }else {
        console.log(colors.red('please login first ~'));
    }
}