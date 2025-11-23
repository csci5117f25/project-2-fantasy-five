import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import firebaseApp from './firebase'
import { VueFire, VueFireAuth } from 'vuefire'


// bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const app = createApp(App)

app.use(
  VueFire,
  {
    firebaseApp,
    modules: [VueFireAuth()]
  }
)

app.use(router)

app.mount('#app')
