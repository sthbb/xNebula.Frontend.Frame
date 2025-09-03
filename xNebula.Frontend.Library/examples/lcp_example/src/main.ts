/*
 * @Author: Huangjs
 * @Date: 2024-03-06 16:31:37
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-19 13:25:00
 * @Description: ******
 */
import './vtable.extend';
import './monaco';
import { createApp } from 'vue';
import App from './App.vue';
import settings from './settings';
import './style.css';

const app = createApp(App);
app.use(settings);
app.mount('#app');
