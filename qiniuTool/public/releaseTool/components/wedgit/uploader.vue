<style>
    .uploader-vue{
        position: fixed;
        top: 70px;
        right: 5px;
        width: 400px;
        padding: 5px;
        background-color: #efefef;
        transition-duration: 0.4s;
    }
    .uploader-vue-transition{
        transition: all .5s ease;
    }
    .uploader-vue-enter, .uploader-vue-leave {
        opacity: 0;
        transform: translate3d(300px, 0, 0);
    }
    .uploader-vue .tit{
        line-height: 2;
        font-size: 18px;
        text-align: center;
        border-bottom: 1px solid #cecede;
    }
    .uploader-vue li{
        height: 40px;
        line-height: 40px;
        border-bottom: 1px solid #ddd;
        text-align: center;
        margin: 3px 0;
    }
    .uploader-vue .process{
        position: absolute;
        height: 100%;
        top: 0;
        left: 0;
        background-color: rgba(55,170,142,.4);
    }

</style>
<template>
    <div v-show="workingFlag" class="uploader-vue mdl-shadow--4dp" transition="uploader-vue">
        <div class="tit">
            文件上传中
        </div>
        <ul>
            <li class="f-pr f-toe" v-for="item in uploadingList">
                    {{item.name}}
                <div class="process" :style="{width: item.process}"></div>
            </li>
        </ul>
        <input class="f-dn file-input" type="file" v-on:change="inputFiles" multiple>
    </div>

</template>
<script>
    export default {
        data:function(){
            return {
                workingFlag:false,
                uploadingList:[],
                fileList:[],
                backData:null,
                alreadyHas:false
            }
        },
        events: {
            'chooseFile': function (msg) {
                //console.log(this.$el);
                //
                $(this.$el).find('.file-input').click();

            }
        },
        methods:{
            inputFiles:function(event){
                //console.log("aaaaaa");
                if(event.currentTarget.files && event.currentTarget.files.length>0){
                    for(var ind= 0; ind < event.currentTarget.files.length;ind++){
                        this.fileList.push(event.currentTarget.files[ind]);
                        this.uploadingList.push({
                            name:event.currentTarget.files[ind].name,
                            size:event.currentTarget.files[ind].size,
                            process:0
                        });
                    }
                    if(!this.workingFlag){
                        this.beginUploading();
                    }
                }
            },
            beginUploading:function(){
                this.workingFlag = true;
                var this_ = this;
                var fileName = this.uploadingList[0].name;
                $.get('/api/getUpToken',{
                    bucket:this_.$parent.bucket,
                    folderId:this_.$parent.folderId,
                    fileName:fileName
                },function(data){
                   //console.log(data);
                    if(data.err){
                        if(!data.alreadyHas){
                            alert(data.msg);
                        }else{
                            var result = window.confirm("改文件目录下已存在相同文件名的文件，是否覆盖？");
                            if(result){
                                this_.alreadyHas = true;
                                this_.Qiniu_upload(this_.fileList[0], data.token, data.key);
                            }else{
                                this_.alreadyHas = false;
                                this_.judgeUploadNextOne();
//                                this_.fileList.shift();
//                                this_.uploadingList.shift();
//                                if(this_.fileList.length>0){
//                                    this_.beginUploading();
//                                }else{
//                                    this_.workingFlag = false;
//                                }
                            }
                        }
                    }else{
                        this_.backData = data.backData;
                        this_.Qiniu_upload(this_.fileList[0], data.token, data.key);
                    }
                });

            },

            Qiniu_upload: function (f, token, key) {
                var this_ = this;
                var xhr = new XMLHttpRequest();
                xhr.open('POST', "http://upload.qiniu.com", true);
                var formData, startDate;
                formData = new FormData();
                if (key !== null && key !== undefined) formData.append('key', key);
                formData.append('token', token);
                formData.append('file', f);
                var taking;
                xhr.upload.addEventListener("progress", function(evt) {
                    if (evt.lengthComputable) {
                        var percentComplete = Math.round(evt.loaded * 100 / evt.total);
                        this_.uploadingList[0].process = percentComplete+'%';
                    }
                }, false);

                xhr.onreadystatechange = function(response) {
                    if (xhr.readyState == 4 && xhr.status == 200 && xhr.responseText != "") {
                        var blkRet = JSON.parse(xhr.responseText);
                        //console && console.log(blkRet);

                        if(this_.alreadyHas){
                            this_.alreadyHas = false;
                            this_.fileList.shift();
                            this_.uploadingList.shift();
                            if(this_.fileList.length>0){
                                this_.beginUploading();
                            }else{
                                this_.workingFlag = false;
                            }
                        }else{
                            $.post("/api/qiniuUploadDone",{
                                backData:this_.backData,
                                backInfo:{
                                    hash:blkRet.hash,
                                    size:this_.uploadingList[0].size
                                }
                            },function(data){
                                //console.log(data);
                                if(data.err){
                                    alert(data.msg);
                                }else{
                                    this_.judgeUploadNextOne();
                                }

                            });
                        }

                    } else if (xhr.status != 200 && xhr.responseText) {

                    }
                };
                xhr.send(formData);
            },
            judgeUploadNextOne:function(){
                var this_ = this;
                this_.fileList.shift();
                this_.uploadingList.shift();
                if(this_.fileList.length>0){
                    this_.beginUploading();
                }else{
                    this_.workingFlag = false;
                    this_.$dispatch('uploadDown','');
                }
            }
        }
    }
</script>