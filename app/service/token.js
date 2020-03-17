/*
 * @Author: your name
 * @Date: 2020-02-06 13:50:44
 * @LastEditTime: 2020-03-17 12:23:18
 * @LastEditors: Please set LastEditors
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

    async genToken (user_id, name, expireIn) {

        let ak = uniqueString();
        let sk = uniqueString();
        let data = {
            name: name,
            user_id: user_id,
            ak: ak,
            sk: sk,
            expireIn: expireIn
        }

        await Token.upsert(data, {where:{
            user_id:user_id,
            name: name,
        }});

        return {ak, sk};
    }

    /*
    async genExposeToken (user_id) {
        let ak = uniqueString();
        let sk = uniqueString();
        let data = {
            name: 'exposetoken',
            user_id: user_id,
            ak: ak,
            sk: sk,
            expireIn: this.app.config.token.expose_token_expireIn,
        }

        await Token.upsert (data, {where: {
            user_id: user_id,
            name:'exposetoken',
        }});
        return {ak, sk};
    }
    */

    async updateSk (user_id, ak, token_name) {
        let sk = uniqueString();
        return await Token.update({sk:sk}, {where:{
            user_id: user_id,
            ak: ak,
            name: token_name,
        }});
    }

    async getToken (user_id, token_name) {

        return token_name? await Token.findAll({where:{
            user_id: user_id,
            name: token_name,
        }}) : await Token.findAll({where:{
            user_id: user_id,
        }});
    }

    deleteToken(user_id, ids) {
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
                if (sk_hash == md5(timestamp +'&&'+_token.sk)) {
                    let difftime =  Math.round((Date.now() - timestamp)/1000);
                    return difftime < _token.expireIn;
                }
            }
            return false;
        }
    }

    explodeToken(token) {
        let decode = Buffer.from(token,'base64').toString();
        let exp = decode.split('&&');
        if (exp.length == 0) return false;
        
        let res = {};
        res.ak = exp[0];
        res.sk_hash = exp[1];
        res.timestamp = exp[2];
        res.payload = exp.slice(3, exp.length);
        return res;
    }

    implodeToken(ak,sk, ... elements) {
        let timestamp = Date.now();
        let encode = md5(''+timestamp + '&&' + sk);
        let token = ak+'&&'+encode+'&&'+timestamp;
        for (let e of elements) {
            token += '&&' + e;
        }
        return Buffer.from(token).toString('base64');
    }
}

module.exports = TokenService;