/*
 * @Author: your name
 * @Date: 2020-03-11 13:48:22
 * @LastEditTime: 2020-03-13 13:13:46
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/service/task_executors/donwload-executor.js
 */

 'use strict'
 const fs = require('fs');
 const md5 = require('md5');
 const md5File = require('md5-file/promise');
 const FileType = require('file-type');
 class DownloadExecutor {
     constructor(_task, _ctx) {
         this._task = _task;
         this._ctx  = _ctx;
     }

     async exec () {
        let params = this._task._params;
        let download_url = this._task.src;
        console.debug('download-executor.js#exec@params', params);
        console.debug('download-executor.js#exec@download_url', download_url);
        let _bucket = await this._ctx.service.bucket.getBucket(params.bucket);
        
        if (_bucket && download_url) {

            let cxt_this = this;

            let download = new Promise( async (resolve, reject) => {
                
                let dest_dir = cxt_this._ctx.service.task.mkTmpDir();
                let tmp_file = dest_dir+'/download-'+Date.now()+'.tmp';    
                let ws = fs.createWriteStream(tmp_file, {flags: 'w+'});
    
                let url = new URL(download_url);
                let req_client = null;
                if (url.protocol == 'http:') {
                    // use http
                    req_client = require('http');
                }else if (url.protocol == 'https:') {
                    // use https
                    req_client = require('https');
                }

                if (req_client) {

    
                    let headers = params.headers? params.headers: {};
                    req_client.get(download_url,{
                        headers: headers
                    }, (res)=>{
                        if (res.statusCode != 200) {
                            throw res.body;
                        }

                        console.debug('download-executor.js#get@header', res.headers['content-length']);

                        let total_size = res.headers['content-length']?parseInt(res.headers['content-length']):0;
                        let download_size = 0;
                        res.on('data', chunk => {
                            //console.debug('download-executor.js#on_data@chunk', chunk);
                            //console.debug('download-executor.js#on_data@chunk.length', chunk.length);
                            if (total_size) {
                                download_size += chunk.length 
                                let percent = Math.round((download_size / total_size) * 100);
                                console.debug('download-executor.js#on_data@download-percent', percent);
                                this._ctx.service.task.setTaskPercent(this._task.key, percent);
                            }
                            ws.write(chunk);
                        });
                        res.on('end', ()=> {
                            console.debug('download-executor.js#on_end@end');
                            ws.close();
                            resolve(tmp_file);
                        });
                        res.on('error', (err) => {
                            reject(err);
                        });
                        /*
                        ws.on('finish', ()=>{
                            ws.close();
                            // 搞掂了就把文件的路径返回。
                            resolve(tmp_file);
                        });

                        ws.on('error', (err)=>{
                            reject (err);
                        })

                        // 把内容写入临时文件。
                        res.pipe(ws);
                        */
                    });
    
                }else {
                    throw 'unknow protocol';
                }
            });

            // start downloading
            let donwload_file = await download;
            
            // after finish. create the media record.
            let file_url = download_url;
            let file_info = await FileType.fromFile(donwload_file);
            let extname = file_info ? '.' + file_info.ext : '';
            let mime = file_info ? file_info.mime : 'application/octet-stream';
            let file_hash = await md5File(donwload_file);
            let signature = md5(file_url + file_hash);
            let dest = this._ctx.service.bucket.fullBucketDir(_bucket) + signature + extname;
            fs.renameSync(donwload_file, dest);

            let insert = {};
            insert.firstname = file_url;
            insert.firstname_hash = md5(file_url);
            insert.ext = extname;
            insert.query_params = '';
            insert.signature = signature;
            insert.bucket = _bucket.bucket;
            insert.file_hash = file_hash;
            insert.mime = mime;
            insert.path = dest;

            await this._ctx.service.media.insertMedia(insert);
            //await this._ctx.service.task.updateTaskDest(this._task.key, signature);
            
            return signature;
           
            //let _h = require('donkey-plugin-'+this._task.handler)();
            
        }else if (!download_url || download_url == '') {
            throw 'miss download url';
        }else if (!_bucket) {
            throw 'bucket not exists';
        }
     }
 }

 module.exports = DownloadExecutor;