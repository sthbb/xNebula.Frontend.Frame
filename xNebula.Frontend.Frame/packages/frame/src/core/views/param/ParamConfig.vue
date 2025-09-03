<!--
 * @Author: Huangjs
 * @Date: 2022-10-25 18:01:58
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-24 10:01:37
 * @Description: ******
-->
<template>
  <div :class="cls('param-setting')">
    <div :class="cls('param-action')">
      <el-button type="primary" v-loading="loading" @click="saveParams">
        {{ t('Frame', 'button.save') }}
      </el-button>
    </div>
    <el-scrollbar :class="cls('param-scroll')" v-loading="loading">
      <CDNConfig :value="cdnConfig" @change="cdnChange" />
      <WebConfig :value="webConfig" @change="webChange" />
      <OthConfig :value="othConfig" @change="othChange" />
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onMounted } from 'vue';
import { ElementPlus } from '@xnebula/components';
import { i18n as useI18n } from '@@/i18n';
import { usePrefixCls } from '@@/hooks';
import { getParameters, saveParameters } from '@@/api';
import CDNConfig from './CDNConfig.vue';
import WebConfig from './WebConfig.vue';
import OthConfig from './OthConfig.vue';

type Conf = Record<string, Record<string, string | number | boolean>>;
defineOptions({
  name: 'ParamConfig',
});
const { t } = useI18n();
const cls = usePrefixCls();
const loading = ref(false);
const cdnConfig = shallowRef<Conf>({
  IsEnableCdn: {
    VALUE: false,
    KEY: 'IsEnableCdn',
    REMARK: 'param.enableCDN',
  },
  CdnUrl: {
    VALUE: '',
    KEY: 'CdnUrl',
    REMARK: 'param.cdnUrl',
  },
});
const cdnChange = (value: Conf) => {
  cdnConfig.value = {
    ...cdnConfig.value,
    ...value,
  };
};
const webConfig = shallowRef<Conf>({
  HomeIconUrl: { VALUE: '', KEY: 'HomeIconUrl', REMARK: 'param.iconUrl' },
  HomeLogoUrl: {
    VALUE: '',
    KEY: 'HomeLogoUrl',
    REMARK: 'param.logoUrl',
  },
  DocumentUrl: { VALUE: '', KEY: 'DocumentUrl', REMARK: 'param.docUrl' },
  IsHidePortal: {
    VALUE: false,
    KEY: 'IsHidePortal',
    REMARK: 'param.hidePortal',
  },
});
const webChange = (value: Conf) => {
  webConfig.value = {
    ...webConfig.value,
    ...value,
  };
};
const othConfig = shallowRef<Conf>({});
const othChange = (value: Conf) => {
  othConfig.value = {
    ...othConfig.value,
    ...value,
  };
};
const saveParams = () => {
  loading.value = true;
  saveParameters({
    ...cdnConfig.value,
    ...webConfig.value,
    ...othConfig.value,
  }).then((o) => {
    loading.value = false;
    if (o) {
      loadParameters();
      ElementPlus.ElNotification({
        title: t('Frame', 'common.info'),
        type: 'success',
        message: t('Frame', 'param.saveSuccess'),
      });
    }
  });
};
const loadParameters = () => {
  loading.value = true;
  getParameters().then((data: Conf | null) => {
    loading.value = false;
    if (data) {
      const _cdnConfig: Conf = { ...cdnConfig.value };
      const _webConfig: Conf = { ...webConfig.value };
      const _othConfig: Conf = { ...othConfig.value };
      Object.keys(data).forEach((key) => {
        if (typeof cdnConfig.value[key] !== 'undefined') {
          _cdnConfig[key] = data[key];
        } else if (typeof webConfig.value[key] !== 'undefined') {
          _webConfig[key] = data[key];
        } else {
          _othConfig[key] = data[key];
        }
      });
      cdnConfig.value = _cdnConfig;
      webConfig.value = _webConfig;
      othConfig.value = _othConfig;
    }
  });
};
onMounted(() => {
  loadParameters();
});
</script>
