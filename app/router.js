/*
 * @Author: your name
 * @Date: 2020-02-01 13:54:38
 * @LastEditTime : 2020-02-11 10:47:44
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/router.js
 */
'use strict';

/**
 * @param {Egg.Application} app - egg application
 */



module.exports = app => {
  
  /**
   * middleware of url
   */
  const jwt = app.passport.authenticate('jwt', {session:false, successReturnToOrRedirect:null});
  const vtoken = app.middleware.tokenverification;
  
  const { router, controller } = app;
  //router.get('/:signature', controller.media.export_file);
  router.post('/api/v1/backend/login', controller.backend.login);
  router.post('/api/v1/bucket/create', jwt, controller.bucket.create_bucket);
  router.put('/api/v1/bucket/update', jwt, controller.bucket.update_bucket);
  router.get('/api/v1/bucket/show', jwt, controller.bucket.show_buckets);
  router.del('/api/v1/bucket/delete', jwt, controller.bucket.del_buckets);

  router.post('/api/v1/token/upload', jwt, controller.token.gen_upload_token);
  router.get('/api/v1/token/upload', jwt, controller.token.get_upload_token);
  router.del('/api/v1/token/upload', jwt, controller.token.delete_upload_token);
  router.post('/api/v1/token/upload/verify', controller.token.verify_upload_token);
  router.post('/api/v1/token/upload/combine', controller.token.combine_upload_token);

  router.post('/api/v1/upload', vtoken, controller.media.upload);
  router.get('/api/v1/files', jwt, controller.media.show_files);
  router.del('/api/v1/files', jwt, controller.media.delete_files);

  //router.get('/s/:signature/:p0/:p1/:p2/:p3', controller.media.export_file);
  router.get(/^\/\e\/([\w-.]+[\/]?)/, controller.media.export_file);
};
