import { type App, h, defineComponent } from 'vue';
import { XRenderer } from '@lcp/xrenderer';
import { WidgetsPlugin as VTableWidgetsPlugin } from '@xnebula/vtable-lcp';
import { WidgetsPlugin as VChartWidgetsPlugin } from '@xnebula/vchart-lcp';
import { XComponentsPlugin } from '@lcp/xcomponents';
import '@lcp/xcomponents/dist/style.css';
import { WidgetsPlugin as BaseWidgetsPlugin } from '@lcp/xwidgets';
import '@lcp/xwidgets/dist/style.css';
import { /* vueI18n, */ vueRouter } from '@xnebula/router';
import Designer from './lcp-designer.vue';
import Renderer from './lcp-renderer.vue';

export default {
  install(app: App) {
    // 安装通用组件库
    app.use(XComponentsPlugin);
    // 安装基本部件库
    app.use(BaseWidgetsPlugin);
    // 安装 vtable 部件库
    app.use(VTableWidgetsPlugin);
    // 安装 vchart 部件库
    app.use(VChartWidgetsPlugin);
    // 安装渲染器
    app.use(XRenderer);
    // 安装路由，不安装就报错，未解耦？
    app.use(
      vueRouter.createRouter({
        history: vueRouter.createWebHashHistory(),
        routes: [
          {
            name: 'renderer',
            path: '/renderer',
            component: defineComponent({
              name: 'x-renderer',
              render: () => h(Renderer),
            }),
          },
          {
            name: 'designer',
            path: '/designer',
            component: defineComponent({
              name: 'x-designer',
              render: () => h(Designer),
            }),
          },
          {
            name: 'blank',
            path: '/:pathMatch(.*)*',
            component: defineComponent({
              name: 'x-blank',
              render: () =>
                h('h1', { style: { textAlign: 'center' } }, [
                  h('span', {}, ' 空页面 '),
                  h('a', { href: '#/renderer' }, ' 渲染器 '),
                  h('a', { href: '#/designer' }, ' 设计器 '),
                ]),
            }),
          },
        ],
      }),
    );
    // 安装多语言，不安装就报错，未解耦？
    /* app.use(
      vueI18n.createI18n({
        legacy: false,
        allowComposition: true,
        fallbackLocale: 'zh_CN',
        locale: 'zh_CN',
        messages: {
          zh_CN: {
            click_me: '快来点我吧',
            this_is_a_dialog: '这是一个弹框',
            close: '关闭',
          },
          en: {
            click_me: 'click me',
            this_is_a_dialog: 'this is a dialog',
            close: 'close',
          },
        },
      }),
    ); */
  },
};
