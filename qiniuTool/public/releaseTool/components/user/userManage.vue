<style>
    .user-manage{
        width: 98%;
        margin: 50PX auto;
        max-width: 600px;
    }
    .user-manage > h2{
        font-size: 20px;
        font-weight: normal;
    }
    .user-manage table{
        width: 100%;
    }
    .add-user-box{
        width: 100%;
        text-align: center;
    }

    .add-user-box-transition{
        transition: all .5s ease;
    }
    .add-user-box-enter, .add-user-box-leave {
        opacity: 0;
        transform: translate3d(0, -50px, 0);
    }
</style>
<template>
    <div class="user-manage">
        <h2>
            用户管理
        </h2>
        <table class="mdl-data-table mdl-js-data-table mdl-shadow--2dp">
            <thead>
                <tr>
                    <th class="mdl-data-table__cell--non-numeric">用户</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in userList">
                    <td class="mdl-data-table__cell--non-numeric">{{user.name}}</td>
                    <td>
                        <button class="mdl-button mdl-js-button mdl-button--icon" v-on:click="delUser(user._id)">
                            <i class="material-icons">delete</i>
                        </button>
                    </td>
                </tr>
                <tr>
                    <td colspan="2" style="text-align: center">
                        <button class="mdl-button mdl-js-button mdl-button--icon" v-on:click="addUser">
                            <i class="material-icons">add</i>
                        </button>
                    </td>
                </tr>
            </tbody>
        </table>

        <div v-show="showAddBox" class="add-user-box demo-card-wide mdl-card mdl-shadow--2dp"  transition="add-user-box">
            <form v-on:submit="addUserFun">
                <div class="mdl-card__title">
                    <h2 class="mdl-card__title-text">添加账户</h2>
                </div>
                <div class="mdl-card__actions">
                    <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                        <input class="mdl-textfield__input" type="text" maxlength="50" id="userName" placeholder="用户名" v-model="newer.userName">

                    </div>
                    <br>
                    <br>
                    <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                        <input class="mdl-textfield__input" type="text" maxlength="50" id="password" placeholder="密码" v-model="newer.password">
                    </div>
                </div>
                <div class="mdl-card__actions mdl-card--border">
                    <div class="mdl-layout-spacer"></div>
                    <input type="submit" class="mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect" value="提交">
                    <a class="mdl-button mdl-js-button mdl-js-ripple-effect" v-on:click="cancelOption">取消</a>
                </div>
            </form>
        </div>
    </div>
</template>
<script>
    import MD5 from '../../lib/md5Fun.js'
    export default {
        data:function(){
            return {
                showAddBox:false,
                newer:{
                    userName:null,
                    password:null,
                },
                userList:[]
            }
        },
        created:function(){
            this.getUsers();
        },
        methods: {
            addUser:function(){
                this.showAddBox = !this.showAddBox;
            },
            addUserFun:function(e){
                e.preventDefault();
                if(!this.newer.userName || !this.newer.password){
                    alert('请输入完整的用户名和密码');
                    return;
                }
                var askData = {
                    userName:this.newer.userName,
                    password:MD5(this.newer.password)
                };
                var this_ = this;
                $.post('/user/add',askData,function(data){
                    if(data.err){
                        alert(data.msg);
                    }else{
                        this_.showAddBox = false;
                        this_.newer.userName=null;
                        this_.newer.password = null;
                        this_.getUsers();
                    }
                });
            },
            cancelOption:function(){
                this.showAddBox = false;
                this.newer.userName=null;
                this.newer.password = null;
            },
            delUser:function(id){
                var confirm = window.confirm("确定删除该用户？");
                if(!confirm){
                    return;
                }
                var this_ = this;
                $.post('/user/del',{userId:id},function(data){
                    if(data.err){
                        alert(data.msg);
                    }else{
                        this_.getUsers();
                    }
                });
            },
            getUsers:function(){
                var this_ = this;
                $.post('/user/getAll',null,function(data){
                    if(data.err){
                        alert(data.msg);
                    }else{
                        this_.userList = data.users;
                    }
                });
            }
        }
    }
</script>