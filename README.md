# putsoon
这是一个小型的，轻量化的媒体资源服务器。基于 [egg.js](https://eggjs.org/) 技术实现，内置 Sqlite3 服务器，无需额外配置服务器，方便安装、使用。


### 项目要求 
- Nodejs 10.19.0 以上。

### 安装
- mkdir putsoon && cd putsoon
- npm init putsoon
- npm install --production

### 配置
- 安装并配置数据库。
```
npm run setup
```
- 输入登录账号和密码，默认值为 admin/123456 。
![setup account](https://github.com/zuweie/photobed/blob/master/Snip20200227_1.png?raw=true "setup account")
- 生成初始数据
```
/* 生产环境 */
npm run seeding:pro

/* 开发环境 */
npm run seeding:dev
```
- 配置好账户密码后，服务器启动，启动服务器可以分为调试环境，或者生产环境。默认端口是7001，如需更换其他端口请使用参数 -- --port=<port number>，例如：-- --port=9001 。
  
```
/* 启动生产环境，默认端口 7001 */
npm run start 

/*  启动生产环境，使用 9001 端口启动 */
npm run start -- --port=9001

/* 启动调试环境，默认端口 7001 */
npm run dev 

/* 启动调试环境，使用 9001 端口启动 */
npm run dev -- --port=9001
```

### 快速开始
- 由于时间关系，本人懒得做一个UI的后台，所以只实现命令行登录操作。
- 登录后台，登录账号与密码默认值为 admin / 123456 。
```
npm run login <account> <password>
```
- 建立一个 bucket，需要制定一个 bucket 的名字。
```
npm run bucket:create <bucket name (required)>
```
- 上传文件
```
npm run upload <bucket name(required)> <file1> <file2> <file3> ...
```
成功返回该文件的signature，signature 为文件的唯一标识。

- 展示文件
浏览器中输入 http://localhost:{port}/e/{signature} 即可展示刚刚上传的文件。

 ### 项目配置
 - 存储文件的目录的配置：
 在 ${root}/config/config.default.js 中，config.bucket.root 即为上传文件的存储目录，可以根据实际情况来设置。
 ```
   config.bucket = {
    root:appInfo.baseDir+'/media_source/',
  }
 ```
 - 上传限制开关
在 ${root}/config/config.default.js 中，config.bucket.upload_guard 为上传限制开关，其值为 true 的时候，上传文件则需要 _token，否则上传失败。在config.bucket.upload_guard 为 false 时，上传文件没任何限制。
 
 ### 插件功能
 putsoon 设计了插件功能，通过插件增加 putsoon 展示文件的能力。例如，通过 putsoon-plugin-ps 可以缩放、剪裁图片。
 
 - 安装插件，只需按照普通的 npm 包安装即可，一下以 putsoon-plugin-ps 为例子。
 ```
 npm install --save putsoon-plugin-ps
 ```
 
 - 使用 putsoon-plugin-ps 插件，
 安装过后，不需要任何特殊代码，只需在url中添加相应的参数即可。下面以 putsoon-plugin-ps 的图片瘦身50%的功能为例子：
 在浏览器中输入以下地址，即可展示按比例缩少 50% 的图片。
 
 http://${host}/e/{signature}/ps/slim/0.5
 
 ### 相关API
 浏览器中键入 http://localhost:{port}/swagger-ui.html 即可获取详细的 api 信息
  
 ## 完
  
