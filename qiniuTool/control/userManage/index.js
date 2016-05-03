/**
 * Created by weijianli on 15/12/7.
 */
    "use strict";
let co = require('co');
let thunkify = require('thunkify');
let mongoService = require('../mongoService');
let parse = require('co-body');

let MD5 = require('../lib/md5Fun.js');
let config = require("../config.js");

function init(){
    co(function *(){
        var ready =  yield mongoService.isReady();
        if(!ready){
            console.log('数据库没有初始化好');return;
        }
        var allUsers = yield mongoService.getAllUsers();
        if(allUsers && allUsers.length>0){
            console.log("用户数据初始化成功");
        }else{
            var r = yield mongoService.addUser(config.firstUser.name,MD5(config.firstUser.pass));
            console.log("新建用户"+config.firstUser.name+"  id:"+r);
            console.log("用户数据初始化成功");
        }
        console.log('user init done.');
    });
}
init();

function *login(){
    var re;
    var params = yield parse(this);
    var user = yield mongoService.getUserByName(params.userName);
    if(!user){
        re = {
            err:1,
            msg:"没有该用户"
        };
    }else{
        if(user.pass == params.password) {
            re = {err: 0, msg: 'success'};
            this.session._id = user._id;
            this.session.userName = user.name;
        }else{
            re = {err: 1, msg: '密码错误'};
        }
    }
    this.body = re;
}

function *signOut(){
    this.session._id = undefined;
    this.body = {err:0,msg:'success'};
}

function *addUser(){
    var re;
    var params = yield parse(this);
    var user = yield mongoService.getUserByName(params.userName);
    if(user){
        re = {
            err:1,
            msg:"已经有一个相同的用户名"
        };
    }else{
        var r = yield mongoService.addUser(params.userName,params.password);
        re= {
            err:0,
            msg:"success"
        };

    }
    this.body = re;
}
function *delUser(){
    var params = yield parse(this);
    var users = yield mongoService.getAllUsers();
    if(users.length == 1){
        this.body = {err:1,msg:'不能删除最后一个账户'};
    }else{
        var r = yield mongoService.delUser(params.userId);
        if(r.result.ok == 1){
            this.body = {err:0,msg:'success'};
        }else{
            this.body = {err:1,msg:'删除失败'};
        }
    }

}

function *getAllUsers(){
    var users = yield mongoService.getAllUsers();
    this.body = {err:0,users:users};
}
module .exports = {
    login:login,
    signOut:signOut,
    addUser:addUser,
    delUser:delUser,
    getAllUsers:getAllUsers
};