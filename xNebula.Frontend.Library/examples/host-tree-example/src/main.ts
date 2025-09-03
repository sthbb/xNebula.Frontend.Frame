/*
 * @Author: Huangjs
 * @Date: 2024-01-31 17:51:41
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-02-06 16:42:47
 * @Description: ******
 */
import { createApp } from 'vue';
import { XCompPlugin } from '@xnebula/components';
import '@xnebula/components/dist/index.css';
import HostTree from '@xnebula/host-tree';
import '@xnebula/host-tree/dist/index.css';
import App from './App.vue';

const app = createApp(App);
app.use(XCompPlugin);
app.use(HostTree);
app.mount('#app');
