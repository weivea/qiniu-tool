<style>
    /* 两列右侧自适应布局 */
    .g-bd1{margin:0 0 10px;}
    .g-sd1{position:relative;float:left;width:200px;margin-right:-200px;}
    .g-mn1{float:right;width:100%;}
    .g-mn1c{margin-left:201px;}


    .f-ib{
        vertical-align: middle;
    }
    .bucket-menu{
        padding: 10px;

    }
    .bucket-menu a{
        padding: 10px;
        border-bottom: 1px solid #ccc;
        transition-duration: 0.4s;
    }
    .bucket-menu a.chosen{
        background-color: #ddd;
    }
    .bucket-menu a:hover{
        background-color: #ddd;
    }

    .bucket-content{
        padding: 10px;
        border-left: 1px solid #eeefff;
    }
    .page-tit{
        margin-bottom: 10px;
        padding: 10px;
    }
    .page-tit .words{
        font-size: 16px;
        line-height: 1.6;
        border-bottom: 1px solid #eee;
        margin-bottom: 10px;
    }
    .page-tit .op-list button{
        margin-right: 10px;
    }

    .pwd-dir-button{
        padding: 10px;
        display: inline-block;
        min-width: 64px;
        text-align: center;
        transition-duration: 0.3s;
    }
    .pwd-dir-button:hover{
        background-color: #eeeeee;
    }
    .icon-middle{
        vertical-align: middle;
        cursor: pointer;
        color: #999999;
    }
    .icon-middle:hover{
        color: #333333;
    }

</style>

<template>
    <div class=" g-bd1 f-cb">
        <div class="g-sd1 bucket-menu">
            <ul>
                <li v-for="item in bucketDataList">
                    <a class="f-db f-toe {{(item.bucketName == bucket)?'chosen':''}}" v-link="{name:'s_resource', params: { bucket: item.bucketName }}">{{item.bucketName}}</a>
                </li>
            </ul>

        </div>
        <div class="g-mn1 ">
            <div class="g-mn1c bucket-content">

                <div class="page-tit mdl-shadow--2dp">
                    <p class="words">静态资源</p>
                    <div class="op-list ">
                        <button class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab" title="上传新文件" v-on:click="addFile">
                            <i class="material-icons">add</i>
                        </button>
                        <button class="mdl-button mdl-js-button mdl-button--fab mdl-button--mini-fab" title="删除所选文件" v-on:click="delFile">
                            <i class="material-icons">delete</i>
                        </button>

                        <button class="mdl-button mdl-js-button mdl-button--raised" v-on:click="makeDir">
                            新建文件夹
                        </button>
                    </div>
                </div>

                <div>
                    <span class="f-ib" v-for="dir in pwd">
                        <a class="pwd-dir-button" v-on:click="getFile(dir.folderId)">
                            {{dir.name}}
                        </a>/
                    </span>
                </div>
                <table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp" style="width: 100%">
                    <thead>
                    <tr>
                        <th class="mdl-data-table__cell--non-numeric"></th>
                        <th>文件名</th>
                        <th>大小</th>
                        <th>修改日期</th>
                    </tr>
                    </thead>
                    <tbody>
                    <tr v-for="item in fileList">
                        <td class="mdl-data-table__cell--non-numeric">
                            <input type="checkbox" v-model="item.isSelected">
                        </td>

                        <td v-if="item.isFile==1" title="{{item.info.url}}">

                            <!-- Left aligned menu below button -->

                            <a target="_blank" href="{{item.info.url}}">{{item.name}}</a>
                            <i class="material-icons icon-middle" title="Copy Url!" @click="clipboardFun(item.info.url)">assignment</i>


                        </td>
                        <td v-if="item.isFile==0">
                            <span  v-on:click="getFile(item._id);" class="f-csp">
                                <span class="f-ib"><i class="material-icons">folder_open</i></span>
                                <span class="f-ib">{{item.name}}</span>
                            </span>
                        </td>
                        <td>{{item.info.size}}</td>
                        <td>{{(new Date(item.opDate)).toLocaleString()}}</td>
                    </tr>

                    </tbody>
                </table>


                <div class="page-num">
                    <a class="pwd-dir-button" v-on:click="prevPage">
                        上一页
                    </a>
                    {{pageInfo.curPage}}/{{pageInfo.totalPage}}
                    <a class="pwd-dir-button" v-on:click="nextPage">
                        下一页
                    </a>
                </div>

                <uploader></uploader>
                <make-dir></make-dir>
            </div>

        </div>

    </div>
