<style>
    .login-box {
        position: fixed;
        width: 512px;
        top: 90px;
        left: 50%;
        margin-left: -256px;
        text-align: center;
    }
</style>
<template>
    <div class="login-box demo-card-wide mdl-card mdl-shadow--2dp" >
        <form v-on:submit="loginFun">
        <div class="mdl-card__title">
            <h2 class="mdl-card__title-text">登录</h2>
        </div>
        <div class="mdl-card__actions">
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <input class="mdl-textfield__input" type="text" maxlength="50" id="userName" placeholder="用户名" v-model="userName">
                <!--<label class="mdl-textfield__label" for="userName">用户名</label>-->
            </div>
            <br>
            <br>
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                <input class="mdl-textfield__input" type="password" maxlength="50" id="password" placeholder="密码" v-model="password">
                <!--<label class="mdl-textfield__label" for="password">密码</label>-->
            </div>
        </div>
        <div class="mdl-card__actions mdl-card--border">
            <div class="mdl-layout-spacer"></div>
            <input type="submit" class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" value="提交">

        </div>
        </form>
    </div>
</template>
<script>
    import MD5 from '../lib/md5Fun.js'
    export default {
        data: function () {
            return{
                userName:null,
                password:null
            }
        },
        created:function(){
            if(this.$parent.isLoginFlag == true){
                window.router.go('/s_resource');

            }
        },
        methods:{
            loginFun:function(e){
                e.preventDefault();
                var this_ = this;
                if(!this_.userName || !this_.password){
                    alert("请输入用户名或密码");
                }else{
                    var askData = {
                        userName:this_.userName,
                        password:MD5(this_.password)
                    };

                    $.post('/user/login',askData,function(data){
                        if(data.err){
                            alert(data.msg);
                        }else{
                            this_.$parent.isLoginFlag = true;
                            window.router.go('/s_resource');
                        }
                    });
                }
                //console.log("aaa");
            }
        }
    }

</script>