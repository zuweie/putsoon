/*
 * @Author: your name
 * @Date: 2020-03-07 15:33:05
 * @LastEditTime: 2020-03-07 15:36:55
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/contract/download_url.js
 */
'use strict';
module.exports = {
    download_url: {
        url: {type:'string', required:true, description:'download url', example:'http://59.110.224.162/e/90d6e07ed515ea6ba6c7957116d6b1a5'},
        headers: {type:'req_header', required:false, description:'url headers'},
    }
}