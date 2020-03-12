/*
 * @Author: your name
 * @Date: 2020-03-01 08:21:54
 * @LastEditTime: 2020-03-11 13:46:31
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

let postFile =  (req, f, boundary) => {

    return new Promise(async (resolve, reject) => {

        // 构建 mulitpart-form 的 body。
        console.debug('uploadmedia.js#postfile@f', f);
        let filename = path.basename(f);
        let info = await FileType.fromFile(f);
        req.write("--" + boundary + '\r\n')
        req.write('Content-Disposition: form-data; name="upload"; filename="' + filename + '"\r\n');
        if (info) {
            req.write('Content-Type: ' + info.mime + '\r\n');
        } else {
            req.write('Content-Type: application/octet-stream\r\n');
        }


        /**
         * mulitpart-formdata 的文件构造是如下的
         * --${boundary}(\r\n)
         * Content-Disposition: form-data; name="upload"; filename="xxxx"; [...其他属性](\r\n)
         * xxxxxx:xxxxxxxxx(\r\n)
         * xxxxxx:xxxxxxxxx(\r\n)
         * (\r\n)
         * ${file,一大坨 data}(\r\n)
         *  下一个
         *  --${boundary}(\r\n)
         *   .
         *   .
         *   .(\r\n)
         * 完了输出以下。
         * --${boundary}--(\r\n)
         */

        /**
         * 这里有个大大大大的隐藏的bug,这里对上上一个行只能隔开两个<\r\n(***2个***)>。多了就会把\r\n当成body写过去了。切记切记。
         * 
         * req.write('\r\n\r\n');
         */

        /** 这个是正确的写法。操操操操操调试了一上午。fuckfuckfuckfuck～～～ */
        req.write('\r\n');
        

        /* 1
        let freadable = fs.createReadStream(f);
        let chunk = null;
        
        freadable.on('end', () => {
            req.write('\r\n');
            //console.debug('uploadmedia.js#end');
            resolve(true);
        });

        freadable.on('error', (err)=> {
            reject(err);
        });

        freadable.on('readable', () => {
            while((chunk = freadable.read()) != null) {
                console.debug('uploadmedia#read@chunk', chunk);
                //writeable.write(chunk,);
                req.write(chunk);
            }
        });
        */
        
        /* 2
       req.write(fs.readFileSync(f), 'ascii');
       req.write('\r\n');
       resolve(true);
       */

       let freadable = fs.createReadStream(f);
       freadable.on('end', ()=>{
           req.write('\r\n', {end:false});
           resolve(true);
       });
       freadable.on('error', (err) => {
           reject(err);
       })
       
       freadable.pipe(req, {end: false});
       
    });
}
module.exports = async function (bucket, ... upload_file) {
    if ( fs.existsSync (process.cwd()+'/.login-session.json') ) { 

        let info =  fs.readFileSync(process.cwd()+'/.login-session.json');
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
                if (f && fs.existsSync(f)) {
                    
                    await postFile(req, f, boundary);
                    /*
                    console.debug('uploadmedia.js@f', f);
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
                    //let buffer = fs.readFileSync(f);
                    //req.write(buffer);
                    //req.write('\r\n');

                    // start write the file to server
                    
                    let freadable = fs.createReadStream(f);

                    freadable.on('data', chunk => {
                        req.write(chunk);
                    });
                    freadable.on('finish', () => {
                        req.write('\r\n');
                    });
                    freadable.read();
                    */
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