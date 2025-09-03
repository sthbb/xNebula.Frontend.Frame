<!--
 * @Author: Huangjs
 * @Date: 2022-10-25 18:01:58
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-07-24 10:25:01
 * @Description: ******
-->
<template>
  <div :class="cls('plugin-manage')">
    <div :class="cls('model-toolbar')">
      <div class="search">
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
          @click="pluginQuery">
          {{ t('Frame', 'button.query') }}
        </el-button>
      </div>
    </div>
    <div :class="cls('model-body')">
      <el-table
        class="table"
        v-loading="loading"
        :empty-text="t('Frame', 'common.noData')"
        row-key="id"
        size="default"
        show-overflow-tooltip
        :data="pluginData">
        <el-table-column
          type="index"
          :label="t('Frame', 'common.sequence')"
          :align="'center'"
          width="60" />
        <el-table-column
          property="AssemblyName"
          :align="'center'"
          :label="t('Frame', 'plugin.name')" />
        <el-table-column
          property="Path"
          :align="'center'"
          :label="t('Frame', 'plugin.path')" />
        <el-table-column
          property="Version"
          :align="'center'"
          :label="t('Frame', 'plugin.version')" />
        <el-table-column
          property="Order"
          :align="'center'"
          :label="t('Frame', 'plugin.order')" />
        <el-table-column
          property="JsonConfig"
          :align="'center'"
          :label="t('Frame', 'plugin.config')" />
        <el-table-column
          property="LastWriteTime"
          :align="'center'"
          :label="t('Frame', 'plugin.modified')" />
      </el-table>
      <!-- <el-pagination
        class="page"
        background
        :pager-count="5"
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 30, 40, 50, 100]"
        :current-page="pagination.current"
        :page-size="pagination.pageSize"
        :total="pagination.total"
        @size-change="sizeChange"
        @current-change="pageChange" /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, reactive, onMounted } from 'vue';
import { i18n as useI18n } from '@@/i18n';
import { usePrefixCls } from '@@/hooks';
import { getPluginsList } from '@@/api';

defineOptions({
  name: 'PluginManage',
});
const { t } = useI18n();
const cls = usePrefixCls();

const keywords = ref<string>('');
const pluginData = shallowRef<Record<string, string>[]>([]);
const loading = ref<boolean>(false);
const pluginQuery = () => {
  loading.value = true;
  getPluginsList({
    keyword: keywords.value,
    // pageIndex: pagination.current,
    // pageSize: pagination.pageSize,
  }).then((data) => {
    loading.value = false;
    pluginData.value = data || [];
    pagination.pageSize = data?.length || 0;
    pagination.total = data?.length || 0;
  });
};
onMounted(() => {
  pluginQuery();
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
/* const pageChange = (current: number) => {
  pagination.current = current;
  pluginQuery();
};
const sizeChange = (pageSize: number) => {
  pagination.current = Math.ceil(
    (pagination.pageSize * pagination.current) / pageSize,
  );
  pagination.pageSize = pageSize;
  pluginQuery();
}; */
</script>
