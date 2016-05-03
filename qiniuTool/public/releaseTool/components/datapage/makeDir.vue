<style>
    .make-dir-box{
        position: fixed;
        width: 512px;
        top: 90px;
        left: 50%;
        margin-left: -256px;
    }
    .make-dir-box-transition{
        transition: all .5s ease;
    }
    .make-dir-box-enter, .make-dir-box-leave {
        opacity: 0;
        transform: translate3d(0, -50px, 0);
    }

    .mdl-card.make-dir-box{
        min-height: 100px;
    }
    .make-dir-box .mdl-card__actions{
        padding: 5px 16px;
        text-align: right;
    }
    .make-dir-box .mdl-card__actions .mdl-textfield{
        width: 100%;
    }

</style>

<template>

    <div v-show="show" class="make-dir-box demo-card-wide mdl-card mdl-shadow--6dp" transition="make-dir-box">
        <div class="mdl-card__title">
            <h2 class="mdl-card__title-text">新建文件夹</h2>
        </div>
        <div class="mdl-card__actions">
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <input class="mdl-textfield__input" type="text" id="sample3" placeholder="文件名" v-model="dirName">
                <!--<label class="mdl-textfield__label" for="sample3">文件名...</label>-->
            </div>
        </div>
        <div class="mdl-card__actions mdl-card--border">
            <div class="mdl-layout-spacer"></div>
            <a class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" v-on:click="sendFileName">
                确认
            </a>
            <a class="mdl-button  mdl-js-button mdl-js-ripple-effect" v-on:click="closeDialog">
                取消
            </a>
        </div>
        <div class="mdl-card__menu">
            <button class="mdl-button mdl-button--icon mdl-js-button mdl-js-ripple-effect" v-on:click="closeDialog">
                <i class="material-icons">close</i>
            </button>
        </div>
    </div>

</template>
<script>
    export default {
        data:function(){
            return{
                dirName:null,
                show:false,
                parentId:null
            }
        },
        events: {
            'makeDir': function (parentId) {
                this.show=true;
                this.parentId=parentId;
            }
        },
        methods:{
            closeDialog:function(event){
                this.show=false;
            },
            sendFileName:function(event){
                var this_ = this;
                if(!this.dirName){
                    alert("请输入文件名！");
                    return;
                }
                $.post("/api/makeDir",{dirName:this_.dirName,parentId:this_.parentId},function(data){
                    if(data.err){
                        alert(data.msg);
                    }else{
                        this_.show=false;
                        this_.$dispatch('makeDirResult',true);
                    }
                });


            }
        }

    }
</script>