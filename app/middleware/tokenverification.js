/*
 * @Author: your name
 * @Date: 2020-02-07 22:53:24
 * @LastEditTime: 2020-03-24 14:52:44
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/middleware/verify_token.js
 */

module.exports = async function tokenverification(ctx, next) {
    if (ctx.app.config.bucket.upload_guard) {
        let token = ctx.request.body._token;
        let result = token? await ctx.service.token.verifyToken(token) : null;
        if (result) {
            return next();
        } else {
            ctx.status = 401;
        }
    }else{
        return next();
    }
}
 
