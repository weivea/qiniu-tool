'use strict';

let mongoClient = require('mongodb').MongoClient;
let ObjectID = require('mongodb').ObjectID;
let Db = require('mongodb').Db,
    Mongos = require('mongodb').Mongos,
    Server = require('mongodb').Server;


let co = require('co');
let path = require("path");
let thunkify = require("thunkify");
let config = require("../config.js");
let directoryColl,userColl,tpmFileInfoColl;
let readyFlag = false;



//init
function *init(){
    if(directoryColl){
        return true;
    }else{
        var db = yield mongoClient.connect(config.mongodbUrl);
        //var db = yield mongoClient.connect('mongodb://localhost:27017/xiaoyingCloud');
        directoryColl = db.collection("directory");
        userColl = db.collection("user");

        tpmFileInfoColl = db.collection("tpmFileInfo");

        console.log("数据库初始化成功~");


        var indexName = yield  db.createIndex('directory', {name:1,parentId:1} , {background:true, w:1});
        console.log("数据库添加索引~");
        console.log(indexName);

        indexName = yield  db.createIndex('user', {name:1} , {background:true, w:1});
        console.log(indexName);

        var indexs = yield tpmFileInfoColl.indexes();
        if(indexs.length<=1){
            indexName = yield  db.createIndex('tpmFileInfo', {timeout:1} , {background:true, w:1,expireAfterSeconds:config.uploadingExpireTime});
            console.log(indexName);
        }


        readyFlag = true;
        return true;
    }
}
co(init);

function *makeDir(name,parentId,isFile,info,hash){
    if(!directoryColl){
        return false;
    }
    parentId = (parentId)?parentId:'no';
    var dir = yield directoryColl.find({name:name,parentId:parentId}).limit(1).toArray();
    if(dir && dir.length>0){//文件夹同一目录下不能重复创建
        return {
            id:dir[0]._id.toString(),
            alreadyHas:1
        };
    }else{
        var r = yield directoryColl.insertOne({
            opDate:(new Date()).getTime(),
            name:name,
            parentId:parentId,
            isFile:(isFile)?1:0,
            info:info,
            hash:hash
        });
        if(!isFile){//如果是文件夹，添加目录信息
            if(!info || !info.pwd){
                var parentPwd = (parentId=='no')?'':(yield getDirPwd(parentId));
                var doc = yield directoryColl.find({parentId:parentId,name:name}).limit(1).toArray();
                var dirId = doc[0]._id.toString();
                var tmpPwd = path.join(parentPwd,(name+"_"+dirId));
                info  = {pwd:tmpPwd};
            }

            var ret = yield directoryColl.updateOne({parentId:parentId,name:name}, {$set: {info:info}});
            //console.log(ret);
        }
        return {
            id:r.insertedId.toString(),
            alreadyHas:0
        };
    }
}

function *checkFileExist(name,parentId){
    var dir = yield directoryColl.find({name:name,parentId:parentId}).limit(1).toArray();
    if(dir && dir.length>0){
        return {
            data:dir[0],
            alreadyHas:1
        };
    }else{
        return {
            data:null,
            alreadyHas:0
        };
    }
}
function *getCount(parentId){
    if(!directoryColl){
        return 0;
    }
    return yield directoryColl.count({parentId:parentId});
}
function *getDirs(parentId,skip,limit){
    if(!directoryColl){
        return false;
    }
    var list = yield directoryColl.find({parentId:parentId}).sort({_id:-1}).skip(skip).limit(limit).toArray();
    return list;
}
function *getDirName(id){
    var doc = yield directoryColl.find({_id:ObjectID.createFromHexString(id)}).limit(1).toArray();
    if(doc && doc.length>0){
        return doc[0].name;
    }else{
        return false;
    }
}

function *getDirPwd(id){
    var doc = yield directoryColl.find({_id:ObjectID.createFromHexString(id)}).limit(1).toArray();
    if(doc && doc.length>0 && doc[0].info){
        return doc[0].info.pwd;
    }else{
        return null;
    }
}


function *removeDir(id){
    id = ((typeof id) == 'string')?ObjectID.createFromHexString(id):id;
    var r = yield directoryColl.removeOne({_id:id});
    return r;

}

function isReady(cb){
    if(readyFlag){
        cb(null,readyFlag);
    }else{
        setTimeout(function(){
            if(readyFlag){
                cb(null,readyFlag);
            }else{
                setTimeout(function () {
                    cb(null,readyFlag);
                },3000);
            }
        },3000);
    }

}





/**
* 用户相关
*
*
* */
function *addUser(name,pass){
    var r = yield userColl.insertOne({name,pass});
    return r.insertedId.toString();
}

function *delUser(id){
    id = ((typeof id) == 'string')?ObjectID.createFromHexString(id):id;
    var r = yield userColl.removeOne({_id:id});
    return r;
}

function *getUserByName(name){
    var doc = yield userColl.find({name}).limit(1).toArray();
    if(doc && doc.length>0){
        return doc[0];
    }else{
        return null;
    }
}
function *getAllUsers(){
    var doc = yield userColl.find().toArray();

    return doc;
}


/**
 * 上传中的文件信息暂存
 * */
function *insertTmpFileInfo(info){
    info.timeout = new Date();
    var r = yield tpmFileInfoColl.insertOne(info);
    return r.insertedId.toString();
}
function *getTmpFileInfo(id){
    id = ((typeof id) == 'string')?ObjectID.createFromHexString(id):id;
    var doc = yield tpmFileInfoColl.find({_id:id}).limit(1).toArray();
    if(doc && doc.length>0){
        return doc[0];
    }else{
        return null;
    }
}



module.exports={
    init:init,
    isReady:thunkify(isReady),
    makeDir:makeDir,
    getCount:getCount,
    getDirs:getDirs,
    getDirName:getDirName,
    getDirPwd:getDirPwd,
    checkFileExist:checkFileExist,
    removeDir:removeDir,

    //用户相关
    addUser:addUser,
    delUser:delUser,
    getUserByName:getUserByName,
    getAllUsers:getAllUsers,


    //文件上传信息
    insertTmpFileInfo:insertTmpFileInfo,
    getTmpFileInfo:getTmpFileInfo
};