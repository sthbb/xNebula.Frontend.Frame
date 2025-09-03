<!--
 * @Author: Huangjs
 * @Date: 2024-01-31 17:51:41
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-02-21 10:21:40
 * @Description: ******
-->
<template>
  <host-tree
    class="host-tree"
    :height="420"
    :get-node-data="getNodeData"
    @select-node="selectNode" />
</template>

<script setup lang="ts">
import type { HostTreeData } from '@xnebula/host-tree';
import { request } from '../common';

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
        leaf: true, // 只展示到主机这一级
        host: child.Kind === 'host' ? child.IP : '',
        online: +child.Status === 1,
        icon: +child.OS === 1 ? 'fa fa-linux' : 'fa fa-windows',
        parent: treeData,
        data: child,
      })),
      data,
    }));
  }
  return [];
};
const selectNode = (data: HostTreeData) => {
  const hostData = data.data;
  console.log(data);
  // 主机历史查询
  if (hostData.Kind == 'host') {
    const hostId = hostData.Id;
    console.log(hostId);
  }
  // 服务故障转移
  if (hostData.Kind == 'host') {
    const currentHostInfo = { HostId: hostData.Id };
    // query();
    console.log(currentHostInfo);
  }
};
</script>

<style scoped>
.host-tree {
  padding: 16px;
  border: 1px solid #ddd;
}
</style>
