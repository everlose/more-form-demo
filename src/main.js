import Vue from 'vue'
import App from './App.vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-default/index.css';

Vue.use(ElementUI);

let vm = new Vue({
    el: '#app',
    render: h => h(App)
});

console.log(vm);
