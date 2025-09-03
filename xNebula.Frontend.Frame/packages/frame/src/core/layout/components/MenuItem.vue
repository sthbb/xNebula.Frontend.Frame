<!--
 * @Author: Huangjs
 * @Date: 2022-10-25 14:30:25
 * @LastEditors: Huangjs
 * @LastEditTime: 2022-11-21 08:56:15
 * @Description: ******
-->
<template>
  <template v-for="menu in menus" :key="menu.id">
    <template v-if="menu.children && menu.children.length > 0">
      <el-sub-menu :key="menu.id" :index="menu.id">
        <template #title>
          <i :class="menu.icon || 'fa fa-home'" />
          <span>{{ t(menu.i18nKey?.[0], menu.i18nKey?.[1]) }}</span>
        </template>
        <menu-item
          :preview="preview"
          :menus="menu.children"
          :level="level + 1" />
      </el-sub-menu>
    </template>
    <template v-else>
      <el-menu-item
        :class="{
          collapsed: isCollapse,
        }"
        :key="menu.id"
        :index="menu.id"
        @click="() => menuClick(!menu.children ? menu.path || '' : '')">
        <i :class="menu.icon || (level === 1 ? 'fa fa-home' : '')" />
        <template #title>
          <router-link
            :class="{
              title: true,
              [cls('a-title')]: true,
            }"
            :to="preview ? '' : { path: menu.path }">
            <span>{{ t(menu.i18nKey?.[0], menu.i18nKey?.[1]) }}</span>
            <el-icon
              v-if="!menu.children"
              class="favorite"
              @click.prevent.stop="() => $emit('favorite', menu.id || '')">
              <Unfavorite v-if="!menu.favor" />
              <Favorite class="active" v-else />
            </el-icon>
          </router-link>
        </template>
      </el-menu-item>
    </template>
  </template>
</template>

<script setup lang="ts">
import { router as useRouter } from '@@/router';
import { i18n as useI18n } from '@@/i18n';
import { usePrefixCls } from '@@/hooks';
import { authority, collapse } from '@@/store';
import { Favorite, Unfavorite } from '@@/icon';

const cls = usePrefixCls();
const router = useRouter();
const { t } = useI18n();
defineOptions({
  name: 'MenuItem',
});
const props = withDefaults(
  defineProps<{
    preview?: boolean;
    menus?: authority.AuthMenu[];
    level?: number;
  }>(),
  {
    preview: () => false,
    level: () => 1,
    menus: () => [],
  },
);
defineEmits<{
  (e: 'favorite', id: string): void;
}>();

const { isCollapse } = collapse;

const menuClick = (path: string) => {
  if (!props.preview && props.level === 1 && isCollapse && path) {
    router.push({ path });
  }
};
</script>
