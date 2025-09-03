<!--
 * @Author: Huangjs
 * @Date: 2022-10-25 18:01:58
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-24 10:25:01
 * @Description: ******
-->
<template>
  <div :class="cls('i18n-manage')">
    <div :class="cls('model-toolbar')">
      <div class="search">
        <span>{{ `${t('Frame', 'i18n.plugin')}` }}:&nbsp;&nbsp; </span>
        <el-tree-select
          v-model="selectedPlugins"
          :data="plugins"
          :render-after-expand="false"
          multiple
          show-checkbox
          check-strictly
          check-on-click-node />
        <span>{{ `${t('Frame', 'common.keyword')}` }}:&nbsp;&nbsp;</span>
        <el-input
          clearable
          :placeholder="
            t('Frame', 'common.inputPlease', [t('Frame', 'common.keyword')])
          "
          v-model="keywords" />
        <el-button
          type="primary"
          style="margin-left: 12px"
          icon="Search"
          @click="i18nQuery">
          {{ t('Frame', 'button.query') }}
        </el-button>
        <el-button
          type="primary"
          style="margin-left: 12px"
          icon="Edit"
          @click="editRecords = [...selectionData]">
          {{ t('Frame', 'i18n.batchUpdate') }}
        </el-button>
      </div>
    </div>
    <div :class="cls('model-body')">
      <el-table
        ref="tableRef"
        class="table"
        v-loading="loading"
        :empty-text="t('Frame', 'common.noData')"
        row-key="key"
        size="default"
        show-overflow-tooltip
        :data="i18nData"
        @row-click="rowClick"
        @select="crossSelect"
        @select-all="crossSelect">
        <el-table-column
          type="index"
          :label="t('Frame', 'common.sequence')"
          width="60"
          :align="'center'" />
        <el-table-column type="selection" width="48" :align="'center'" />
        <el-table-column
          property="key"
          :label="t('Frame', 'i18n.key')"
          :align="'center'" />
        <el-table-column :label="t('Frame', 'i18n.zhCN')">
          <template #default="{ row }">
            <div class=""><i class="fa fa-lightbulb-o" /> {{ row.zhCN }}</div>
            <div class="" v-if="!!row.zhCNNew">
              <i class="fa fa-pencil-square" /> {{ row.zhCNNew }}
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="t('Frame', 'i18n.enUS')">
          <template #default="{ row }">
            <div class=""><i class="fa fa-lightbulb-o" /> {{ row.enUS }}</div>
            <div class="" v-if="!!row.zhCNNew">
              <i class="fa fa-pencil-square" /> {{ row.enUSNew }}
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="t('Frame', 'i18n.koKR')">
          <template #default="{ row }">
            <div class=""><i class="fa fa-lightbulb-o" /> {{ row.koKR }}</div>
            <div class="" v-if="!!row.zhCNNew">
              <i class="fa fa-pencil-square" /> {{ row.koKRNew }}
            </div>
          </template>
        </el-table-column>
        <el-table-column
          property="plugin"
          :label="t('Frame', 'i18n.plugin')"
          :align="'center'" />
        <el-table-column
          :label="t('Frame', 'i18n.action')"
          :align="'center'"
          width="150">
          <template #default="{ row }">
            <el-button
              type="primary"
              circle
              :icon="Edit"
              @click="editRecords = [row]" />
            <el-button
              v-if="!!row.sqlID"
              type="danger"
              circle
              :icon="Delete"
              @click="() => delI18n(row)" />
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="page"
        background
        :pager-count="5"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 30, 40, 50, 100]"
        :current-page="pagination.current"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        @size-change="sizeChange"
        @current-change="pageChange" />
    </div>
    <el-dialog
      :model-value="!!editRecords"
      @close="editRecords = null"
      :title="t('Frame', 'i18n.update')"
      width="30%"
      draggable
      destroy-on-close>
      <template v-if="editRecords?.length === 1">
        <div class="form">
          {{ t('Frame', 'i18n.plugin') }}:&nbsp;&nbsp;&nbsp;{{
            editRecords[0].plugin
          }}
        </div>
        <div class="form">
          {{ t('Frame', 'i18n.key') }}:&nbsp;&nbsp;&nbsp;{{
            editRecords[0].key
          }}
        </div>
      </template>
      <div class="form">
        <span>{{ t('Frame', 'i18n.zhCN') }}:&nbsp;&nbsp; </span>
        <el-input
          clearable
          :placeholder="
            t('Frame', 'common.inputPlease', [t('Frame', 'i18n.zhCN')])
          "
          v-model="zhCNValue" />
      </div>
      <div class="form">
        <span>{{ t('Frame', 'i18n.enUS') }}:&nbsp;&nbsp; </span>
        <el-input
          clearable
          :placeholder="
            t('Frame', 'common.inputPlease', [t('Frame', 'i18n.enUS')])
          "
          v-model="enUSValue" />
      </div>
      <div class="form">
        <span>{{ t('Frame', 'i18n.koKR') }}:&nbsp;&nbsp; </span>
        <el-input
          clearable
          :placeholder="
            t('Frame', 'common.inputPlease', [t('Frame', 'i18n.koKR')])
          "
          v-model="koKRValue" />
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editRecords = null">{{
            t('Frame', 'button.cancel')
          }}</el-button>
          <el-button type="primary" @click="confirmEditI18n">
            {{ t('Frame', 'button.confirm') }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, reactive, computed, watch, onMounted } from 'vue';
