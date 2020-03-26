/*
 * @Author: your name
 * @Date: 2020-03-24 13:06:04
 * @LastEditTime: 2020-03-26 10:09:29
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /egg-media/app/public/putsoon-admin/style/js/api.js
 */
/**
  扩展一个api模块
**/      
 
layui.define(['jquery','layer'],function(exports){ //提示：模块也可以依赖其它模块，如：layui.define('layer', callback);
   var requ_url = ''
   ,$ = layui.$
   ,layer = layui.layer;

   var user = layui.data('donkey').login_user;
   console.log('-----user-----',user)

   var api_obj = {
      requ_url:requ_url,
      //bucket
      del_media: function(params){
         console.log('----修改参数----',params)
         $.ajax({
            url:requ_url+"/api/v1/files" //请求的url地址
            ,dataType:"json" //返回格式为json
            ,data:params //参数值
            ,type:"delete" //请求方式
            ,headers:{Authorization:'Bearer '+user.access_token}
            ,success:function(res){
               //请求成功时处理
               console.log('-----success------',res)
               if(res.errcode==0){
                  layer.msg('删除成功');
                  return
               }
               layer.msg('删除失败');
            },
            error:function(err){
               //请求出错处理
               console.log('-----error------',err)
               layer.msg('删除失败');
            }
         });
      }
   };
  
   //输出test接口
   exports('api', api_obj);
}); 