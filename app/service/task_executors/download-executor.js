/*
 * @Author: your name
 * @Date: 2020-03-11 13:48:22
 * @LastEditTime: 2020-04-18 12:26:00
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/service/task_executors/donwload-executor.js
 */

 'use strict'
 const fs = require('fs');
 const md5 = require('md5');
 const md5File = require('md5-file/promise');
 const FileType = require('file-type');
 const Mime = require('mime-types');
 const path = require('path');
 
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
            let downloader = null;
            let dest_dir = this._ctx.service.task.mkTmpDir();
            
            if (this._task.handler != '') {
                // handler downloader
                downloader = require(this._ctx.app.plugin.prefix + handler)(download_url, dest_dir, this._task._params, this._ctx, this._task);
            }else {

                // default downloader
                let cxt_this = this;
                downloader = new Promise( async (resolve, reject) => {
                    
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
                            if (res.statusCode >= 400) {
                                console.debug('download-executor.js#status !== 200@statusCode', res.statusCode);
                                let body = res.body;
                                res.resume();
                                reject(body);
                            }
    
                            console.debug('download-executor.js#get@header', res.headers['content-length']);
    
                            let total_size = res.headers['content-length']?parseInt(res.headers['content-length']):0;
                            let download_size = 0;
                            res.on('data', chunk => {
                                console.debug('download-executor.js#on_data@chunk.length', chunk.length);
                                console.debug('donwload-executor.js#on_data@total_size', total_size);
                                download_size += chunk.length;
                                if (typeof total_size == 'number' && total_size > 0) {
                                    let percent = Math.round((download_size / total_size) * 100);
                                    console.debug('download-executor.js#on_data@download-percent', percent);
                                    this._ctx.service.task.setTaskPercent(this._task.key, percent);
                                }else {
                                    this._ctx.service.task.setTaskPercent(this._task.key, download_size);
                                }
                                ws.write(chunk);
                            });
                            res.on('end', ()=> {
                                console.debug('download-executor.js#on_end');
                                ws.end();
                            });
                            ws.on('finish', ()=>{
                                resolve(tmp_file);
                            });
                        }).on('error', e => {
                            console.debug('download-executor#get@e', e);
                            reject(e.message);
                        });
        
                    }else {
                        throw 'unknow protocol';
                    }
                });
            }

            // start downloading
            try {
                let download_res = '';
                if (this._task.handler != '') {
                    download_res = await downloader.exec();
                }else {
                    download_res = await downloader;
                }

                // after finish. create the media record.
                let download_files = [];
                if (typeof download_res == 'string') {
                    download_files.push(download_res);
                } else if (Array.isArray(download_file)) {
                    download_files = download_res;
                }

                let signatures = [];
                for (let download_file of download_files) {
                    let url = new URL(download_url);
                    let extname = path.extname(url.pathname);
                    let firstname = path.basename(url.pathname, extname);
                    let mime = ''
                    if (extname == '') {
                        let file_info = await FileType.fromFile(download_file);
                        extname = file_info ? '.' + file_info.ext : '';
                        mime = file_info ? file_info.mime: 'application/octet-stream';
                    }else{
                        mime = Mime.contentType(path.basename(url.pathname));
                    }
                    //let mime = file_info ? file_info.mime : 'application/octet-stream';
                    let file_hash = await md5File(download_file);
                    let signature = md5(firstname + file_hash);
                    let dest = this._ctx.service.bucket.fullBucketDir(_bucket) + signature + extname;
                    fs.renameSync(download_file, dest);
    
                    let insert = {};
                    insert.firstname = firstname;
                    insert.firstname_hash = md5(firstname);
                    insert.ext = extname;
                    insert.query_params = '';
                    insert.signature = signature;
                    insert.bucket = _bucket.bucket;
                    insert.file_hash = file_hash;
                    insert.mime = mime;
                    insert.path = dest;
    
                    await this._ctx.service.media.insertMedia(insert);
                    //await this._ctx.service.task.updateTaskDest(this._task.key, signature);
    
                    signatures.push(signature);
                }
                fs.rmdirSync(dest_dir, {maxRetries:5, recursive:true})
                return signatures;
            }catch (e) {
                console.debug('download-executor.js#download@e', e);
                throw e;
            }
                        
        }else if (!download_url || download_url == '') {
            throw 'miss download url';
        }else if (!_bucket) {
            throw 'bucket not exists';
        }
     }
 }

 module.exports = DownloadExecutor;