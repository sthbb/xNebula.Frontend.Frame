<!--
 * @Author: Huangjs
 * @Date: 2022-10-25 14:30:25
 * @LastEditors: Huangjs
 * @LastEditTime: 2022-11-21 08:56:15
 * @Description: ******
-->
<template>
  <el-tabs :class="cls('tag-view')" type="card" v-model="route.meta.id">
    <el-tab-pane
      v-for="tag in [...affixTags, ...plainTags]"
      :key="tag.id"
      :name="tag.id">
      <template #label>
        <router-link
          :class="['tag', preview ? 'stop' : '']"
          :to="{ path: tag.path }"
          @contextmenu.prevent="(e: MouseEvent) => showContextMenu(e, tag)">
          <span class="img-icon"></span>
          <span>{{ t(tag.i18nKey?.[0], tag.i18nKey?.[1]) }}</span>
          <el-icon
            v-if="!tag.affix && !isOnlyDefTag"
            class="close-icon"
            @click.prevent.stop="closeTag(tag)">
            <Close />
          </el-icon>
        </router-link>
      </template>
    </el-tab-pane>
  </el-tabs>
  <transition :name="cls('tag-contextmenu')">
    <ul
      v-show="menuVisible"
      :style="`left: ${menuPosition.x}px; top: ${menuPosition.y}px`"
      :class="[cls('tag-contextmenu'), 'el-dropdown__popper']">
      <li v-if="selectedTag.id === route.meta.id" @click="refreshTag()">
        <el-icon><Refresh /></el-icon>
        <span>{{ t('Frame', 'layout.refresh') }}</span>
      </li>
      <li
        v-if="!selectedTag.affix && !isOnlyDefTag"
        @click="() => closeTag(selectedTag)">
        <el-icon><CircleClose /></el-icon>
        <span>{{ t('Frame', 'layout.closeCurrent') }}</span>
      </li>
      <li v-if="hasOtherTags" @click="() => closeOtherTags(selectedTag)">
        <el-icon><Minus /></el-icon>
        <span>{{ t('Frame', 'layout.closeOther') }}</span>
      </li>
      <li v-if="hasLeftTags" @click="() => closeLeftTags(selectedTag)">
        <el-icon><DArrowLeft /></el-icon>
        <span>{{ t('Frame', 'layout.closeLeft') }}</span>
      </li>
      <li v-if="hasRightTags" @click="() => closeRightTags(selectedTag)">
        <el-icon><DArrowRight /></el-icon>
        <span>{{ t('Frame', 'layout.closeRight') }}</span>
      </li>
      <li v-if="hasAllTags" @click="() => closeAllTags()">
        <el-icon><Close /></el-icon>
        <span>{{ t('Frame', 'layout.closeAll') }}</span>
      </li>
    </ul>
  </transition>
</template>

<script setup lang="ts">
import {
  shallowRef,
  ref,
  watch,
  nextTick,
  computed,
  onMounted,
  onUnmounted,
} from 'vue';
import { getDefPath, router as useRouter, route as useRoute } from '@@/router';
import { storage } from '@xnebula/utils';
import { i18n as useI18n } from '@@/i18n';
import { usePrefixCls, useConfig } from '@@/hooks';
import { authority, refresh } from '@@/store';
import { TEMP_MENU_TAG } from '@@/utils';

const cls = usePrefixCls();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const defPath = getDefPath(useConfig()?.value || {});

