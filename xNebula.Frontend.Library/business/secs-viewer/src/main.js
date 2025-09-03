import { createApp } from 'vue';
import './style/index.css';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from '@/router';
import elementPlus from 'element-plus';

function bootstrap(app) {
  app.use(elementPlus);
  app.use(router);
  app.mount('#app');
}

bootstrap(createApp(App));
