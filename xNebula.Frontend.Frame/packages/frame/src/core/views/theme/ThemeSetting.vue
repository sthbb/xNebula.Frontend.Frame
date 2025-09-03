<template>
  <div :class="cls('setting-wrapper')" v-loading="loading">
    <div :class="cls('theme-action')">
      <el-button @click="() => resetTheme()">
        {{ t('Frame', 'button.reset') }}
      </el-button>
      <el-button type="success" @click="applyTheme">
        {{ t('Frame', 'button.confirm') }}
      </el-button>
      <el-upload
        ref="uploadRef"
        class="upload"
        action="/"
        accept=".json"
        v-model:file-list="uploadFileList"
        :limit="1"
        :multiple="false"
        :auto-upload="false"
        :show-file-list="false"
        :on-change="importTheme">
        <template #trigger>
          <el-tooltip :content="t('Frame', 'button.import')">
            <el-button type="primary" icon="UploadFilled" circle> </el-button>
          </el-tooltip>
        </template>
      </el-upload>
      <el-tooltip :content="t('Frame', 'button.export')">
        <el-button type="warning" icon="Share" circle @click="exportTheme">
        </el-button>
      </el-tooltip>
    </div>
    <el-scrollbar v-loading="loading" :class="cls('theme-scroll')">
      <el-row
        :gutter="8"
        :align="'middle'"
        :class="[cls('theme-setting'), 'divider']">
        <el-col class="label" :span="10">{{
          t('Frame', 'theme.themeSelect')
        }}</el-col>
        <el-col class="input" :span="9">
          <el-select v-model="themeStyle" @change="themeStyleChange">
            <el-option
              v-for="style in styleOptions"
              :key="style"
              :label="style"
              :value="style" />
          </el-select>
        </el-col>
        <el-col class="suffix" :span="5">
          <el-tooltip :content="t('Frame', 'theme.themeSelectTip')">
            <el-icon class="tip"><Quesition /></el-icon>
          </el-tooltip>
        </el-col>
      </el-row>
      <el-row
        v-for="{
          key,
          label,
          selector,
          tip,
          min,
          max,
          unit,
          image,
          hide,
          divider,
        } in settingList"
        :key="key"
        :gutter="8"
        :align="'middle'"
        :class="{ [cls('theme-setting')]: true, hide: hide, divider }">
        <el-col class="label" :span="10">{{ t('Frame', label) }}</el-col>
        <el-col class="input" :span="9">
          <el-input
            v-if="selector === 'colorPicker'"
            v-model="themeValues[key]"
            :placeholder="t('Frame', 'common.inputPlease', [''])"
            @blur="() => validColor(key)" />
          <el-input-number
            v-else-if="selector === 'inputNumber'"
            :modelValue="parseNumber(key)"
            @update:modelValue="(v: number) => updateNumber(key, v, unit)"
            :placeholder="t('Frame', 'common.inputPlease', [''])"
            :min="min || 0"
            :max="max || 32"
            :step="unit === 'rem' ? 0.1 : 1"
            :precision="unit === 'rem' ? 3 : 0"
            controls-position="right" />
        </el-col>
        <el-col class="suffix" :span="5">
          <el-color-picker
            v-if="selector === 'colorPicker'"
            v-model="themeValues[key]" />
          <span v-else-if="selector === 'inputNumber'" class="unit">{{
            unit || 'px'
          }}</span>
          <el-tooltip v-if="!!tip" :content="t('Frame', tip)">
            <el-icon class="tip"><Quesition /></el-icon>
          </el-tooltip>
        </el-col>
        <el-col class="image" v-if="!!image" :push="10" :span="9">
          <el-button
            v-if="!themeValues[joinBg(key)]"
            @click="imageKey = joinBg(key)">
            {{ t('Frame', 'theme.imageSelect') }}
          </el-button>
          <div
            v-else
            @click="imageKey = joinBg(key)"
            class="image-thumb"
            :style="{
              backgroundImage: `url(${loadThemeImage(themeValues[joinBg(key)])[0].url})`,
            }"></div>
        </el-col>
      </el-row>
    </el-scrollbar>
    <el-dialog
      :model-value="visible"
      :title="t('Frame', 'theme.imageSelect')"
      :class="cls('theme-image')"
      destroy-on-close
      @close="imageKey = ''">
      <el-upload :file-list="fileList" list-type="picture-card" disabled>
        <template #file="{ file }">
          <div class="file" @click.stop="() => selectImage(file.name)">
            <img
              class="el-upload-list__item-thumbnail"
              :src="file.url"
              alt="" />
            <label
              :class="{
                'el-upload-list__item-status-label': true,
                selected: selectedImage(file.name),
              }">
              <i class="el-icon el-icon--upload-success el-icon--check">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                  <path
                    fill="currentColor"
                    d="M406.656 706.944 195.84 496.256a32 32 0 1 0-45.248 45.248l256 256 512-512a32 32 0 0 0-45.248-45.248L406.592 706.944z" />
                </svg>
              </i>
            </label>
            <el-icon class="zoom" @click.stop="() => handlePreview(file.url)">
              <ZoomIn />
            </el-icon>
          </div>
        </template>
      </el-upload>
      <el-dialog v-model="previewVisible">
        <img w-full :src="previewImageUrl" />
      </el-dialog>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="imageKey = ''">
            {{ t('Frame', 'button.cancel') }}
          </el-button>
          <el-button type="primary" @click="confirmImage">
            {{ t('Frame', 'button.confirm') }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { shallowRef, unref, ref, watch, computed } from 'vue';
import { ElementPlus } from '@xnebula/components';
import { i18n as useI18n } from '@@/i18n';
import { usePrefixCls } from '@@/hooks';
import { theme } from '@@/store';
import { Quesition } from '@@/icon';
import { saveTheme } from '@@/api';
import { settingList } from './themeMeta';

defineOptions({
  name: 'ThemeSetting',
});
const { t } = useI18n();
const cls = usePrefixCls();
const {
  themeStyles,
  themeStyle,
  themeValues,
  setTheme,
  resetTheme,
  loadThemeImage,
} = theme;
const { getOverviewElement } = defineProps<{
  getOverviewElement: () => HTMLElement | undefined;
}>();
const styleOptions = Object.keys(themeStyles);
// 选择固定主题
const themeStyleChange = (val: theme.ThemeStyle) => {
  themeValues.value = {
    ...themeStyles[val],
  };
};
// 颜色校验
const validColor = (key: theme.ThemeKey) => {
  const value = themeValues.value[key];
  if (value && !value.match(/^#[0-9a-fA-F]{6}$/)) {
    resetTheme(key);
  }
};
// themeValues 变化, 改变预览
watch(
  themeValues,
  () => {
    const element = getOverviewElement();
    element && setTheme(cls(''), element);
  },
  {
    deep: true,
  },
);
const loading = ref(false);
const applyTheme = () => {
  loading.value = true;
  setTheme(cls(''));
  saveTheme({
    ThemeData: JSON.stringify({
      ...unref(themeValues),
      themeStyle: themeStyle.value,
    }),
  }).then((o: boolean) => {
    loading.value = false;
    if (o) {
      ElementPlus.ElNotification({
        title: t('Frame', 'common.info'),
        message: t('Frame', 'theme.successTip'),
        type: 'success',
      });
    }
  });
};
const uploadRef = shallowRef<ElementPlus.UploadInstance>();
const uploadFileList = ref<ElementPlus.UploadUserFile[]>([]);
const importTheme: ElementPlus.UploadProps['onChange'] = (uploadFile) => {
  try {
    const reader = new FileReader();
    reader.readAsText(uploadFile.raw || new Blob(), 'UTF-8');
    reader.onload = function (evt) {
      try {
        if (typeof evt.target?.result === 'string') {
          const themeJson = JSON.parse(evt.target.result);
          const newTheme = {} as theme.ThemeValues;
          Object.keys(themeValues.value).forEach((k) => {
            const key = k as theme.ThemeKey;
            newTheme[key] = themeJson[key] || themeValues.value[key];
          });
          themeValues.value = newTheme;
          applyTheme();
        } else {
          throw Error();
        }
      } catch (_e) {
        ElementPlus.ElNotification({
          title: t('Frame', 'common.info'),
          message: t('Frame', 'theme.failureTip'),
          type: 'error',
        });
      }
    };
  } catch (_e) {
    ElementPlus.ElNotification({
      title: t('Frame', 'common.info'),
      message: t('Frame', 'theme.failureTip'),
      type: 'error',
    });
  }
  uploadRef.value?.clearFiles();
};
const exportTheme = () => {
  const blob = new Blob([JSON.stringify(unref(themeValues), null, 2)], {
    type: 'text/json',
  });
  const a = document.createElement('a');
  a.download = 'theme.json';
  a.href = window.URL.createObjectURL(blob);
  a.click();
};
const parseNumber = (key: theme.ThemeKey) => parseFloat(themeValues.value[key]);
const updateNumber = (
  key: theme.ThemeKey,
  val: number,
  unit: string = 'px',
) => {
  themeValues.value[key] = `${!val ? 0 : val}${unit || 'px'}`;
};

// 图片选择
const imageValues = shallowRef<Record<theme.ThemeKey, string>>({
  ...themeStyles[themeStyle.value],
});

const imageKey = ref<theme.ThemeKey | ''>('');
const visible = computed(() => !!imageKey.value);
watch(imageKey, (val) => {
  if (val) {
    imageValues.value = {
      ...imageValues.value,
      [val]: themeValues.value[val],
    };
  }
});
const themeImages = loadThemeImage();
const fileList = computed(() => {
  if (!imageKey.value) {
    return [];
  }
  return themeImages.filter(({ name }) => name.indexOf(imageKey.value) !== -1);
});
const selectImage = (name: string) => {
  const key = imageKey.value;
  if (key) {
    if (name !== imageValues.value[key]) {
      imageValues.value = { ...imageValues.value, [key]: name };
    } else {
      imageValues.value = { ...imageValues.value, [key]: '' };
    }
  }
};
const selectedImage = (name: string) => {
  const key = imageKey.value;
  if (key && imageValues.value[key]) {
    return name === imageValues.value[key];
  }
  return false;
};
const confirmImage = () => {
  if (imageKey.value) {
    themeValues.value = {
      ...themeValues.value,
      [imageKey.value]: imageValues.value[imageKey.value],
    };
  }
  imageKey.value = '';
};
// 预览图片
const previewImageUrl = ref('');
const previewVisible = ref(false);
const handlePreview = (url: string) => {
  previewImageUrl.value = url;
  previewVisible.value = true;
};
const joinBg = (key: theme.ThemeKey) =>
  key.replace(/Color/g, 'Image') as theme.ThemeKey;
</script>
