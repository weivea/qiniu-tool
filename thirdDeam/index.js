/**
 * Created by weijianli on 15/12/11.
 */

"use strict";
var serve = require('koa-static');
var koa = require('koa');
var app = koa();
var route = require('koa-router')();
var parse = require('co-body');
var views = require('co-views');

var thunkify = require('thunkify');
var ursa = require('ursa');
var post = thunkify(require('request').post);

var fs = require('fs');
var crt = ursa.createPublicKey(fs.readFileSync('./rsa-server.pub'));

//模板。静态资源
var render = views('views', {
    map: { html: 'ejs' }
});
app.use(serve('public'));

//app.use(function *(next){
//    //var n = this.session.views || 0;
//    //this.session.views = ++n;
//    console.log(this.originalUrl);
//    yield next;
//});
route.get('/', function *(){
    this.body = yield render('index');
});

route.post('/api/getUpToken', function *(){
    //this.body = yield render('index');
    var params = yield parse(this);
    var pageData = params.pageData;
    var bucketName = 'weivea';
    var folderName = 'thirdTest';
    var formData = {pageData:pageData,bucketName:bucketName,folderName:folderName};
    formData = crt.encrypt(JSON.stringify(formData), 'utf8', 'base64');
    var re = yield post({url:"http://localhost:3000/thirdApi/ThirdInterface",form:{data:formData}});
    this.body = JSON.parse(re[1]);

});

app.use(route.routes())
    .use(route.allowedMethods());
app.listen('4000');

console.log('listening on port :4000');