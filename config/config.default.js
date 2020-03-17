/*
 * @Author: your name
 * @Date: 2020-02-01 13:54:38
 * @LastEditTime: 2020-03-17 13:24:53
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/config/config.default.js
 */
/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};
  //console.debug('config.default.js@appInfo', appInfo);
  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1580536447978_5276';

  // add your middleware config here
  config.middleware = [
    
  ];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };
  
  // swagger 
  config.swaggerdoc = {
    
    dirScanner: './app/controller',
    apiInfo: {
      title: 'egg-swagger',
      description: 'swagger-ui for egg',
      version: '1.0.0',
    },
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    enableSecurity: false,
    routerMap: false,
    enable: true,
  };

  config.passportJwt = {
    secret: 'qweRRTTREtiodfjl!@#$@#%22345',
  };

  config.multipart = {
    mode: 'file',
    fileExtensions: ['.pdf', '.docx'],
  };

  config.bucket = {
    root:appInfo.baseDir+'/media_source/',
    upload_guard : true
  };

  config.task = {
    try_limit : 10,
  }
  config.plugin = {
    prefix : 'donkey-plugin-',
  }

  config.token = {
    upload_token_expireIn: 3600,
    explose_token_expireIn: 30,
  }
  
  return {
    ...config,
    ...userConfig,
  };
};
