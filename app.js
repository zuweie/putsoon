/*
 * @Author: your name
 * @Date: 2020-02-05 10:28:31
 * @LastEditTime : 2020-02-05 11:21:16
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app.js
 */
module.exports = app => {
    app.passport.verify(async (ctx, user) => {
        ctx.payload = user.payload;
        return user.payload;
    });
}