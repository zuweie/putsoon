layui.use([
  'jquery', 
  'element',
  'layer',
  'table',
  'form',
  'upload',
  'api'
  ], function(){
  var table = layui.table
  ,layer = layui.layer
  ,$ = layui.$
  ,upload = layui.upload
  ,api = layui.api
  ,u_bucket = ''
  ,form = layui.form
  ,user = null
  ,bucket_name = null
  ,requ_params = null;

  var bucketlist = [];
  var upload_token = '';
  var bucket_curr = '';

  user = layui.data('donkey').login_user;
  console.log('-----user-----',user)

  //存在在bucket页面传bucket name 过来
  bucket_name = UrlParam.paramValues("bucket_name");
  
  console.log('-------bucket_name--------',bucket_name);
  if(bucket_name!=null && bucket_name!=undefined){
    requ_params = {bucket:bucket_name[0],'end':''}
    bucket_curr = bucket_name[0];
  }else{
    requ_params = {'end':''}
  }
  
  
  // 获取bucketlist
  $.ajax({
    url:"/api/v1/bucket/show",
    method:"GET",
    headers:{Authorization:'Bearer '+user.access_token},
    data:{page:'1', perpage:'1000000'},
    success:function (res){
      bucketlist = res.data.buckets;
    },
    error: function (res) {
      //console.debug(res);
      alert('get bucket list err');
    },
  });

  console.debug(requ_params);
  table.render({
    elem: '#media'
    ,url:api.requ_url+'/api/v1/files'
    ,headers:{Authorization:'Bearer '+user.access_token}
    ,where:requ_params
    ,toolbar: '#toolbarDemo' //开启头部工具栏，并为其绑定左侧模板
    ,defaultToolbar: ['filter', 'exports', 'print', { //自定义头部工具栏右侧图标。如无需自定义，去除该参数即可
      title: '提示'
      ,layEvent: 'LAYTABLE_TIPS'
      ,icon: 'layui-icon-tips'
    }]
    ,title: 'Bucket'
    ,cellMinWidth: 80
    ,cols: [[
      {type: 'checkbox', fixed: 'left'}
      //,{field:'id', title:'ID', fixed: 'left', unresize: true, sort: true}
      
      ,{field:'path', title:'path',width:80,      
        templet: function(d){


          var pic_html = '<div οnclick="show_img(this)" ><img src="/e/'+d.signature+'"></div>';;
          if (d.is_private) {
            $.ajax({
              url:'/api/v1/valid/token',
              method:'GET',
              headers:{Authorization:'Bearer '+user.access_token},
              data:{name:'expose_token'},
              dataType:"json",
              async: false,
              success:function (res) {
                pic_html =  '<div οnclick="show_img(this)" ><img src="/e/'+d.signature+'?_token='+res.data+'" alt="" width="50px" height="50px"></div>';
              },
              error: function (res) {
                alert('net err');
                console.debug('get expose token err', res);
              }
            });
          }
          console.debug('path_html', pic_html);
          return pic_html;
        }}
      //,{field:'firstname', title:'firstname'}
      //,{field:'ext', title:'ext'}
      //,{field:'query_params', title:'query_params', edit: 'text'}
      ,{field:'firstname', title:'filename', templet: function (d) {
        return d.firstname+d.ext;
      }}
      ,{field:'signature', title:'signature',width:280}
      //,{field:'file_hash', title:'file_hash'}
      ,{field:'mime', title:'mime',width:110}
      //,{field:'status', title:'status'}
      ,{field:'bucket', title:'bucket'}
      //,{field:'updatedAt', title:'updatedAt'}
      ,{fixed: 'right', title:'操作', toolbar: '#barDemo',width:130}
    ]]
    ,parseData: function(res){ //res 即为原始返回的数据
      console.debug('parseData', res);
      return {
        "code": res.errcode, //解析接口状态
        "msg": res.errmsg, //解析提示文本
        "count": res.data.count, //解析数据长度
        "data": res.data.medias //解析数据列表
      };
    }
    ,request:{
      limitName: 'perpage',
    }
    ,page: true
    ,id: 'tb_media'
  });

  //头工具栏事件
  table.on('toolbar(test)', function(obj){
    var checkStatus = table.checkStatus(obj.config.id);
    switch(obj.event){
      case 'getCheckData':
        var data = checkStatus.data;
        layer.alert(JSON.stringify(data));
      break;
      case 'getCheckLength':
        var data = checkStatus.data;
        layer.msg('选中了：'+ data.length + ' 个');
      break;
      case 'isAll':
        layer.msg(checkStatus.isAll ? '全选': '未全选');
      break;
      
      //自定义头工具栏右侧图标 - 提示
      case 'LAYTABLE_TIPS':
        layer.alert('这是工具栏右侧自定义的一个图标按钮');
      break;
    };
  });
  
  //监听行工具事件
  table.on('tool(test)', function(obj){
    var data = obj.data;
    console.log(obj)

    if(obj.event === 'detail'){
      //layer.msg('ID：'+ data.id + ' 的查看操作');
      var detail_html = '<h4 style="text-align:center">original </h4>'
      detail_html += '<div style="text-align:center"><img src="/e/' + data.signature + '" /></div><br>';
      detail_html += '<h4 style="text-align:center">/slim/0.5</h4>'
      detail_html += '<div style="text-align:center"><img src="/e/'+data.signature+'/ps/slim/0.5"></div><br>';
      detail_html += '<h4 style="text-align:center">/resize/100 * 100</h4>'
      detail_html += '<div style="text-align:center"><img src="/e/'+data.signature+'/ps/resize/100/100"></div><br>';
      detail_html += '<h4 style="text-align:center">/resize/100 * 200</h4>'
      detail_html += '<div style="text-align:center"><img src="/e/'+data.signature+'/ps/resize/100/200"></div><br>';

      if (data.is_private) {
        $.ajax({
          url:'/api/v1/valid/token',
          method:'GET',
          headers:{Authorization:'Bearer '+user.access_token},
          data:{name:'expose_token'},
          dataType:"json",
          async: false,
          success:function (res) {
            detail_html =  '<div οnclick="show_img(this)" ><img src="/e/'+data.signature+'?_token='+res.data+'"></div>';
          },
          error: function (res) {
            alert('net err');
            console.debug('get expose token err', res);
          }
        });
      }
      

      let pic = layer.open({
        type: 1
        ,skin: 'layui-layer-rim' //加上边框
        ,area: ['80%', '80%'] //宽高
        ,shade: 0.5
        ,maxmin: true
        ,shadeClose: true //开启遮罩关闭
        ,end: function (index, layero) {
            return false;
        }
        ,content: detail_html
      });
      layer.full(pic);
    } else if(obj.event === 'del'){
      layer.confirm('真的删除行么', function(index){
        obj.del();
        layer.close(index);
        del_media({id:[data.id]})
      });
    } else if(obj.event === 'edit'){
      
    }
  });

  var del_media = function(params){
    console.log('----修改参数----',params)
    $.ajax({
      url:api.requ_url+"/api/v1/files" //请求的url地址
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

  var btnAddClick = function(){
    $('#btnAdd').click(function(){
      $('#Preview_pic').empty()

      var options = '';
      bucketlist.forEach(function (b) {
        if (bucket_curr != '' && b.bucket == bucket_curr) {
          options += '<option value="'+b.bucket+'" selected=selected>'+b.bucket+'</option>';
        }else{
          options += '<option value="'+b.bucket+'">'+b.bucket+'</option>';
        }
      });
      $('#form_bucket_name').html(options);
      //upload_form.render();

      /** select 选项动态添加后，需要重新渲染才能吧选项展示出来 **/
      form.render('select');

      /** 打开upload 面板的时候 产生 upload token */
      let index = layer.open({
        type: 1 //此处以iframe举例
        ,title: '添加'
        ,anim:1 //从上掉落
        ,content: $('#update_form')
        ,zIndex: layer.zIndex //重点1
        ,success: function(layero){
          layer.setTop(layero); //重点2
        }
      });
      layer.full(index);
    })
  }
  btnAddClick()

  //上传
  upload.render({
    elem: '#test10'
    ,url: api.requ_url+'/api/v1/upload/'
    ,method:'post'
    ,headers:{Authorization:'Bearer '+user.access_token}
    ,data:''
    ,field:'upload'
    ,multiple: true
    ,dataType:"json"
    ,auto: false //选择文件后不自动上传
    ,bindAction: '#btn_commit' //指向一个按钮触发上传
    ,accept: 'file'
    ,before:function(obj){
      let name = $('#form_bucket_name').val();
      let data = {};
      data.bucket = name;

      $.ajax({
        type: 'GET',
        url: '/api/v1/valid/token',
        data: {name:'upload_token', payload:name},
        headers: {Authorization:'Bearer '+user.access_token},
        dataType:"json",
        async: false,
        success: function (res) {
          console.debug('upload_token', res);
          //ctx_this.data = {bucket:name, _token:res.data};
          data._token = res.data;
        },
        error: function (res) {
          //alert('net err try later!');
          console.debug(res);
        }
      });
      
      
      console.log('--------bucket name---------',name)
      this.data=data;
      
    }
    ,choose: function(obj){
      console.log('---- choose obj----',obj)

      //将每次选择的文件追加到文件队列
      var files = obj.pushFile();
      console.log('---- choose files----',files)
  
      //预读本地文件，如果是多文件，则会遍历。(不支持ie8/9)
      obj.preview(function(index, file, result){
        console.log(index); //得到文件索引
        console.log(file); //得到文件对象
      
        $('#Preview_pic').append('<img style="width:200px;height:200px;margin:0px 7px 7px 0px;" src="'+ result +'" alt="'+ file.name +'" class="layui-upload-img">')
        
      });
    }
    ,done: function(res){
      console.debug('reload the iframe');
      window.location.href = window.location.href;
      /*
      console.log(res)
      layer.msg('上传成功')
      table.reload('tb_media', { page: { curr: 1 } }, 'data');
      layer.closeAll();
      */
      //btnAddClick()
      //layui.$('#uploadDemoView').removeClass('layui-hide').find('img').attr('src', res.files.file);
      
    }
    ,error: function(index, upload){
      //当上传失败时，你可以生成一个“重新上传”的按钮，点击该按钮时，执行 upload() 方法即可实现重新上传
      //console.log('--upload error---',index)
      //layer.msg('hello');
    }
  });

});