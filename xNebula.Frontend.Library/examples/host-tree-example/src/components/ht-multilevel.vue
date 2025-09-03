<!--
 * @Author: Huangjs
 * @Date: 2024-01-31 17:51:41
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-02-21 12:18:14
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
import { request, MonitKind } from '../common';

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
  // 报警触发器中传入的 isShowMonitItems： 显示三级监控项目
  if (level === 3) {
    const caches: any = await request('getFromCache', treeData.id, [
      MonitKind.FSVolume,
      MonitKind.Network,
      MonitKind.Process,
    ]);
    const nodeData = caches.map((data: any) => ({
      id: data.Id,
      label: data.Name,
      sublabel: MonitKind.getText(data.Kind),
      leaf: true,
      parent: treeData,
      data,
    }));
    // 如果需要把主机放到子节点显示
    // 报警触发器中传入的 isShowHostNode： 补充主机节点显示
    nodeData.unshift({
      id: `host-${treeData.id}`,
      label: treeData.label,
      sublabel: MonitKind.getText(MonitKind.Host),
      leaf: true,
      parent: treeData,
      data: {
        Id: `host-${treeData.id}`,
        Name: treeData.label,
        HostId: treeData.id,
        HostName: treeData.label,
        Kind: MonitKind.Host,
      },
    });
    return nodeData;
  }
  return [];
};

const selectNode = (data: HostTreeData) => {
  let hostData = data.data;
  console.log(data);
  // 报警触发器
  let selectData = {};
  if (hostData.Kind == 'host') {
    selectData = {
      hostId: hostData.Id,
      hostName: hostData.Name,
      monitItemId: undefined,
      monitItemName: undefined,
      serviceType: undefined,
      IsType: true,
    };
  } else {
    const monitData = hostData;
    hostData = data.parent?.data;
    selectData = {
      hostId: hostData.Id,
      hostName: hostData.Name,
      monitItemId: monitData.Id,
      monitItemName: monitData.Name,
      serviceType: monitData.Kind,
      IsType: false,
    };
  }
  // this.getAmsTriggers();
  console.log(selectData);
};
</script>

<style scoped>
.host-tree {
  padding: 16px;
  border: 1px solid #ddd;
}
</style>
