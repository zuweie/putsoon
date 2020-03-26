layui.use(['jquery','api'], function(){
   var api = layui.api
   ,$ = layui.$

   console.log('---------------sdfsdfsdfdsf-----------------',api)

   $(function(){
     Victor("container", "output");   //登录背景函数
     $("#entry_name").focus();
     $(document).keydown(function(event){
         if(event.keyCode==13){
             $("#entry_btn").click();
         }
     });
     
     $("#entry_btn").click(function(){
         let name = $('#entry_name').val();
         let pwd = $('#entry_password').val();
         func_login(name,pwd);
     })

     var func_login = function(name,pwd){
        console.log('name----',name);
        console.log('pwd-----',pwd);
        
         $.ajax({
            url:api.requ_url+'/api/v1/backend/login', //请求的url地址
            dataType:"json", //返回格式为json
            data:{"login":name,"password":pwd}, //参数值
            type:"post", //请求方式
            success:function(res){
               //请求成功时处理
               console.log('-----success------',res)
               if(res.errcode!=0){
                  alert('用户名或密码不正确')
                  return
               }
               let access_token = res.data.access_token
               console.log('-------access_token-------',access_token)
               let user = {
                  username:name,
                  access_token: res.data.access_token
               }
               layui.data('donkey', {key: 'login_user',value: user});

               //return
               location.replace("../../index.html")
               
            },error:function(err){
               //请求出错处理
               console.log('-----error------',err)
               alert('用户名或密码不正确')
            }
         });
     }
 });
});