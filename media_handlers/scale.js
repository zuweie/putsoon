/*
 * @Author: your name
 * @Date: 2020-02-11 16:22:36
 * @LastEditTime : 2020-02-12 12:14:11
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings editer
 * @FilePath: /egg-media/media_handlers/scale.js
 */
const fs = require('fs');
const path = require('path');
const md5 = require('md5');
class Scalehandler {

    constructor(_media, args) {
        this.media = _media;
        this.params = args;
        //console.debug('constructor', args); 
    }

    exec() {
        // 1 检查是否有做过的缓存文件，有就直接返回ok。
        // 2 没有就做处理，然后保存文件，然后返回ok。
        let cache_file = this.export_file_path();
        if (!fs.existsSync(cache_file)) {
            console.log('scalehandler doing job ...');
            // do the exec job here
            
            

            // save processed file
            fs.copyFileSync(this.media.path, cache_file);
            return fs.existsSync(cache_file);
        }
        return true;
    }

    export_file_path() {
        let cache_dir = this.cache_dir();
        let base_name = this.base_name();
        return cache_dir+base_name;
    }

    cache_dir () {
        return path.dirname(this.media.path)+'/cache/';
    }
    
    base_name () {
        //console.debug('base_name:this.params', this.params);
        let _name = this.media.firstname+'/'+this.handler_name();
        for(let i=0; i<this.params.length; ++i) {
            _name += '/'+this.params[i];
        }
        _name = md5(_name)+this.media.ext;
        return _name;
    }
    
    handler_name () {
        return 'scale';
    }
}

module.exports = (_media, args) =>{
    return new Scalehandler(_media, args);
}
