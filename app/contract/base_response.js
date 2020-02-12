/*
 * @Author: your name
 * @Date: 2020-02-03 12:18:20
 * @LastEditTime : 2020-02-03 12:37:45
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/contract/base_response.js
 */
'use strict';

module.exports = {
  base_response: {
    result: { type: 'boolean', required: true },
    message: { type: 'string' },
  },
};