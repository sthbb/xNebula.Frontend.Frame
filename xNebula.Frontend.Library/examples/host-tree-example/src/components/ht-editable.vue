<!--
 * @Author: Huangjs
 * @Date: 2024-01-31 17:51:41
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-02-21 14:52:23
 * @Description: ******
-->
<template>
  <div>
    <host-tree
      ref="hostTreeRef"
      class="host-tree"
      is-editable
      :height="420"
      :get-node-data="getNodeData"
      :save-node="saveNode"
      :move-node="moveNode"
      :del-node="delNode"
      @select-node="selectNode" />
    <div style="margin-top: 10px; text-align: center">
      <el-button type="primary" @click="startSignalR">开始</el-button>
      <el-button type="primary" @click="stopSignalR">停止</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
import type {
  HostTreeInstance,
  HostTreeData,
  HostTreeMoveType,
} from '@xnebula/host-tree';
import { request } from '../common';

const moveNode = async (
  moveType: HostTreeMoveType,
  treeData0: HostTreeData,
  treeData: HostTreeData,
) => {
  if (moveType) {
    const result: any = await request(moveType, treeData0.id, treeData.id);
    return result.data;
  }
  return false;
};
const saveNode = async (treeData: HostTreeData) => {
  const result: any = await request(
    'saveGroup',
    +treeData.id < 0 ? 0 : treeData.id,
    treeData.label,
  );
  return {
    id: result.data,
    // data: {}
  };
};
const delNode = async (treeData: HostTreeData) => {
  const result: any = await request('deleteGroup', +treeData.id);
  return !!result.data;
};
const getNodeData = async (level: number, treeData: HostTreeData) => {
  if (level === 1) {
    const groups: any = await request('getGroupHosts');
    return groups.map((data: any) => ({
      id: data.Id,
      label: data.Name || '未分组',
      fixed: +data.Id === 0,
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
  // 实时监控
  if (hostData.Kind == 'host') {
    const currentHostId = hostData.Id;
    // getHostRealTimeInfo(currentHostId)
    console.log(currentHostId);
  }
};
const hostTreeRef = ref<HostTreeInstance>();
let interval = 0;
let count = 0;
const signalr = {
  subscribe: (type: string, callback: (o: string) => void) => {
    if (type === 'MonitHostStatusChanged') {
      // 第一次将171状态更改为下线，名称加...
      // 第二次将178更为上线并移到其他分组，ip变成2
      // 第三次在其他分组下面添加一个111
      const Id = ['i441-iQFiS', 'i1-iQFiS', 'new-id-111'];
      const Name = ['171-DevOps...', '178-DevOps', '111-DevOps-test'];
      const Status = [0, 1, 1];
      const IP = ['192.168.1.171', '192.168.2.178', '192.168.1.111'];
      interval = +setInterval(() => {
        callback(
          JSON.stringify({
            Message: {
              Id: Id[count % 3],
              Name: Name[count % 3],
              Status: Status[count % 3],
              OS: 1,
              IP: IP[count % 3],
              Kind: 'host',
              GroupId: 24,
            },
          }),
        );
        count++;
        if (count > 2) {
          stopSignalR();
        }
      }, 1000 * 10);
    }
  },
};
const stopSignalR = () => {
  clearInterval(interval);
};
const startSignalR = () => {
  signalr.subscribe('MonitHostStatusChanged', (jsonStr) => {
    let msg = JSON.parse(jsonStr).Message;
    const nodeData: HostTreeData = {
      id: msg.Id,
      parent: {
        id: msg.GroupId,
      },
      label: msg.Name,
      leaf: true,
      host: msg.Kind === 'host' ? msg.IP : '',
      online: +msg.Status === 1,
      icon: +msg.OS === 1 ? 'fa fa-linux' : 'fa fa-windows',
      data: msg,
    };
    hostTreeRef.value?.updateNode([nodeData]);
  });
  console.log(hostTreeRef.value?.getData());
};
onUnmounted(stopSignalR);
</script>

<style scoped>
.host-tree {
  padding: 16px;
  border: 1px solid #ddd;
}
</style>
