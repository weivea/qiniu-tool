/**
 * Created by weijianli on 15/11/16.
 */

"use strict";
var serve = require('koa-static');
var koa = require('koa');
var app = koa();
var route = require('koa-router')();
var parse = require('co-body');
var views = require('co-views');
var session = require('koa-session-store');
var mongoStore = require('koa-session-mongo');
let config = require("./control/config.js");
var qiniuService = require('./control/qiniuService');
var mongoService = require('./control/mongoService');
var userManage = require('./control/userManage');


app.keys = ['weivea secret key'];  // needed for cookie-signing
app.use(session({
    store: mongoStore.create({
        host: config.sessionHost,
        port: config.sessionPort,
        db: config.sessionDbName
    })
}));

//模板。静态资源
var render = views('views', {
    map: { html: 'ejs' }
});
app.use(serve('public'));


//访问认证
app.use(function *(next){
    //var n = this.session.views || 0;
    //this.session.views = ++n;
    if(this.session._id || (this.originalUrl == '/user/login') || (this.originalUrl == '/login') || this.originalUrl.indexOf('/thirdApi/') != -1){
        yield next;
    }else{
        if(this.originalUrl.indexOf('/user/') == -1 && this.originalUrl.indexOf('/api/') == -1){
            this.redirect("/login");
        }else{
            this.body={err:1,msg:'login first!'};
        }

    }
});





route.get('/login', function *(){
    this.body = yield render('index', {isLogin:(this.session._id)?1:0, userName:this.session.userName});
});
route.get('/s_resource', function *(){
    this.body = yield render('index', {isLogin:(this.session._id)?1:0, userName:this.session.userName});
});
route.get('/s_resource/**', function *(){
    this.body = yield render('index', {isLogin:(this.session._id)?1:0, userName:this.session.userName});
});
route.get('/user', function *(){
    this.body = yield render('index', {isLogin:(this.session._id)?1:0, userName:this.session.userName});
});


route.post('/user/login', userManage.login);
route.post('/user/signOut', userManage.signOut);

route.post('/user/getAll', userManage.getAllUsers);
route.post('/user/add', userManage.addUser);
route.post('/user/del', userManage.delUser);

//获得指定文件夹下的子文件和子文件夹
route.get('/api/getBucketData', function *(){
    var bucketData = qiniuService.getBucketData();
    this.body =  {
        err:0,
        bucketData:bucketData
    }
});


//获得指定文件夹下的子文件和子文件夹
route.get('/api/getFiles', function *(){
    this.body = yield qiniuService.getFiles(this.query.folderId,this.query.curPage);
});

/*
* query.bucket //**
* query.folderId //上传到的文件夹Id
* query.folderName//上传到的文件夹名
* query.fileName/文件名
*
* */
route.get('/api/getUpToken', function *(){
    //var body = yield parse(this);
    var r = yield qiniuService.getUpToken(this.query.bucket,this.query.folderId,this.query.fileName);
    this.body = r;
});



route.post('/api/qiniuUploadDone', function *(){
    var params = yield parse(this);
    //console.log(this);

    this.body = yield qiniuService.saveDataToDb(params.backData,params.backInfo);
});


route.post('/api/delFile', function *(){
    var params = yield parse(this);
    this.body = yield qiniuService.delFiles(params.files);
});

route.post('/api/makeDir', function *(){
    var params = yield parse(this);
    this.body = yield qiniuService.makeDir(params.dirName,params.parentId);
});



route.post('/thirdApi/ThirdInterface', qiniuService.ThirdInterface);



route.get("*",function *(){
    if(this.session._id){
        this.redirect("/s_resource");
    }else{
        this.redirect("/login");
    }
});
app.use(route.routes())
    .use(route.allowedMethods());
app.listen(config.hostPort);

console.log('listening on port :'+config.hostPort);