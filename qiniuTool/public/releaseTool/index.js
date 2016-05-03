// warning: vue-router requires Vue 0.12.10+
//require("./style/material.indigo-pink.min.css");
//require("./style/material-icons.css");
//require("./lib/material.min.js");
//require("./style/global.css");

import $ from 'jquery'
import Vue from 'vue'
import VueRouter from 'vue-router'
import { configRouter } from './route-config'
//require('es6-promise').polyfill()
window.$  = $;
// install router
Vue.use(VueRouter);

// create router
const router = new VueRouter({
  history: true,
  saveScrollPosition: true
});


// configure router
configRouter(router);


window.router = router;
// boostrap the app
const App = Vue.extend(require('./app.vue'));
router.start(App, 'app');



// just for debugging

