/*
 * @Author: your name
 * @Date: 2020-02-06 09:32:50
 * @LastEditTime: 2020-03-27 14:04:36
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/service/bucket.js
 */
'use strict';
const fs = require('fs');
const path = require('path');
const sequelize = require('sequelize');
const Op = require('sequelize').Op;
const Service = require('egg').Service;
const Bucket  = require('../../database/sequelize_model')('bucket');
class BucketService extends Service {
    
    async createBucket (bucket, desc, user_id, is_private=0) {
        /**
         * make the bucket dir first
         */
        Bucket.upsert({bucket: bucket, description: desc, user_id: user_id, is_private: is_private},{returning:true});
        let _bucket = await this.getBucket(bucket);
        if (_bucket && this.syncBucketPath(_bucket)) {
            return {name: bucket, bucket_dir: this.fullBucketDir(_bucket)};
        }else {
            return false;
        }
    }

    async showBuckets (user_id, page, perpage) {
        let _count = await Bucket.findAll({
            attributes:[ [sequelize.fn('COUNT', sequelize.col('user_id')), 'count']],
            where:{user_id: user_id}
        });
        

        let _buckets = await Bucket.findAll({
            where:{user_id: user_id},
            limit: perpage,
            offset: (page - 1)*perpage,
        });

        return {buckets:_buckets,count: _count[0].get('count')};
    }

    async updateBucket(update_data,id, user_id ) {
      
        return await Bucket.update(update_data, {where:{
          user_id: user_id,
          id: id,
        }});
    }
    
    async deleteBuckets(ids, user_id) {
    // TODO : delete all the media has relate with this bucket
        let delete_count = 0;
        console.debug('bucket.js#deleteBuckets@ids', ids);
        for (let i=0; i<ids.length; ++i) {
            let b = await Bucket.findOne({where:{
                [Op.or]: [{id: ids[i]}, {bucket: ids[i]}]
            }});
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
    
                let b_path = this.fullBucketDir(b);
                try{
                    //rmdirRecursiveSync(b_path);
                    fs.rmdirSync(b_path, {maxRetries:5, recursive:true});
                    if (!fs.existsSync(b_path)) {
                        delete_count++;
                        Bucket.destroy({where:{
                            id:b.id,
                            user_id: user_id,
                        }});
                    }
                }catch(e) {
                    console.log('bucket.js#deleteBuckets@e', e);
                }
            }
        }

        return delete_count;
    }

    async getBucket(b) {
        return await Bucket.findOne({where:{
            bucket: b
        }});
    }

    syncBucketPath (b) {

        let b_path = this.fullBucketDir(b);

        if (!fs.existsSync(b_path)){
            try{
                fs.mkdirSync(b_path+'/cache/', {recursive:true});
            }catch(e) {
                console.debug('bucket.js#syncBucketPath@e',e);
            }
        }
        
        return fs.existsSync(b_path);
    }

    async syncBucketFile (_bucket) {

        let b_path = this.fullBucketDir(_bucket);
        
        let files = fs.readdirSync(b_path,{withFileTypes:true});
        // TODO: remove the file belong to the bucket 
        let medias = await this.service.media.getAllUploadMedia(_bucket.bucket);
        let bucketfiles = new Set();
        for ( let m of medias) {
            let basename = path.basename(m.path);
            bucketfiles.add(basename);
        }
        console.debug('bucket.js#syncBucketFile@bucketfiles', bucketfiles);
        
        for(let i=0; i<files.length; ++i) {
            let file = files[i];
            if (file.isFile() && !bucketfiles.has(file.name)) {
                let file_path = b_path+file.name;
                console.debug('bucket.js#syncBucketFile@file_path', file_path);
                await this.service.media.syncMediafile(file_path, _bucket);
            }
        }
    }


    fullBucketDir (b) {
        let env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
        let b_path = this.config.bucket.root+b.bucket+'-'+env+'/';
        return b_path;
    }
}

module.exports = BucketService;