</template>
<script>
    import Clipboard from "../../lib/clipboard.js";
    export default {
        route:{
            data:function(transition){
                var this_ = this;
                var bucketTmp;
                var folderIdTmp;
                var bucketDataTmp;

                if(!this_.bucketData){
                    $.get("/api/getBucketData",{},function(data){
                        if(data.err){
                            alert(data.msg);
                        }else{
                            bucketDataTmp = data.bucketData;
                            var bucketDataList=[];
                            for(var key in bucketDataTmp){
                                bucketDataList.push({bucketName:key});
                                this_.bucketDataList = bucketDataList;
                            }

                            mixin();
                        }
                    });
                }else{
                    bucketDataTmp = this_.bucketData;
                    mixin();
                }
                function mixin(){
                    if(!transition.to.params.bucket){
                        bucketTmp = this_.bucketDataList[0].bucketName;
                    }else{
                        bucketTmp = transition.to.params.bucket;
                    }
                    folderIdTmp = bucketDataTmp[bucketTmp];

                    $.get("/api/getFiles",{folderId:folderIdTmp},function(data){
                        transition.next({
                            bucket:bucketTmp,
                            fileList : data.list,
                            folderId : data.folderId,
                            bucketData : bucketDataTmp,
                            pwd:data.pwd,
                            pageInfo:{
                                curPage:data.curPage,
                                totalPage:data.totalPage
                            }
                        })
                    });
                }


            }
        },
        data:function(){
            return{
                bucket:null,
                fileList:null,
                folderId:null,
                bucketData:null,
                bucketDataList:null,
                pwd:null,
                pageInfo:{
                    curPage:1,
                    totalPage:1
                },

                clipboardEle:null,
                clipboard:null
            };
        },
        created:function(){
            this.clipboardEle = document.createElement('div');
            this.clipboardEle.setAttribute('data-clipboard-text','.');
            this.clipboard = new Clipboard(this.clipboardEle);
            this.clipboard.on('success', function(e) {
                console.log(e);
                alert("成功复制到剪贴板！");
            });
            this.clipboard.on('error', function(e) {
                console.log(e);
            });
        },
        methods:{
            makeDir:function(event){
                this.$broadcast('makeDir',this.folderId);
            },
            addFile:function(event){
                //console.log(event);
                this.$broadcast('chooseFile','adf');
            },
            getFile:function(folderId,curPage){
                var this_ = this;
                //console.log(folderId);
                $.get("/api/getFiles",{folderId:folderId,curPage:curPage},function(data){
                    this_.fileList = data.list;
                    this_.folderId = data.folderId;
                    this_.pwd = data.pwd;
                    this_.pageInfo={
                        curPage:data.curPage,
                        totalPage:data.totalPage
                    }
                });

            },
            delFile: function (event) {
                var this_ = this;
                var delFileList=[];
                for(var ind in this.fileList){
                    if(this.fileList[ind].isSelected){
                        delFileList.push(this.fileList[ind]);
                    }
                }
                if(delFileList.length>0){
                    var cfm = window.confirm("确认删除？！？！");
                    if(cfm){
                        var this_ = this;
                        $.post("/api/delFile",{files:delFileList},function(data){
                            console.log(data);
                            this_.getFile(this_.folderId);
                        })
                    }
                }
                else{
                    window.alert("请选择文件")
                }
            },

            clipboardFun:function(text){
                console.log(text);
                this.clipboardEle.setAttribute('data-clipboard-text',text);
                this.clipboardEle.click();
            },
            prevPage:function(e){
                if(this.pageInfo.curPage == 1){return;}
                else{this.getFile(this.folderId,this.pageInfo.curPage - 1);}
            },
            nextPage:function(e){
                if(this.pageInfo.curPage == this.pageInfo.totalPage){return;}
                else{this.getFile(this.folderId,this.pageInfo.curPage + 1);}
            }
        },
        events: {
            'makeDirResult': function (result) {
                this.getFile(this.folderId);
            },
            'uploadDown':function(msg){
                this.getFile(this.folderId);
            }
        },
        components:{
            uploader:require('../wedgit/uploader.vue'),
            makeDir:require('./makeDir.vue')
        }
    }
</script>