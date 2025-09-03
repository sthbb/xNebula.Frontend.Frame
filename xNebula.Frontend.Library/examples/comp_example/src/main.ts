/*
 * @Author: Huangjs
 * @Date: 2024-03-06 16:31:37
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-19 13:25:00
 * @Description: ******
 */
// import './default-passive-events';
import { createApp } from 'vue';
import { XCompPlugin } from '@xnebula/components';
import '@xnebula/components/dist/index.css';
import App from './App.vue';
// import register from './register';
// import register from 'register:components';

const app = createApp(App);

app.use(XCompPlugin);
// register(app);
app.mount('#app');
