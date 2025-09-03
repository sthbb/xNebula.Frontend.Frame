import { createWebHashHistory, createRouter } from 'vue-router';

import EditView from '@/views/pages/edit.vue';
import View from '@/views/pages/view.vue';

const routes = [
  { path: '/', redirect: '/edit' },
  { path: '/edit', component: EditView },
  { path: '/view', component: View },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
