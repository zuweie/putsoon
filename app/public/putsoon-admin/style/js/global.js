//config的设置是全局的
layui.config({
   base: '/public/putsoon-admin/style/js/' //假设这是你存放拓展模块的根目录
}).extend({ //设定模块别名
   api: 'api' //如果 mymod.js 是在根目录，也可以不用设定别名
   //,mod1: 'admin/mod1' //相对于上述 base 目录的子目录
});