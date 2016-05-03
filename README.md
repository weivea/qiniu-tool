# qiniu-tool
基于七牛云的静态资源管理，包含第三方上传接口
基于mongodb
(就像百度云哟)
运行前请先安装<a href="https://www.mongodb.org/">mongodb</a>

1. 注册<a href="http://www.qiniu.com/">七牛云</a>帐号;
2. 获得AccessKey/SecretKey,创建空间，得到bucketName,和空间域名
3. 修改qiniuTool/control/config.js中的相关配置。
```javascript
config = {


    'ACCESS_KEY': 'nY-CzS3Ao9T1vZ',
    'SECRET_KEY': '-IetaJx_be2t-C', 
    'Bucket':['weivea'，'weivea2'，'weivea3'],//空间名称,默认取第一个 
    'Domain': { //空间域名
        'weivea':'http://7xot2g.com1.z0.glb.clouddn.com/'
        'weivea2':'http://7xot2g.com1.z0.glb.clouddn.com2/'
        'weivea3':'http://7xot2g.com1.z0.glb.clouddn.com3/'
     },


    'keyRoot':'/webClient',//根目录名称，建议不要太长，太长有坑
    'defaultFolderId':'',//保持为空就好


    //数据库
    mongodbUrl:'mongodb://localhost:27017/weiveaCloud',

    //session基于mongodb
    sessionHost:'localhost',
    sessionPort:'27017',
    sessionDbName:'weiveaCloudSession',


    //默认的第一个用户
    firstUser:{
        name:'weivea',
        pass:'weivea'
    },

    //webPort
    hostPort:3000
};

module.exports=config;
```

4. 程序启动

```shell
#运行七牛云工具
cd qiniuTool
npm install
node index.js


#运行第三方上传测试
cd thirdDeam
npm install
node index.js
```

第三方接口采用rsa加密


***
20160321:  
修改程序，使在应用页面端手动上传的文件path与在七牛云上的对应，以保证一些文件群可以更好的已相对路径引用
