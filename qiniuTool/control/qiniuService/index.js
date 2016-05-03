'use strict';
let qiniu = require('qiniu');
let path = require('path');
let co = require('co');
let thunkify = require('thunkify');
var parse = require('co-body');
let mongoService = require('../mongoService');
let config = require("../config.js");
let rsaFun = require("../lib/rsaFun.js");



/*
* bucket根目录
* {
*   bucketName：folderId
*      。
*      。
*      。
* }
* */
let bucketData = {};

//暂存数据
//let TmpData = {};


let counterNum=0;
var client;

function init(){
    qiniu.conf.ACCESS_KEY = config.ACCESS_KEY;
    qiniu.conf.SECRET_KEY = config.SECRET_KEY;
    client = new qiniu.rs.Client();
    co(function *(){
        var ready =  yield mongoService.isReady();
        if(!ready){
            console.log('数据库没有初始化好');return;
        }

        for(var key=0; key<config.Bucket.length; key++){

            var r = yield mongoService.makeDir(config.Bucket[key]);
            console.log('创建根文件夹'+config.Bucket[key]+"    id:"+r.id);
            if(r.alreadyHas){
                console.log('文件夹已存在！')
            }
            bucketData[config.Bucket[key]] = r.id;
            if(key==0){//默认取第一个
                config.defaultFolderId = r.id;
            }

        }
        
        
        console.log('qiniu init done.');
    });

}
init();



/*
* 获取文件上传许可
* Bucket_Name：**
* FolderName：所属文件夹
* FolderId:所属文件夹Id
* fileName：文件名
* */
function *getUpToken(Bucket_Name,FolderId,fileName){
    if(!config.Domain[Bucket_Name]){
        return {
            err:1,
            msg:'没有名为'+Bucket_Name+'的Bucket！'
        };
    }
    if(!fileName){
        return {
            err:1,
            msg:'缺少fileName参数！'
        };
    }
    var FolderIdTmp,FolderNameTmp,alreadyHas=false;
    if(!FolderId){
        return {
            err:1,
            msg:'FolderId is required!'
        }
    }else{
        var r = yield mongoService.checkFileExist(fileName,FolderId);
        if(r.alreadyHas){
            alreadyHas=true;
        }
        FolderIdTmp = FolderId;
        FolderNameTmp =  yield mongoService.getDirName(FolderId);
    }


    //生成token

    var pwdString = yield mongoService.getDirPwd(FolderIdTmp);
    var tmp = pwdString.split('/');
    var dirs_ = [];
    for(var i in tmp){
        dirs_.push(tmp[i].split('_')[0])
    }
    console.log(path.join(config.keyRoot,dirs_.join('/'),fileName));

    //var key = path.join(config.keyRoot,'dir_'+FolderIdTmp,fileName);
    var key = path.join(config.keyRoot,dirs_.join('/'),fileName);

    var scope = Bucket_Name+':'+key;
    var putPolicy = new qiniu.rs.PutPolicy(scope);
    putPolicy.expires = 120;
    var backData = {
        fileName:fileName,
        key:key,
        FolderId:FolderIdTmp,
        FolderName:FolderNameTmp,
        Bucket_Name:Bucket_Name
    };
    var backDataBase64 = (new Buffer(JSON.stringify(backData))).toString('base64');
    if(alreadyHas){
        return {
            err:1,
            alreadyHas:1,
            token:putPolicy.token(),
            key:key,
            backData:backDataBase64
        };
    }else{
        return {
            err:0,
            token:putPolicy.token(),
            key:key,
            backData:backDataBase64
        };
    }
}


function *saveDataToDb(backDataBase64,backInfo){
    if((typeof backDataBase64) == 'string'){
        var backData = JSON.parse((new Buffer(backDataBase64, 'base64')).toString());
    }else{
        var backData = backDataBase64
    }


    var FolderIdTmp,FolderNameTmp;
    if(!backData.FolderId){//没有FolderId时，在Bucket根目录下面创建
        if(!backData.FolderName){
            return {
                err:1,
                msg:'FolderId ro FolderName is required!'
            }
        }
        FolderIdTmp = (yield mongoService.makeDir(backData.FolderName,bucketData[backData.Bucket_Name])).id;
        //FolderNameTmp = backData.FolderName;
    }else{
        FolderIdTmp = backData.FolderId;
        FolderNameTmp =  yield mongoService.getDirName(FolderIdTmp);
        if(!FolderNameTmp){
            return{
                err:1,
                msg:"没有ID为"+backData.FolderId+"的文件夹"
            }
        }
    }

    var fileInfo = {
        Bucket_Name:backData.Bucket_Name,
        key:backData.key,
        size:backInfo.size,
        url: config.Domain[backData.Bucket_Name]+backData.key
    };
    var r = yield mongoService.makeDir(backData.fileName,FolderIdTmp,true,fileInfo,backInfo.hash);
    console.log('创建文件名:'+backData.fileName+'     id:'+r.id);
    return{
        err:0,
        msg:"success",
        id:r.id,
        url:fileInfo.url
    }

}


function *getFiles(folderId,pageNum){
    var pageN = 10;
    var FolderIdTmp = (folderId)?folderId:config.defaultFolderId;
    var count = yield mongoService.getCount(FolderIdTmp);
    //if(count == 0){
    //    return{err:1,msg:'没有数据'};
    //}
    var pageNumT = Math.ceil(count/pageN);
    pageNumT = (pageNumT)?pageNumT:1;
    pageNum = (pageNum)?pageNum:1;
    if(pageNum>pageNumT){
        pageNum = pageNumT
    }else if(pageNum<1){
        pageNum = 1;
    }

    var list = yield mongoService.getDirs(FolderIdTmp,pageN*(pageNum-1),pageN);
    var pwdString = yield mongoService.getDirPwd(folderId);
    var tmp = pwdString.split('/');
    var pwd = [];
    for(var cnt in tmp){
        var dir = tmp[cnt].split('_');
        pwd.push({
            name:dir[0],
            folderId:dir[1]
        });
    }

    return {err:0,list:list,folderId:FolderIdTmp,pwd:pwd,curPage:pageNum,totalPage:pageNumT};
}

