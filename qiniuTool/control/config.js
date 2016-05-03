/**
 * Created by weijianli on 15/12/10.
 */
config = {
    //七牛云相关配置，
    
    'ACCESS_KEY': 'nY-Cwx-7_fP31ZiFFYsLAzVnYY1jZ9',
    'SECRET_KEY': 'lvJEDioX1J9E3-IetaJx_be2t-C', 
    'Bucket':['weivea'],//默认取第一个 
    'Domain': { 
        'weivea':'http://21341234.com1.z0.glb.clouddn.com/'
     },

    'keyRoot':'webClient',
    'defaultFolderId':'',//保持为空就好


    //数据库
    mongodbUrl:'mongodb://localhost:27017/weiveaCloud',

    //session基于mongodb
    sessionHost:'localhost',
    sessionPort:'27017',
    sessionDbName:'weiveaCloudSession',

    //上传过程时间限制
    uploadingExpireTime:7200,

    //默认的第一个用户
    firstUser:{
        name:'weivea',
        pass:'weivea'
    },

    //webPort
    hostPort:3000
};

module.exports=config;