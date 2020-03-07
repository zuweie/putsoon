/*
 * @Author: your name
 * @Date: 2020-03-07 15:14:21
 * @LastEditTime: 2020-03-07 15:50:10
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/contract/download_media.js
 */
'use strict';
//let req_header = require('./req_header');
module.exports = {
    download_media: {
      targets: {type:'array', required:true, description:'url', itemType:'download_url'},
    },
  };