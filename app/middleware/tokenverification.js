/*
 * @Author: your name
 * @Date: 2020-02-07 22:53:24
 * @LastEditTime : 2020-02-08 10:54:49
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/middleware/verify_token.js
 */

 module.exports = async function tokenverification (ctx, next) {
        let token = ctx.request.query._token;
        let result = await ctx.service.token.verifyToken(token);
        if (result) {
           return next();
        }else{
            ctx.status = 401;
        }
    }
 