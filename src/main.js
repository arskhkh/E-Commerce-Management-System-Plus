import Vue from 'vue'
import App from './App.vue'
import getElementUI from './plugins/element.js'
// import './plugins/element.js'
import router from './router'
// 导入全局样式表
import './assets/css/gobal.css'
//导入字体图标样式
import './assets/fonts/iconfont.css'
//导入树形插件
import ZKTable from 'vue-table-with-tree-grid'

import axios from 'axios'
//配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
//axios请求拦截器
axios.interceptors.request.use(config => {
  console.log(config);
  config.headers.Authorization = window.sessionStorage.getItem('token')
  //在最后必须return config
  return config
})
//在原型上挂载axios,全局能通过this.$http使用axios
Vue.prototype.$http = axios

Vue.config.productionTip = false

getElementUI()

//注册为全局可用组件
Vue.component('tree-table', ZKTable)

new Vue({
  router,  //挂载路由
  render: h => h(App)  //根组件app.vue
}).$mount('#app')