function getBucketData(){
    return bucketData;
}


function *makeDir(name,parentId){
    var r = yield mongoService.makeDir(name,parentId);
    console.log('创建根文件夹'+name+"    id:"+r.id);
    if(r.alreadyHas){
        console.log('文件夹已存在！')
    }
    var re={
        err:r.alreadyHas,
        msg:(r.alreadyHas)?"文件夹已存在":'success!'
    };
    return re;
}


function *delFiles(files){
    //console.log(files);
    var paths = [];

    var re = yield getFilesInList(files);
    files = re.files;
    var dirs = re.dirs;

    var reData=[];
    if(files && files.length>0){
        for(var cnt in files){
            paths.push(new qiniu.rs.EntryPath(files[cnt].info.Bucket_Name, files[cnt].info.key))
        }
        var thunk_batchDelete = thunkify(client.batchDelete);
        var ret = yield thunk_batchDelete(paths);
        //console.log(ret);
        for(var ind in ret[0]){
            if(ret[0][ind].code == 612 || ret[0][ind].code == 200){
                var r = yield mongoService.removeDir(files[ind]._id);
                console.log('删除文件:'+files[ind].name+JSON.stringify(r.result)+'code:'+ret[0][ind].code);
                reData.push({err:0,type:'file',name:files[ind].name,msg: JSON.stringify(r.result)});
            }else{
                reData.push({err:0,type:'file',name:files[ind].name,msg: JSON.stringify(ret[0][ind].data)});
            }
        }
    }

    var dirRe;
    if(dirs && dirs.length>0){
        dirRe = yield removeDirs(dirs);
        reData = reData.concat(dirRe);
    }

    return reData;
}


function *removeDirs(dirs){
    var re=[];
    for(var cnt in dirs){
        var _id = ((typeof dirs[cnt]._id) == 'string')?dirs[cnt]._id:dirs[cnt]._id.toString();
        var list = (yield getFiles(_id)).list;
        if(list && list.length>0){
            re.push({err:1,type:'dir',name:dirs[cnt].name,msg:'文件夹内有文件未能删除'})
        }else{
            var r = yield mongoService.removeDir(dirs[cnt]._id);
            console.log('删除文件夹:'+dirs[cnt].name+JSON.stringify(r.result));
            re.push({err:0,type:'dir',name:dirs[cnt].name,msg: JSON.stringify(r.result)})
        }
    }
    return re;
}

function *getFilesInList(list){
    var files = [];
    var dirs = [];
    for(var cnt in list){
        if(list[cnt].isFile==0){
            dirs.push(list[cnt]);
            var _id = ((typeof list[cnt]._id) == 'string')?list[cnt]._id:list[cnt]._id.toString();
            var listTmp = (yield getFiles(_id)).list;
            var ret = yield getFilesInList(listTmp);
            files = files.concat(ret.files);
            dirs = dirs.concat(ret.dirs);
        }else{
            files.push(list[cnt])
        }
    }
    return {files:files,dirs:dirs.reverse()};
}



function *ThirdInterface(){
    var params = yield parse(this);
    params = JSON.parse(rsaFun.decode(params.data));
    var pageData = JSON.parse(params.pageData);
    if(pageData.fun == 'getToken'){
        this.body =  yield ThirdInterfaceGetToken(params.bucketName,params.folderName,pageData.fileName);
    }else if(pageData.fun == 'upOneDown'){
        var backData = yield mongoService.getTmpFileInfo(pageData.backInfo.id);
        var size = pageData.backInfo.size;
        var hash = pageData.backInfo.hash;
        var re = yield saveDataToDb(backData,{size:size,hash:hash});
        //delete TmpData[pageData.backInfo.id];
        this.body = re;
    }
}

function *ThirdInterfaceGetToken(bucketName,folderName,fileName){
    if(!config.Domain[bucketName]){
        return {
            err:1,
            msg:'没有名为'+bucketName+'的Bucket！'
        };
    }
    if(!fileName){
        return {
            err:1,
            msg:'缺少fileName参数！'
        };
    }
    if(!folderName){
        return {
            err:1,
            msg:' FolderName is required!'
        }
    }
    //生成token
    var fileNameTmp = fileName.split('.');
    if(counterNum>100000){counterNum=0;}
    var fileNameKey = fileName.substring(0, fileName.length - fileNameTmp[fileNameTmp.length-1].length - 1)+'_'+(++counterNum)+'_'+(new Date()).getTime()+"."+fileNameTmp[fileNameTmp.length-1];
    var key = path.join(config.keyRoot,folderName,fileNameKey);
    var scope = bucketName+':'+key;
    var putPolicy = new qiniu.rs.PutPolicy(scope);
    putPolicy.expires = 120;
    var token = putPolicy.token();
    var backData = {
        fileName:fileNameKey,
        key:key,
        FolderName:folderName,
        Bucket_Name:bucketName
    };
    //TmpData[counterNum] = backData;
    var insertedId = yield mongoService.insertTmpFileInfo(backData);
    return {
        err:0,
        token:token,
        key:key,
        id:insertedId
    };

}

module.exports={
    getBucketData:getBucketData,
    getUpToken:getUpToken,
    ThirdInterface:ThirdInterface,
    getFiles:getFiles,
    saveDataToDb:saveDataToDb,
    delFiles:delFiles,
    makeDir:makeDir
};