/*
 * @Author: your name
 * @Date: 2020-02-05 13:48:49
 * @LastEditTime : 2020-02-06 15:04:09
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/extend/helper.js
 */

module.exports = {
    JsonFormat (errcode=0, errmsg='err-ok', data={}) {
        return {errcode: errcode, errmsg: errmsg, data:data};
    },

    JsonFormat_ok (data={}) {
        return this.JsonFormat(0, 'err-ok', data);
    },

    JsonFormat_err (errcode, errmsg) {
        return this.JsonFormat(errcode, errmsg);
    },
    
}