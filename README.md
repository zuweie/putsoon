# Putsoon

### 项目由来
开发项目中，经常使用媒体资源云服务，例如7牛。但有时候那个破玩意儿用起来特别麻烦。既要实名认证，又要设置有效域名。有时候开发一些小项目的时候，真的不想用那个破7牛。但他的一些好用功能，又不得不用，用的最多就是图片缩小、长和宽重定义、加水印等等...

于是我用蛋蛋（[egg.js](https://eggjs.org/) ）写了一个轻量化的媒体资源服务器，将其命名为 PUTSOON，内置 Sqlite3 数据库，无需额外配置，方便安装、使用。现将其开源，有用得上的同学点个星，谢谢～～～

更多功能在后续开发中～～～


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

### docker 安装
```
// 因为官方的 docker hub 在中国地区太慢，改用阿里云的镜像服务
docker pull registry.cn-hangzhou.aliyuncs.com/putsoon/putsoon:latest
docker container run -d -p {export port}:7001 --name=putsoon {putsoon_imageID} /home/node/start_putsoon.sh
```

### 快速开始
- 启动 putsoon 后，在浏览器中输入 `http://127.0.0.1:{port}/admin`，登录后台。
- 启动 putsoon 后，在浏览器中输入 `http://127.0.0.1:{port}/swagger-ui.html`，直接使用 API 测试页面。
  
  
### 概念与术语
- Bucket 存放媒体文件的对象，可以理解为一个文件夹，或者是一个目录。
- Media 代表一个媒体文件，可以是图片，流媒体，或者一个普通文件。

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
```
  config.bucket = {
    upload_guard : true,
  };
```
 - token 有效期
 在 ${root}/config/config.default.js 中，config.token.expireIn 为 token 有效期的默认值，单位为秒。
 ```
   config.token = {
    expireIn: 3600,
  }
 ```
 
 ### Token 生成与使用
 - 在 putsoon 中有两个地方使用到token。
    - 当配置文件中的 upload_guard 为 true 时，上传文件需要 upload token。
    - 当要展示一个文件，其所属的 Bucket 为 private 的时候，展示这个文件的时候需要 expose token。
 
 - 生成 upload token 的 Ak 与 Sk
    - 登录后台操作，点击生成 Ak 与 Sk。
    - 输入upload 与 有效期，空则为 1 小时有效期。点击确定即可生成 upload 的 Ak 与 Sk。
 
 - 生成 expose token 的 Ak 与 Sk
    - 登录后台操作，点击生成 Ak 与 Sk。
    - 输入expose 与 有效期，空则为 1 小时有效期。点击确定即可生成 expose 的 Ak 与 Sk。
    
 - 合成 upload token
    - 找到 upload token 的 Ak 与 Sk。
    - 在业务服务器端使用代码合成，然后返回前端：`base64(ak+'&&'+md5(timestamp+'&&'+sk)+'&&'+timestamp+'&&'+<bucket>)`。
    - 生成upload token 的时候需要指定 upload 的 bucket。否则上传文件传入的 _token 不能告诉 putsoon 要将文件放入哪个 bucket。
    - upload token 的默认有效期在配置文件设置，参考配置文件设置章节。
    
 - 合成 expose token
    - 找到 expose token 的 Ak 与 Sk。
    - 在业务服务器端使用代码合成，然后返回前端：`base64(ak+'&&'+md5(timestamp+'&&'+sk)+'&&'+timestamp)`。
    - expose token 的默认有效期在配置文件中设置，参考配置文件设置章节。
 
 ### 插件功能
 putsoon 设计了插件功能，通过插件增加 putsoon 展示文件的能力。例如，通过 putsoon-plugin-ps 可以缩放、剪裁图片。
 
 - 安装插件，只需按照普通的 npm 包安装即可，一下以 putsoon-plugin-ps 为例子。
 ```
 npm install --save putsoon-plugin-ps
 ```
 
 - 使用 putsoon-plugin-ps 插件，
 安装过后，不需要任何特殊代码，只需在url中添加相应的参数即可。下面以插件 putsoon-plugin-ps 中的图片瘦身功能为例子,在浏览器中输入以下地址，即可展示按比例缩少 50% 的图片。
 
 http://${host}:{port}/e/{signature}/ps/slim/0.5
 
 相关参数请参考：[putsoon-plugin-ps](https://github.com/zuweie/donkey-plugin-ps) 
 
 ### PUTSOON API 
 
 - **1 登录 Putsoon**
 
 POST /api/v1/login2
 参数|描述|默认值|位置
 --:|--:|--:|--:|
 login|登录的账号|admin|body
 password|登录的密码|123456|body
 
 例子:
 ```
 curl -X POST "http://{yourhost}/api/v1/backend/login2" -H "accept: application/json" -H "Content-Type: application/x-www-form-urlencoded" -d "login=admin&password=123456"
 ```
成功返回:
```
{
  "errcode": 0,
  "errmsg": "err-ok",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6ImFkbWluIiwibmlja25hbWUiOiJEb25rZXkiLCJ1c2VyX2lkIjoxLCJpYXQiOjE1ODU2NDcwNTYsImV4cCI6MTU4NTY4MzA1Nn0.Mi6AKlm2zGXKw83gyypfAqehCv198vDdLj6aRQrmpHI"
  }
}
```
失败返回:
```
401 Unauthorized
```

 - **2 创建 Bucket**
 
 POST /api/v1/bucket/create
 
 参数|描述|默认值|位置
 ---:|---:|---:|---:|
 Authorization|Bearer <access_token>|无|header
 bucket|要创建bucket的名字|无|body
 is_private|bucket是否私有|false|body
 describe|bucket的概要|空|body
 
 例子:
 ```
 curl -X POST "http://{yourhost}/api/v1/bucket/create" -H "accept: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6ImFkbWluIiwibmlja25hbWUiOiJEb25rZXkiLCJ1c2VyX2lkIjoxLCJpYXQiOjE1ODU2NjM2NjMsImV4cCI6MTU4NTY5OTY2M30.Ghtj_IKdoq22dy--Gl4Xoi0ahJItRb7afBY7gPUnzTE" -H "Content-Type: application/x-www-form-urlencoded" -d "bucket=pocket&is_private=0&describe=pocket"
 ```
 成功返回:
 ```
 {
  "errcode": 0,
  "errmsg": "err-ok",
  "data": {
    "name": "pocket",
    "bucket_dir": "/path/of/the/bucket/"
  }
}
 ```
 
 失败返回
 ```
 401 Unauthorized
 ```
 
 - **3 Bucket 列表**
 
 GET /api/v1/bucket/show
 
  参数|描述|默认值|位置
 ---:|---:|---:|---:|
 Authorization|Bearer <access_token>|无|header
 page|页数|1|query
 limit|每页数量|20|query
 
 例子:
 ```
 curl -X GET "http://{yourhost}/api/v1/bucket/show?page=1&limit=20" -H "accept: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6ImFkbWluIiwibmlja25hbWUiOiJEb25rZXkiLCJ1c2VyX2lkIjoxLCJpYXQiOjE1ODU2NjM2NjMsImV4cCI6MTU4NTY5OTY2M30.Ghtj_IKdoq22dy--Gl4Xoi0ahJItRb7afBY7gPUnzTE"
 ```
 
 成功返回:
 ```
 {
  "errcode": 0,
  "errmsg": "err-ok",
  "data": [
    {
      "id": 1,
      "bucket": "b1",
      "description": null,
      "is_private": false,
      "user_id": 1,
      "createdAt": "2020-03-13T04:52:04.113Z",
      "updatedAt": "2020-03-13T04:52:04.113Z"
    },
    {
      "id": 2,
      "bucket": "pocket",
      "description": "pocket",
      "is_private": false,
      "user_id": 1,
      "createdAt": "2020-03-31T14:09:05.084Z",
      "updatedAt": "2020-03-31T14:09:05.084Z"
    }
  ]
}
 ```
 失败返回:
 ```
 401 Unauthorized
 ```
 
 - **4 删除 Bucket**
 
 此操作将会把 Bucket 下所有的文件，已经缓存清理干净，需要谨慎使用。
 
 DELETE /api/v1/bucket/delete
 
   参数|描述|默认值|位置
 ---:|---:|---:|---:|
 Authorization|Bearer <access_token>|无|header
 id[]|Bucket 的 ID |无|body
 
 例子:
 ```
 curl -X DELETE "http://{yourhost}/api/v1/bucket/delete" -H "accept: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6ImFkbWluIiwibmlja25hbWUiOiJEb25rZXkiLCJ1c2VyX2lkIjoxLCJpYXQiOjE1ODU2NjM2NjMsImV4cCI6MTU4NTY5OTY2M30.Ghtj_IKdoq22dy--Gl4Xoi0ahJItRb7afBY7gPUnzTE" -H "Content-Type: application/x-www-form-urlencoded" -d "id[]=2&id[]=1"
 ```
 
 成功返回:
 ```
 {
  "errcode": 0,
  "errmsg": "err-ok",
  "data": 0
}
 ```
 失败返回:
 ```
 401 Unauthorized
 ```
 
 - **5 upload 文件**
 
 POST /api/v1/upload
 
 参数|描述|默认值|位置
 ---:|---:|---:|---:|
 _token|上传文件的 token，当配置文件中的 upload_guard 为 true 时，则需要 _token。若 upload_guard 为 false，则不需要 _token。|无|body
 bucket|当配置文件中 upload_guard 为 false 时，则不需要 _token。但需要 bucket 参数，否则 putsoon 不明白文件将放在哪个 bucket。|无|body
 
 例子:
 ```
curl -X POST "http://{yourhost}/api/v1/upload" -H "accept: application/json" -H "Content-Type: multipart/form-data" -F "_token=Y2ZkZmY5N2RhMGU2ZTQ0MjQxYzVkYTBlOWM1ZmY4MTQmJjBlMmIzNjMxMjRiNTVkZGMxZjY1ZGFlZDg5YWNjMTk5JiYxNTg1NzAwMTY5ODUwJiZiMQ==" -F "upload[0]=@Snip20200326_6.png;type=image/png"
 ```
 成功返回:
 ```
 {
  "errcode": 0,
  "errmsg": "err-ok",
  "data": {
    "signature": "b63e0272baf2b782b6eedada3973a189"
  }
}
 ```
 
 失败返回:
 ```
 401 Unauthorized
 or
 404
 ```
 
 - **6 Bucket 下文件列表**
 
 GET /api/v1/files
 
 参数|描述|默认值|位置
 ---:|---:|---:|---:|
 Authorization|Bearer <access_token>|无|header
 bucket|Bucket 的名字|无|query
 page|页数|1|query
 limit|每页显示数量|20|query
 
 例子:
 ```
 curl -X GET "http://{yourhost}/api/v1/files?bucket=b1&page%3D1=1&limit%3D20=20" -H "accept: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6ImFkbWluIiwibmlja25hbWUiOiJEb25rZXkiLCJ1c2VyX2lkIjoxLCJpYXQiOjE1ODU3MDAxMjMsImV4cCI6MTU4NTczNjEyM30.QUJNze2Zx8U6nHZlVGdlD0_N854ZSuyxj6ZpxJvqvMw"
 ```
 
 成功返回:
 ```
 {
  "errcode": 0,
  "errmsg": "err-ok",
  "data": {
    "medias": [
      {
        "user_id": 1,
        "id": 26,
        "firstname": "5",
        "firstname_hash": "e4da3b7fbbce2345d7772b0674a318d5",
        "ext": ".png",
        "query_params": "",
        "signature": "6c2e3759f307f1352862973a75850751",
        "file_hash": "642835e2488800211aa04eea5b90d415",
        "mime": "image/png",
        "bucket": "b1",
        "path": "/path/of/file",
        "status": null,
        "createdAt": "2020-03-11 05:16:06.183 +00:00",
        "updatedAt": "2020-03-11 05:16:06.183 +00:00"
      },
      {
        "user_id": 1,
        "id": 27,
        "firstname": "2",
        "firstname_hash": "c81e728d9d4c2f636f067f89cc14862c",
        "ext": ".png",
        "query_params": "",
        "signature": "c386db0cb530972e6e3b1ff6ddd43156",
        "file_hash": "642835e2488800211aa04eea5b90d415",
        "mime": "image/png",
        "bucket": "b1",
        "path": "/path/of/the/file",
        "status": null,
        "createdAt": "2020-03-11 05:16:06.193 +00:00",
        "updatedAt": "2020-03-11 05:16:06.193 +00:00"
      },
      ...
    ],
    "count": 17
  }
}
 ```
 失败返回:
 ```
 401 Unauthorized
 ```
 
 - **7 删除文件**
 
 参数|描述|默认值|位置
 ---:|---:|---:|---:|
 Authorization|Bearer <access_token>|无|header
 id[]|文件的ID,可批量删除|无|body
 
 例子:
 ```
curl -X DELETE "http://{yourhost}/api/v1/files" -H "accept: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6ImFkbWluIiwibmlja25hbWUiOiJEb25rZXkiLCJ1c2VyX2lkIjoxLCJpYXQiOjE1ODU3MDAxMjMsImV4cCI6MTU4NTczNjEyM30.QUJNze2Zx8U6nHZlVGdlD0_N854ZSuyxj6ZpxJvqvMw" -H "Content-Type: application/x-www-form-urlencoded" -d "id[]=52"
 ```
 
 成功返回:
 ```
 {
  "errcode": 0,
  "errmsg": "err-ok",
  "data": 0
}
 ```
 
 失败返回
 ```
 401 Unauthorized
 ```
 
 - **8 展示文件**
 GET /e/{signature}/p0/p1/p2/p3/p....
  
 参数|描述|默认值|位置
 ---:|---:|---:|---:|
 signature|上传文件后返回的 signature 或者 文件名字 |无|path
 p0~pn|展示此文件时，附加的效果，例如缩少此文件的尺寸，改变宽和高。具体用法，请参照章节[《插件》](https://github.com/zuweie/putsoon/blob/master/README.md#%E6%8F%92%E4%BB%B6%E5%8A%9F%E8%83%BD)的用法|空|path
 _token|当文件在的 bucket 为私有的时候，则需要 expose token，_token 的具体合成办法参照章节 [《token》](https://github.com/zuweie/putsoon/blob/master/README.md#token-%E7%94%9F%E6%88%90%E4%B8%8E%E4%BD%BF%E7%94%A8)|空|query 
 
 - **9 Ak 于 Sk 生成**
 
 Ak 与 Sk 用于合成各种 _token，_token 的合成请参考章节《token》。
 
 参数|描述|默认值|位置
 ---:|---:|---:|---:|
 Authorization|Bearer <access_token>|无|header
 token_name|随便起个名字吧，用于区分 Ak 与 Sk 生成的 token |无|body
 token_expireIn|token的有效期，默认 1 小时，秒为单位|3600|body
 
 例子:
 ```
 curl -X POST "http://{yourhost}/api/v1/token/" -H "accept: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6ImFkbWluIiwibmlja25hbWUiOiJEb25rZXkiLCJ1c2VyX2lkIjoxLCJpYXQiOjE1ODU3MDAxMjMsImV4cCI6MTU4NTczNjEyM30.QUJNze2Zx8U6nHZlVGdlD0_N854ZSuyxj6ZpxJvqvMw" -H "Content-Type: application/x-www-form-urlencoded" -d "token_name=upload_token"
 ```
 
 成功返回:
 ```
 {
  "errcode": 0,
  "errmsg": "err-ok",
  "data": {
    "ak": "892d0dba1dff5ed2cacc6e64a1ee3d4b",
    "sk": "1d36393adddec3f3f6460d90bc8c40ab"
  }
}
 ```
 失败的返回:
 ```
 401 Unauthorized
 ```
 
 - **10 Ak 与 Sk 的列表**
 
  参数|描述|默认值|位置
 ---:|---:|---:|---:|
 Authorization|Bearer <access_token>|无|header
 token_name|过滤各种相关的 token 的名字，无则列出所有有效的 Ak 与 Sk |空|query
 
 例子:
 ```
 curl -X GET "http://{yourhost}/api/v1/token/" -H "accept: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6ImFkbWluIiwibmlja25hbWUiOiJEb25rZXkiLCJ1c2VyX2lkIjoxLCJpYXQiOjE1ODU3MDAxMjMsImV4cCI6MTU4NTczNjEyM30.QUJNze2Zx8U6nHZlVGdlD0_N854ZSuyxj6ZpxJvqvMw"
 ```
 
 成功返回:
 ```
 {
  "errcode": 0,
  "errmsg": "err-ok",
  "data": [
    {
      "id": 4,
      "name": "expose",
      "ak": "13792fd566b869eb61ad63bb39c3172e",
      "sk": "c95b2caaf005877523c9f4236f870f9d",
      "user_id": 1,
      "expireIn": 3600,
      "createdAt": "2020-03-17T04:12:29.894Z",
      "updatedAt": "2020-03-17T04:12:29.894Z"
    },
    {
      "id": 5,
      "name": "upload",
      "ak": "cfdff97da0e6e44241c5da0e9c5ff814",
      "sk": "e1b30b811f6b5a7354582fbd2bd7deb4",
      "user_id": 1,
      "expireIn": 3600,
      "createdAt": "2020-03-17T04:50:21.926Z",
      "updatedAt": "2020-03-17T04:50:21.926Z"
    },
    {
      "id": 6,
      "name": "upload_token",
      "ak": "892d0dba1dff5ed2cacc6e64a1ee3d4b",
      "sk": "1d36393adddec3f3f6460d90bc8c40ab",
      "user_id": 1,
      "expireIn": 3600,
      "createdAt": "2020-04-01T01:09:11.635Z",
      "updatedAt": "2020-04-01T01:09:11.635Z"
    }
  ]
}
 ```
 失败返回:
 ```
 401 Unauthorized
 ```
 
 - **11 删除 Ak 与 Sk**
 
 参数|描述|默认值|位置
 ---:|---:|---:|---:|
 Authorization|Bearer <access_token>|无|header
 id[]:|Ak 与 Sk 的ID | 无 | body
 
 例子:
 ```
 curl -X DELETE "http://{yourhost}/api/v1/token/" -H "accept: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6ImFkbWluIiwibmlja25hbWUiOiJEb25rZXkiLCJ1c2VyX2lkIjoxLCJpYXQiOjE1ODU3MDAxMjMsImV4cCI6MTU4NTczNjEyM30.QUJNze2Zx8U6nHZlVGdlD0_N854ZSuyxj6ZpxJvqvMw" -H "Content-Type: application/x-www-form-urlencoded" -d "id[]=10"
 ```
 
成功返回:
```
{
  "errcode": 0,
  "errmsg": "err-ok",
  "data": 0
}
```

失败返回:
```
401 Unauthorized
```

 ## 完
  