import {
  ElementPlus,
  ElementPlusIcons,
  MessageBox,
  Message,
  Notification,
} from '@xnebula/components';
import { i18n as useI18n } from '@@/i18n';
import { usePrefixCls, useModules } from '@@/hooks';
import { getI18nList, editI18ns, delI18nOne } from '@@/api';

const { Edit, Delete } = ElementPlusIcons;

defineOptions({
  name: 'I18nManage',
});
const { t, updateServerMessages } = useI18n();
const cls = usePrefixCls();
const modules = useModules();

const keywords = ref<string>('');
const selectedPlugins = ref<string[]>([]);
const plugins = computed(() => {
  const _plugins: Record<string, true> = {};
  Object.keys(modules?.value || {}).forEach((key) => {
    const [name] = key.split('_');
    _plugins[name] = true;
  });
  return [{ label: 'Frame', value: 'Frame' }].concat(
    Object.keys(_plugins).map((key) => ({ label: key, value: key })),
  );
});
const i18nData = shallowRef<Record<string, string>[]>([]);
const loading = ref<boolean>(false);
const i18nQuery = () => {
  loading.value = true;
  getI18nList({
    keywords: keywords.value,
    pluginNames: selectedPlugins.value,
    Page: pagination.current,
    Count: pagination.pageSize,
  }).then((res) => {
    const { data, dataSql, Count } = res || {};
    i18nData.value = (data || []).map(
      ({ PLUGIN_NAME, KEY, CN, EN, KO }: any) => {
        const sql = dataSql.find((ds: any) => ds.KEY === KEY);
        return {
          key: KEY,
          plugin: PLUGIN_NAME,
          zhCN: CN,
          zhCNNew: sql?.CN,
          enUS: EN,
          enUSNew: sql?.EN,
          koKR: KO,
          koKRNew: sql?.KO,
          sqlID: sql?.ID,
        };
      },
    );
    pagination.total = Count || 0;
    loading.value = false;
  });
};
onMounted(() => {
  i18nQuery();
});
// 用户分页并获取分页数据
const pagination = reactive<{
  current: number;
  pageSize: number;
  total: number;
}>({
  current: 1,
  pageSize: 10,
  total: 0,
});
const sizeChange = (pageSize: number) => {
  pagination.current = Math.ceil(
    (pagination.pageSize * pagination.current) / pageSize,
  );
  pagination.pageSize = pageSize;
  i18nQuery();
};
const pageChange = (current: number) => {
  pagination.current = current;
  i18nQuery();
};
const delI18n = (record: Record<string, string>) => {
  MessageBox.confirm(t('Frame', 'i18n.delTip'), t('Frame', 'common.info'), {
    type: 'warning',
    confirmButtonText: t('Frame', 'button.confirm'),
    cancelButtonText: t('Frame', 'button.cancel'),
  }).then(() => {
    loading.value = true;
    delI18nOne(record.sqlID || '').then((res) => {
      loading.value = false;
      if (res) {
        Notification({
          title: t('Frame', 'common.info'),
          type: 'success',
          message: t('Frame', 'i18n.delSuccess'),
        });
        i18nQuery();
        updateServerMessages();
      }
    });
  });
};
const editRecords = ref<Record<string, string>[] | null>(null);
const zhCNValue = ref<string>('');
const enUSValue = ref<string>('');
const koKRValue = ref<string>('');
watch(editRecords, (value: Record<string, string>[] | null) => {
  zhCNValue.value =
    value?.length === 1 ? value[0].zhCNNew || value[0].zhCN : '';
  enUSValue.value =
    value?.length === 1 ? value[0].enUSNew || value[0].enUS : '';
  koKRValue.value =
    value?.length === 1 ? value[0].koKRNew || value[0].koKR : '';
});
const confirmEditI18n = () => {
  if (!zhCNValue.value || !enUSValue.value || !koKRValue.value) {
    Message({ type: 'warning', message: t('Frame', 'i18n.required') });
    return;
  }
  loading.value = true;
  editI18ns(
    (editRecords.value || []).map((er) => ({
      ID: er.sqlID || null,
      PLUGIN_NAME: er.plugin || '',
      KEY: er.key || '',
      CN: zhCNValue.value,
      EN: enUSValue.value,
      KO: koKRValue.value,
    })),
  ).then((res) => {
    loading.value = false;
    if (res) {
      editRecords.value = null;
      Notification({
        title: t('Frame', 'common.info'),
        type: 'success',
        message: t('Frame', 'i18n.editSuccess'),
      });
      i18nQuery();
      updateServerMessages();
    }
  });
};
const tableRef = ref<InstanceType<typeof ElementPlus.ElTable>>();
const selectionData = ref<Record<string, string>[]>([]);
const crossSelect = (selection: Record<string, string>[]) => {
  selectionData.value = [...selection];
};
// 点击行的时候选中或取消选中
const rowClick = (row: Record<string, string>) => {
  const selectedIndex = selectionData.value.findIndex((u) => row.key === u.key);
  const noSelected = selectedIndex === -1;
  tableRef.value?.toggleRowSelection(row, noSelected);
  if (noSelected) {
    selectionData.value.push(row);
  } else {
    selectionData.value.splice(selectedIndex, 1);
  }
};
</script>
