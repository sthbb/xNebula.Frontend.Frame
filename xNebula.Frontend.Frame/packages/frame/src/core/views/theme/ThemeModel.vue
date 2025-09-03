<!--
 * @Author: Huangjs
 * @Date: 2022-10-25 18:01:58
 * @LastEditors: Huangjs
 * @LastEditTime: 2022-10-27 15:41:26
 * @Description: ******
-->
<template>
  <div ref="modelRef" :class="cls('theme-model')">
    <div :class="cls('model-toolbar')">
      <el-form :model="form" label-width="auto" :inline="true">
        <el-form-item :label="t('Frame', 'theme.select')" style="width: 180px">
          <el-select size="default" v-model="form.select">
            <el-option
              v-for="item in mockData.selectList"
              :label="t('Frame', item.label)"
              :value="item.value"
              :key="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item :label="t('Frame', 'theme.input')" style="width: 180px">
          <el-input size="default" v-model="form.input" />
        </el-form-item>
        <el-form-item :label="t('Frame', 'theme.dateTime')">
          <el-date-picker
            v-model="form.date"
            type="date"
            :disabled-date="disabledDate"
            style="width: 180px" />
          <span style="margin: 0 5px">-</span>
          <el-time-picker v-model="form.time" style="width: 180px" />
        </el-form-item>
        <el-form-item :label="t('Frame', 'theme.checkbox')">
          <el-checkbox-group v-model="form.checkbox">
            <el-checkbox
              v-for="item in mockData.checkboxList"
              :key="item.value"
              :value="item.value"
              :label="t('Frame', item.label)" />
          </el-checkbox-group>
        </el-form-item>
        <el-form-item :label="t('Frame', 'theme.radio')">
          <el-radio-group v-model="form.radio">
            <el-radio :label="t('Frame', 'theme.optionA')" value="1" />
            <el-radio :label="t('Frame', 'theme.optionB')" value="2" />
          </el-radio-group>
        </el-form-item>
        <el-form-item :label="t('Frame', 'theme.switch')">
          <el-switch v-model="form.switch" />
        </el-form-item>
        <el-form-item>
          <el-button
            :type="btn.type"
            v-for="btn in mockData.buttons"
            :key="btn.label"
            :icon="btn.icon"
            :disabled="btn.disabled">
            {{ t('Frame', btn.label) }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <div :class="cls('model-body')">
      <el-table :data="tableData" border stripe>
        <el-table-column
          :fixed="column.fixed"
          :prop="column.prop"
          :label="t('Frame', column.label)"
          :width="column.width"
          :key="column.prop"
          v-for="column in mockData.columns">
          <template #default="{ row }" v-if="column.prop === 'Operations'">
            <el-button link type="primary" @click="detailVisible = true">{{
              t('Frame', 'button.detail')
            }}</el-button>
            <el-button link type="primary" @click="() => delAction(row)">
              {{ t('Frame', 'button.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-dialog v-model="detailVisible" :title="t('Frame', 'theme.detail')">
      <el-table :data="tableData" :border="true" stripe>
        <el-table-column
          :prop="column.prop"
          :label="t('Frame', column.label)"
          :width="column.width"
          :key="column.prop"
          v-for="column in mockData.columns" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { reactive, shallowRef, ref } from 'vue';
import { ElementPlus } from '@xnebula/components';
import { i18n as useI18n } from '@@/i18n';
import { usePrefixCls } from '@@/hooks';
import { mockData } from './themeMeta';

defineOptions({
  name: 'ThemeModel',
});
const { t } = useI18n();
const cls = usePrefixCls();
const { ElMessageBox } = ElementPlus;

const form = reactive({
  select: 1,
  input: '123',
  date: new Date(),
  time: new Date(),
  checkbox: ['optionA'],
  radio: '1',
  switch: true,
});
const modelRef = ref();
const detailVisible = ref(false);
const tableData = shallowRef(mockData.tableData);
const delAction = async (item: (typeof mockData.tableData)[0]) => {
  await ElMessageBox.confirm(
    t('Frame', 'theme.delTip'),
    t('Frame', 'common.info'),
    {
      appendTo: modelRef.value,
      confirmButtonText: t('Frame', 'button.confirm'),
      cancelButtonText: t('Frame', 'button.cancel'),
    },
  );
  tableData.value = tableData.value.filter((v) => {
    return v.key !== item.key;
  });
};
const disabledDate = (time: Date) => time.getTime() > Date.now();
</script>
