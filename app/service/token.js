/*
 * @Author: your name
 * @Date: 2020-02-06 13:50:44
 * @LastEditTime : 2020-02-08 11:40:26
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/service/media.js
 */
'use strict';
const md5 = require('md5');
const Op = require('sequelize').Op;
const Service = require('egg').Service;
const uniqueString = require('unique-string');

const Token = require('../../database/sequelize_model')('token');

class TokenService extends Service {

    genUploadToken (user_id) {

        let ak = uniqueString();
        let sk = uniqueString();
        let data = {
            name: 'uploadtoken',
            user_id: user_id,
            ak: ak,
            sk: sk,
            expireIn: 3600,
        }

        Token.upsert(data, {where:{
            user_id:user_id,
            name:'uploadtoken',
        }});

        return {ak, sk};
    }

    updateSk (user_id) {
        let sk = uniqueString();
        return Token.update({sk:sk}, {where:{
            user_id: user_id,
            name: 'uploadtoken'
        }});
    }

    getUploadToken (user_id) {

        return Token.findAll({where:{
            user_id: user_id,
            name: 'uploadtoken',
        }});
    }

    deleteUploadToken(user_id, ids) {
        return Token.destroy({where:{
            id: {
                [Op.in]: ids
            },
            user_id: user_id
        }});
    }

    async verifyToken(token) {
        let explode = this.explodeToken(token);
        if (explode) {
            let {ak, sk_hash, timestamp} = explode;
            let _token = await Token.findOne({where:{
                ak: ak
            }});
            if (_token) {
                if (sk_hash == md5(timestamp +'$$'+_token.sk)) {
                    let difftime =  Math.round((Date.now() - timestamp)/1000);
                    //console.log('difftime', difftime);
                    //console.log('expireIn', _token.expireIn);
                    return difftime < _token.expireIn;
                }
            }
            return false;
        }
    }

    explodeToken(token) {
        let decode = Buffer.from(token,'base64').toString();
        let exp = decode.split('$$');
        if (exp.length == 0) return false;
        return {ak:exp[0], sk_hash:exp[1], timestamp:exp[2], bucket: exp[3]};
    }

    implodeToken(ak,sk,bucket) {
        let timestamp = Date.now();
        let encode = md5(''+timestamp + '$$' + sk);
        let token = ak+'$$'+encode+'$$'+timestamp+'$$'+bucket;
        return Buffer.from(token).toString('base64');
    }
}

module.exports = TokenService;