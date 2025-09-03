<!--
 * @Author: Huangjs
 * @Date: 2024-01-31 17:51:41
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-02-21 13:46:58
 * @Description: ******
-->
<template>
  <div>
    <host-tree
      ref="hostTreeRef"
      class="host-tree"
      is-multiple
      :height="420"
      :get-node-data="getNodeData" />
    <div style="margin-top: 10px; text-align: center">
      <el-button type="primary" @click="confirm">输出选择</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { HostTreeInstance, HostTreeData } from '@xnebula/host-tree';
import { request, MonitKind } from '../common';

const hostTreeRef = ref<HostTreeInstance>();
// 默认选择的数据必须要有id和祖先的id，否则无法展开
let choosedMonitItems: HostTreeData[] = [
  {
    id: 'i441-iQFiS-15WuXbPwld',
    parent: { id: 'i441-iQFiS', parent: { id: 24 } },
  },
  {
    id: 'i1-iQFiS-3a09b560b107a2b8e895ab9d11196663',
    parent: { id: 'i1-iQFiS', parent: { id: 0 } },
  },
];
const confirm = () => {
  let checkedItems = hostTreeRef.value?.getCheckeds() || [];
  if (checkedItems.length === 0) {
    console.warn('请选择监控项');
    return;
  }
  // 监控历史查询
  const items: string[] = [];
  checkedItems.forEach(({ parent, data }) => {
    items.push(parent?.data.Id); // HostId
    items.push(data.Name); // Name
  });
  // const postData = { Metrics: '', StartTime: '', EndTime: '', items };
  // getItemMetrics(postData)
  console.log(items);
  // Redis 管理监控项选择
  const text = checkedItems.map(
    ({ parent, data }) => `[${parent?.data.Name}] ${data.Name}`,
  );
  choosedMonitItems = checkedItems;
  // data.value = text.join(' ; ');
  console.log(text.join(' ; '), choosedMonitItems);
};
// openDialog 的时候默认选择
onMounted(() => {
  // 默认选择的数据必须要有id和祖先的id，否则无法展开
  hostTreeRef.value?.setCheckeds(choosedMonitItems);
});

const getNodeData = async (level: number, treeData: HostTreeData) => {
  if (level === 1) {
    const groups: any = await request('getGroupHosts');
    return groups.map((data: any) => ({
      id: data.Id,
      label: data.Name || '未分组',
      leaf: !data.Children || data.Children.length === 0,
      parent: treeData,
      children: (data.Children || []).map((child: any) => ({
        id: child.Id,
        label: child.Name,
        leaf: false,
        host: child.Kind === 'host' ? child.IP : '',
        online: +child.Status === 1,
        icon: +child.OS === 1 ? 'fa fa-linux' : 'fa fa-windows',
        parent: treeData,
        data: child,
      })),
      data,
    }));
  }
  // Redis 管理监控项选择，监控历史查询传入的 isShowMonitItems： 显示三级项目
  if (level === 3) {
    const caches: any = await request('getFromCache', treeData.id, [
      MonitKind.FSVolume,
      MonitKind.Network,
      MonitKind.Process, // Redis管理监控项选择，只需要 Process
    ]);
    return caches.map((data: any) => ({
      id: data.Id,
      label: data.Name,
      sublabel: MonitKind.getText(data.Kind),
      leaf: true,
      parent: treeData,
      data,
    }));
  }
  return [];
};
</script>

<style scoped>
.host-tree {
  padding: 16px;
  border: 1px solid #ddd;
}
</style>
