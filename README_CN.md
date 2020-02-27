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

- 配置好账户密码后，启动服务
```
npm run start
```

### 开始使用
- 由于时间关系，本人懒得做一个UI的后台。所以只实现命令行登录，若此后项目多人用了，再考虑做UI后台

- 登录账号与密码默认值为 admin / 123456
```
npm run login <account> <password>
```
- 建立一个 bucket，需要制定一个 bucket 的名字
```
npm run bucket:create <bucket name (required)>
```
- 
