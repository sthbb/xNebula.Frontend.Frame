<!--
 * @Author: Huangjs
 * @Date: 2021-05-10 15:55:29
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-02-21 14:48:54
 * @Description: ******
-->

## @xnebula/host-tree

选择用户组件，任选一种安装

npm install @xnebula/host-tree

yarn add @xnebula/host-tree

pnpm add @xnebula/host-tree

## 使用方法

### 全局使用：在 main.ts 引入

```javascript
import HostTree from '@xnebula/host-tree';
import '@xnebula/host-tree/index.css';
const app = createApp(App)；
app.use(HostTree);
// 或者
// app.component('HostTree', HostTree);
```

### 局部使用：在 App.vue 引入

```html
<script setup lang="ts">
  import HostTree from '@xnebula/host-tree';
  import '@xnebula/host-tree/index.css';
</script>
```

### 在 template 中使用

```html
<host-tree
  ref="hostTreeRef"
  class="host-tree"
  is-editable
  is-multiple
  :height="420"
  :get-node-data="getNodeData"
  :save-node="saveNode"
  :move-node="moveNode"
  :del-node="delNode"
  @select-node="selectNode" />
```

## 参数说明

| 参数          | 说明                                                                                                          | 类型                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| is-editable   | props: 是否可编辑                                                                                             | boolean 非必传                                                                                        |
| is-multiple   | props: 是否多选                                                                                               | boolean 非必传                                                                                        |
| height        | props: 树结构高度                                                                                             | number 非必传                                                                                         |
| get-node-data | props: 请求树结构数据的方法，在该方法中根据level来渲染每一层级的数据，因为树结构使用的是懒加载                | function(level: number, parent: TreeData):Promise<TreeData[]> 必传                                    |
| move-node     | props: 移动树结构后向后端请求的方法，type反应如何移动，data0 为拖拽移动的数据，data 为放置参考的数据          | function(type: MoveType, data0: TreeData, data: TreeData):Promise<boolean> is-editable 为 true 时必传 |
| del-node      | props: 删除树中节点向后端请求的方法，data 为被删除的节点数据                                                  | function(data: TreeData):Promise<boolean> is-editable 为 true 时必传                                  |
| save-node     | props: 创建新节点向后端请求的方法，data 为创建节点的信息，返回的data是创建后完整的信息，内部包括后端生成的 id | function(data: TreeData):Promise<boolean> is-editable 为 true 时必传                                  |
| select-node   | event: 选中某一个节点触发的事件                                                                               | function(data: TreeData):void is-multiple 为 false 时使用                                             |
| setCheckeds   | method: 设置选中的节点，传入节点数据数组，该数据必须包含id，若需要展开，则必须包含parent（需要id）链          | function(data: TreeData):void is-multiple 为 true 时使用                                              |
| getCheckeds   | method: 获取当前选中的节点                                                                                    | function(): TreeData is-multiple 为 true 时使用                                                       |
| updateNode    | method: 更新节点信息，根据提供的节点组，循环更新对应的节点信息（有可能会添加新节点，有可能会移动节点）        | function(data: TreeData[]):void                                                                       |
| getData       | method: 获取当前节点数据数组（包括已展开的子节点）传key获取指定节点，不传，获取全部                           | function(key?: TreeKey):TreeData[]                                                                    |

## 示例

### 可编辑

```html
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
    <div style="text-align: center; margin-top: 10px">
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
  } from '../../../src/index';
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
    return result.data;
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
        interval = setInterval(() => {
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
  };
  onUnmounted(stopSignalR);
</script>

<style scoped>
  .host-tree {
    padding: 16px;
    border: 1px solid #ddd;
  }
</style>
```

### 可选择

```html
<template>
  <div>
    <host-tree
      ref="hostTreeRef"
      class="host-tree"
      is-multiple
      :height="420"
      :get-node-data="getNodeData" />
    <div style="text-align: center; margin-top: 10px">
      <el-button type="primary" @click="confirm">输出选择</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import type { HostTreeInstance, HostTreeData } from '../../../src/index';
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
        data,
      }));
    }
    if (level === 2) {
      const children = treeData.data?.Children || [];
      return children.map((child: any) => ({
        id: child.Id,
        label: child.Name,
        leaf: false,
        host: child.Kind === 'host' ? child.IP : '',
        online: +child.Status === 1,
        icon: +child.OS === 1 ? 'fa fa-linux' : 'fa fa-windows',
        parent: treeData,
        data: child,
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
```
