# Donkey Cloud
这是一个小型的，轻量化的媒体资源服务器。基于 [egg.js](https://eggjs.org/) 技术实现，内置 Sqlite3 服务器，无需额外配置服务器，方便安装、使用。
由于经常需要使用图片上传的图片的

### 项目要求 
- Nodejs 10.19.0 以上。

### 安装
- git clone 或者[下载本项目](https://github.com/zuweie/donkey/archive/master.zip)
- cd donkey
- npm install --production

### 配置
- 安装并配置数据库
```
npm run setup
```
- 输入登录账号和密码，默认值为 admin/123456
![setup account](https://github.com/zuweie/photobed/blob/master/Snip20200227_1.png?raw=true "setup account")
- 生成初始数据
```
/* 生产环境 */
npm run seeding:pro

/* 开发环境 */
npm run seeding:dev
```
- 配置好账户密码后，启动服务，默认端口是7001，需要换其他端口使用参数例如， -- --port=9001
```
/* 启动生产环境，默认端口 7001 */
npm run start 

/*  使用 9001 端口启动 */
npm run start -- --port=9001

/* 启动开发环境，默认端口 7001 */
npm run dev 

/* 使用 9001 端口启动 */
npm run dev -- --port=9001
```

### 快速开始
- 由于时间关系，本人懒得做一个UI的后台，所以只实现命令行登录操作
- 登录账号与密码默认值为 admin / 123456
```
npm run login <account> <password>
```
- 建立一个 bucket，需要制定一个 bucket 的名字
```
npm run bucket:create <bucket name (required)>
```
- 在建立了 bucket 后便可开始上传文件了
- 浏览器上打开地址: http://localhost:7001/swagger-ui.html
- 选择文件，以及指定你要上传bucket
