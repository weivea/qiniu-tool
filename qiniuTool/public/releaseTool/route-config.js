export function configRouter (router) {

  // normal routes
  router.map({
     //basic example
    '/s_resource': {
      component: require('./components/datapage/index.vue')
    },
    '/s_resource/:bucket': {
      name:'s_resource',
      component: require('./components/datapage/index.vue')

    },

    '/login': {
      component: require('./components/login.vue')
    },
    '/user': {
      component: require('./components/user/userManage.vue')
    },
    '/about': {
      component: require('./components/about.vue')
    }

  });

  //if($(".appLoginFlag").attr('data-flag') == '1'){
  //  router.redirect({
  //    '/': '/s_resource'
  //  });
  //}else{
  //  router.redirect({
  //    '*': '/login'
  //  });
  //}

  // redirect
  router.redirect({
      '/': '/login'
  });


}