defineOptions({
  name: 'TagView',
});
const props = withDefaults(
  defineProps<{
    preview?: boolean;
  }>(),
  {
    preview: () => false,
  },
);
const emits = defineEmits<{
  (e: 'change', tags: authority.AuthMenu[]): void;
}>();
const menuTags = computed<authority.AuthMenu[]>(() =>
  authority.auth.value.menuRoutes.map((m) => ({ ...m })),
);
const affixTags = shallowRef<authority.AuthMenu[]>([]);
const plainTags = shallowRef<authority.AuthMenu[]>([]);
const activeTag = () => {
  if (
    !affixTags.value.find((_t) => _t.id === route.meta.id) &&
    !plainTags.value.find((_t) => _t.id === route.meta.id)
  ) {
    const active =
      plainTags.value[plainTags.value.length - 1] ||
      affixTags.value[affixTags.value.length - 1];
    // 当前的被关闭, 就打开最后一个, 没有就跳到主页
    if (active?.path) {
      openTag(active);
      router.push(active.path);
    } else {
      if (route.path === defPath) {
        // 因为有 isOnlyDefTag 的判断, 这部分代码基本是走不到的
        const defId = menuTags.value.find((m) => m.path === defPath)?.id;
        if (defId) {
          openTag(defId);
        }
      }
      router.push(defPath);
    }
  }
};
// 当前路由正好在默认路由(home), 并且标签也只剩下这一个了
const isOnlyDefTag = computed(() => {
  return (
    affixTags.value.length === 0 &&
    plainTags.value.length === 1 &&
    plainTags.value[0].id === route.meta.id &&
    route.path === defPath
  );
});
const openTag = (tag: string | authority.AuthMenu) => {
  let _tag =
    typeof tag === 'string' ? menuTags.value.find((m) => m.id === tag) : tag;
  if (
    _tag &&
    !affixTags.value.find((_t) => _t.id === _tag.id) &&
    !plainTags.value.find((_t) => _t.id === _tag.id)
  ) {
    plainTags.value = [...plainTags.value, _tag];
  }
};
const closeTag = (tag: authority.AuthMenu) => {
  if (affixTags.value.find((_t) => _t.id === tag.id)) {
    return;
  }
  const index = plainTags.value.findIndex((_t) => _t.id === tag.id);
  plainTags.value.splice(index, 1);
  plainTags.value = [...plainTags.value];
  activeTag();
};
watch(route, (value) => {
  if (props.preview) {
    return;
  }
  openTag(value.meta.id as string);
});
watch(plainTags, (tags) => {
  if (props.preview) {
    return;
  }
  emits('change', [...affixTags.value, ...tags]);
  // 保存 localstorage
  storage.set(
    TEMP_MENU_TAG,
    tags.map((m) => m.id || ''),
  );
});
onMounted(() => {
  if (props.preview) {
    plainTags.value = menuTags.value.filter((m) => m.path === defPath);
  } else {
    const ids = (storage.get(TEMP_MENU_TAG) || []) as string[];
    plainTags.value = menuTags.value.filter((_t) => ids.includes(_t.id || ''));
    affixTags.value = menuTags.value.filter((_t) => !!_t.affix);
  }
  openTag(route.meta.id as string);
  if (!props.preview) {
    emits('change', [...affixTags.value, ...plainTags.value]);
  }
});
// 右键菜单
const selectedTag = shallowRef<authority.AuthMenu>(menuTags.value[0]);
const menuVisible = ref<boolean>(false);
const menuPosition = shallowRef<{ x: number; y: number }>({ x: 0, y: 0 });
const showContextMenu = (e: MouseEvent, tag: authority.AuthMenu) => {
  hideMenu();
  nextTick().then(() => {
    menuVisible.value = true;
    menuPosition.value = { x: e.clientX, y: e.clientY };
    selectedTag.value = tag;
  });
};
const hideMenu = () => {
  menuVisible.value = false;
};
onMounted(() => {
  if (!props.preview) {
    document.body.addEventListener('click', hideMenu);
  }
});
onUnmounted(() => {
  if (!props.preview) {
    document.body.removeEventListener('click', hideMenu);
  }
});
const { setRefresh } = refresh;
const refreshTag = () => {
  setRefresh(true);
  nextTick().then(() => {
    setRefresh(false);
  });
};
const hasLeftTags = computed(() => {
  if (plainTags.value.find((_t) => _t.id === selectedTag.value.id)) {
    return selectedTag.value.id !== plainTags.value[0].id;
  }
  return false;
});
const closeLeftTags = (tag: authority.AuthMenu) => {
  const index = plainTags.value.findIndex((_t) => _t.id === tag.id);
  if (index !== -1) {
    plainTags.value = plainTags.value.slice(index);
  }
  activeTag();
};
const hasRightTags = computed(() => {
  if (plainTags.value.find((_t) => _t.id === selectedTag.value.id)) {
    return (
      selectedTag.value.id !== plainTags.value[plainTags.value.length - 1].id
    );
  }
  return plainTags.value.length > 0;
});
const closeRightTags = (tag: authority.AuthMenu) => {
  const index = plainTags.value.findIndex((_t) => _t.id === tag.id);
  if (index !== -1) {
    plainTags.value = plainTags.value.slice(0, index + 1);
  } else if (plainTags.value.length > 0) {
    plainTags.value = [];
  }
  activeTag();
};
const hasAllTags = computed(() => {
  if (plainTags.value.find((_t) => _t.id === selectedTag.value.id)) {
    return plainTags.value.length > 1;
  }
  return plainTags.value.length > 0;
});
const closeAllTags = () => {
  if (plainTags.value.length > 0) {
    plainTags.value = [];
  }
  activeTag();
};
const hasOtherTags = computed(() => {
  if (plainTags.value.find((_t) => _t.id === selectedTag.value.id)) {
    return plainTags.value.length > 1;
  }
  return plainTags.value.length > 0;
});
const closeOtherTags = (tag: authority.AuthMenu) => {
  if (!plainTags.value.find((_t) => _t.id === tag.id)) {
    plainTags.value = [];
  } else {
    plainTags.value = [tag];
  }
  activeTag();
};
</script>
