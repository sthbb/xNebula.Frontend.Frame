<!--
 * @Author: Huangjs
 * @Date: 2022-10-25 14:30:25
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-24 09:46:12
 * @Description: ******
-->
<template>
  <el-container :class="cls('base-layout')">
    <el-aside :class="cls('aside')" width="auto">
      <router-link
        :class="cls('logo')"
        :to="isPreview ? '' : '/'"
        :title="`${title} ${version}`">
        <img :src="logoUrl" />
        <drawer-transition>
          <div class="title" v-show="!isCollapse">
            <div class="name">
              {{ title }}
            </div>
            <div class="version">{{ version }}</div>
          </div>
        </drawer-transition>
      </router-link>
      <!-- <div :class="cls('tab-menus')">
        <left-menu
          :preview="isPreview"
          :menus="allMenus" />
      </div> -->
      <el-tabs type="border-card" :class="cls('tab-menus')">
        <el-tab-pane>
          <template #label>
            <span class="tabs-label">
              <el-icon class="all"><Menus /></el-icon>
              <drawer-transition>
                <span v-show="!isCollapse">{{
                  t('Frame', 'layout.allMenu')
                }}</span>
              </drawer-transition>
            </span>
          </template>
          <left-menu
            :preview="isPreview"
            :menus="allMenus"
            @favorite="favorite" />
        </el-tab-pane>
        <el-tab-pane>
          <template #label>
            <span class="tabs-label">
              <el-icon class="favorite"><Favorite class="favorite" /></el-icon>
              <drawer-transition>
                <span v-show="!isCollapse">{{
                  t('Frame', 'layout.myMenu')
                }}</span>
              </drawer-transition>
            </span>
          </template>
          <left-menu
            :preview="isPreview"
            :menus="favMenus"
            @favorite="favorite" />
        </el-tab-pane>
      </el-tabs>
      <div :class="cls('copyright')">
        <div>{{ t('Frame', 'company') }}</div>
        <drawer-transition>
          <div class="right" v-show="!isCollapse">
            {{ t('Frame', 'copyright') }}
          </div>
        </drawer-transition>
      </div>
    </el-aside>
    <el-container>
      <el-header :class="cls('header')">
        <top-header :preview="isPreview" :docUrl="docUrl" />
        <div :class="cls('tag-bread')">
          <tag-view :preview="isPreview" @change="tagChange" />
          <bread-crumb />
        </div>
      </el-header>
      <el-main :class="cls('main')">
        <router-view v-if="!isRefresh && !isPreview" v-slot="{ Component }">
          <transition :name="cls('page')" mode="out-in">
            <keep-alive :include="cacheKeys">
              <component :is="Component" />
            </keep-alive>
          </transition>
        </router-view>
        <slot v-else-if="isPreview"></slot>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, shallowRef, useSlots, onMounted, onUnmounted } from 'vue';
import { i18n as useI18n } from '@@/i18n';
import { handleView } from '@@/utils';
import { usePrefixCls } from '@@/hooks';
import { theme, authority, refresh, collapse } from '@@/store';
import { Menus, Favorite } from '@@/icon';
import { getTheme /* , getFavMenus, addFavMenu, delFavMenu */ } from '@@/api';
import LeftMenu from './components/LeftMenu.vue';
import TopHeader from './components/TopHeader.vue';
import TagView from './components/TagView.vue';
import BreadCrumb from './components/BreadCrumb.vue';
import DrawerTransition from './components/DrawerTransition.vue';

const cls = usePrefixCls();
const { t } = useI18n();
defineOptions({
  name: 'BaseLayout',
  inheritAttrs: false,
});
defineProps<{
  title: string;
  version: string;
  logoUrl: string;
  docUrl: string;
}>();
defineSlots<{
  default(): any;
}>();
const solts = useSlots();
const isPreview = computed(() => !!solts.default);

const { isCollapse, setCollapse } = collapse;
const resize = () => {
  // 小于 md 的尺寸, 收起
  if (document.body.clientWidth < 992) {
    setCollapse(false);
  }
};
const { isRefresh } = refresh;

// 菜单处理
const favMenus = shallowRef<authority.AuthMenu[]>([]);
const allMenus = computed<authority.AuthMenu[]>(() =>
  authority.auth.value.menus.map((menu) => ({
    ...menu,
    favor: favMenus.value.some((m) => m.id === menu.id),
  })),
);
const favorite = (id: string) => {
  const current = allMenus.value.find((m) => m.id === id) || {};
  const find = favMenus.value.find((m) => m.id === id);
  favMenus.value = !find
    ? [
        ...favMenus.value,
        {
          ...current,
          favor: true,
        },
      ]
    : favMenus.value.filter((m) => m.id !== id);
  // find ? delFavMenu(id) : addFavMenu(id);
};

const cacheKeys = shallowRef<string[]>([]);
const tagChange = (tags: authority.AuthMenu[]) => {
  cacheKeys.value = tags.map((tag) => handleView(tag.view).key);
};

// 主题获取
const { themeStyle, themeValues, setTheme, setDefaultTheme } = theme;
onMounted(() => {
  if (!isPreview.value) {
    document.addEventListener('resize', resize);
    // 这里加载主题的时候是不是需要loading, 否则主题会闪一下
    getTheme().then((o: string) => {
      try {
        const { themeStyle: style, ...restValues } = JSON.parse(o);
        setDefaultTheme(style, restValues);
        themeStyle.value = style;
        themeValues.value = restValues;
      } catch (_e) {
        /* empty */
      }
      setTheme(cls(''));
    });
    // getFavMenus().then((ids) => {});
    const ids: string[] = [];
    favMenus.value = ids.map((id) => {
      const menu = authority.auth.value.menus.find((m) => m.id === id) || {};
      return {
        ...menu,
        favor: true,
      };
    });
  }
});
onUnmounted(() => {
  if (!isPreview.value) {
    document.removeEventListener('resize', resize);
  }
});
</script>
