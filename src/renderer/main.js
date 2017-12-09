import Vue from 'vue'

import App from './App'
import axios from 'axios'
import router from './router'

import BootstrapVue from 'bootstrap-vue'
Vue.use(BootstrapVue)

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  template: '<App/>'
}).$mount('#app')
