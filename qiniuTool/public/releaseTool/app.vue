<style>
.view {
  transition: all .5s ease;
}
.test-enter, .test-leave {
  opacity: 0;
  transform: translate3d(10px, 0, 0);
}
[v-cloak] {
  display: none;
}


</style>

<template>

  <!-- Always shows a header, even in smaller screens. -->
  <div class="mdl-layout mdl-js-layout mdl-layout--fixed-header">
    <header class="mdl-layout__header">
      <div class="mdl-layout__header-row">
        <!-- Title -->
        <span class="mdl-layout-title">小赢七牛云 {{userName}}</span>
        <!-- Add spacer, to align navigation to the right -->
        <div class="mdl-layout-spacer"></div>
        <!-- Navigation. We hide it in small screens. -->
        <nav class="mdl-navigation mdl-layout--large-screen-only">
          <a class="mdl-navigation__link " v-link="{path:'/s_resource'}">资源库</a>
          <a v-if="isLoginFlag" class="mdl-navigation__link " v-link="{path:'/user'}">用户管理</a>
          <a v-if="isLoginFlag"  class="mdl-navigation__link " v-on:click="signOut">退出</a>
        </nav>

      </div>
    </header>
    <div class="mdl-layout__drawer">
      <span class="mdl-layout-title">小赢七牛云 {{userName}}</span>
      <nav class="mdl-navigation">

        <a class="mdl-navigation__link " v-link="{path:'/s_resource'}">资源库</a>
        <a v-if="isLoginFlag" class="mdl-navigation__link " v-link="{path:'/user'}">用户管理</a>
        <a v-if="isLoginFlag" class="mdl-navigation__link " v-on:click="signOut">退出</a>
      </nav>
    </div>
    <main class="mdl-layout__content">
      <div class="page-content ">
        <router-view class="view" transition="test" transition-mode="out-in" keep-alive></router-view>
      </div>
    </main>
  </div>




</template>

<script>
export default {
  data :function() {
    return {
      isLoginFlag:false,
      userName:$(".appUserName").attr('data-flag')
    }
  },
  ready:function(){
    var this_ = this;
    if($(".appLoginFlag").attr('data-flag') == '1'){
      this_.isLoginFlag = true;
      //window.location.href = '/release#!/s_resource';
    }else{
      this_.isLoginFlag = false;
      //window.router.go('/login');

    }
//    $.get('/isLogin',null, function (data) {
//      if(!data.isLogin){
//
//      }else{
//        this_.isLoginFlag = true;
//
      window.router.beforeEach(function (transition) {
        if($(".mdl-layout__obfuscator").length>0 && $(".mdl-layout__obfuscator").attr("class").indexOf('is-visible') != -1) {
          $(".mdl-layout__obfuscator").trigger('click');
        }

        if (transition.to.path != '/login' && !this_.isLoginFlag) {
          transition.abort();
        } else {
          transition.next();
        }
      });
//    });



  },
  methods:{
    signOut:function(){
      var this_ = this;
      $.post("/user/signOut",null,function(data){
        if(data.err){
          alert(data.msg);
        }else{
          this_.isLoginFlag = false;
          this_.userName = null;
          window.router.go('/login');
        }
      });
    }
  },

  components:{
    //'nav-menu':require('./components/wedgit/nav-menu.vue')

  }
}
</script>
