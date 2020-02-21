/*
 * @Author: your name
 * @Date: 2020-02-06 09:32:50
 * @LastEditTime: 2020-02-22 00:46:50
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/service/bucket.js
 */
'use strict';
const fs = require('fs');
const fx = require('mkdir-recursive');
const rmdirRecursiveSync = require('rmdir-recursive').sync;
const path = require('path');
const Op = require('sequelize').Op;
const Service = require('egg').Service;
const Bucket    = require('../../database/sequelize_model')('bucket');

class BucketService extends Service {
    
    async createBucket (bucket, desc, user_id, is_private=0) {
        /**
         * make the bucket dir first
         */
        Bucket.upsert({bucket: bucket, description: desc, user_id: user_id, is_private: is_private},{returning:true});
        let _bucket = await this.getBucket(bucket);
        if (_bucket) {
            return this.syncBucketPath(_bucket);
        }else {
            return false;
        }
    }

    showBuckets (user_id, page, perpage) {
        return Bucket.findAll({
            where:{user_id: user_id},
            limit: perpage,
            offset: (page - 1)*perpage,
        });
    }

    updateBucket(update_data,id, user_id ) {
      
        return Bucket.update(update_data, {where:{
          user_id: user_id,
          id: id,
        }});
    }
    
    async deleteBuckets(ids, user_id) {
    // TODO : delete all the media has relate with this bucket
        let delete_count = 0;
        console.debug('bucket.js#deleteBuckets@ids', ids);
        for (let i=0; i<ids.length; ++i) {
            let b = await Bucket.findByPk(ids[i]);
            console.debug('bucket.js#deleteBucket@b', b);
            // TODO delete all the media first
            if (b) {
                let ms = await this.service.media.getAllUploadMedia(b.bucket);
                let media_ids = [];
                for (let i=0; i<ms.length; ++i) {
                    media_ids.push(ms[i].id);
                }
                console.debug('bucket.js#deleteBuckets@media_ids', media_ids)
                await this.service.media.delUploadMedia(media_ids, user_id);
    
                let b_path = this.fullBucketPath(b);
                try{
                    rmdirRecursiveSync(b_path);
                    if (!fs.existsSync(b_path)) {
                        delete_count++;
                        Bucket.destroy({where:{
                            id:ids[i],
                            user_id: user_id,
                        }});
                    }
                }catch(e) {
                    console.log(e);
                }
            }
        }

        return delete_count;
    }

    getBucket(b) {
        return Bucket.findOne({where:{
            bucket: b
        }});
    }

    syncBucketPath (b) {

        let b_path = this.config.bucket.root+b.bucket;

        if (!fs.existsSync(b_path)){
            try{
                fs.mkdirSync(b_path+'/cache/', {recursive:true});
            }catch(e) {
                console.log(e);
            }
        }
        
        return fs.existsSync(b_path);
    }

    fullBucketPath (b) {
        let b_path = this.config.bucket.root+b.bucket+'/';
        return b_path;
    }
}

module.exports = BucketService;