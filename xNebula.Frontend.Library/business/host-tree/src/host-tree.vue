<!--
 * @Author: Huangjs
 * @Date: 2024-02-06 15:37:34
 * @LastEditors: Huangjs
 * @LastEditTime: 2024-03-12 10:10:51
 * @Description: ******
-->
<template>
  <div class="xnebula-host-tree">
    <el-input
      v-model="keywords"
      size="large"
      placeholder="请输入关键字"
      suffix-icon="Search"
      clearable>
      <template #prepend>
        <el-space :size="16">
          <el-button
            title="添加一个分组"
            icon="CirclePlus"
            @click="add"
            v-if="isEditable" />
          <el-button title="刷新树" icon="Refresh" @click="refresh" />
        </el-space>
      </template>
    </el-input>
    <el-scrollbar
      :style="{
        height: typeof height === 'number' ? `${height}px` : height,
      }"
      class="xnebula-tree-scrollbar">
      <el-tree
        lazy
        ref="treeRef"
        node-key="id"
        highlight-current
        empty-text="暂无主机列表"
        :draggable="isEditable"
        :allow-drag="allowDrag"
        :allow-drop="allowDrop"
        :expand-on-click-node="false"
        :check-on-click-node="isMultiple"
        :check-strictly="isMultiple"
        :show-checkbox="isMultiple"
        :filter-node-method="hostFilter"
        :load="loadData"
        :props="{
          isLeaf: 'leaf',
          class: (n: ElementPlusTypes.TreeType.TreeNodeData) =>
            [
              n.host ? 'xnebula-left-border' : '',
              n.editInput ? 'xnebula-edit-input' : '',
              n.class || '',
            ]
              .join(' ')
              .replace(/\s+/g, ' ')
              .trim(),
        }"
        :indent="8"
        @node-contextmenu.prevent="contextMenu"
        @node-drop="handleDrop"
        @node-click="selectChange"
        @check="selectChange">
        <template #default="{ data }">
          <span v-if="data.editInput">
            <el-input
              ref="editRef"
              v-model="editName"
              size="small"
              placeholder="请输入名称"
              @keyup.enter="save"
              @click.stop>
              <template #append>
                <el-space :size="14">
                  <el-button type="success" icon="Check" @click.stop="save" />
                  <el-button type="danger" icon="Close" @click.stop="cancel" />
                </el-space>
              </template>
            </el-input>
          </span>
          <span class="host-label" v-else-if="data.host">
            <el-tooltip
              :content="`${data.label} ${data.host}`"
              placement="right">
              <span>
                <i :class="`host-icon ${data.icon}`" />
                <span>{{ data.label }}</span>
                <br />
                <i :class="`host-status${data.online ? ' online' : ''}`" />
                <span>{{ data.host }}</span>
              </span>
            </el-tooltip>
          </span>
          <span v-else>
            <span>{{ data.label }}</span>
            <span class="sublabel" v-if="data.sublabel">{{
              data.sublabel
            }}</span>
          </span>
        </template>
      </el-tree>
    </el-scrollbar>
    <Teleport to="body">
      <Transition name="xnebula-menu">
        <ul
          v-if="menuShow"
          :style="`left: ${menuPos.x}px; top: ${menuPos.y}px`"
          class="xnebula-host-tree-menu">
          <li @click="add">添加</li>
          <li @click="edit">修改</li>
          <li @click="del">删除</li>
        </ul>
      </Transition>
    </Teleport>
  </div>
</template>
<script lang="ts" setup>
import { ref, nextTick, watch, onMounted, onUnmounted } from 'vue';
import { ElementPlus, type ElementPlusTypes } from '@xnebula/components';
import type { TreeData, MoveType, Props, Emits, Expose } from './types';
const { ElTree, ElInput, ElNotification, ElMessageBox } = ElementPlus;
defineOptions({
  name: 'HostTree',
});
const props = withDefaults(defineProps<Props>(), {
  isEditable: false,
  isMultiple: false,
});
const emit = defineEmits<Emits>();
watch(
  () => props.isMultiple,
  () => {
    // 多选变化时将数据选择全部取消
    treeRef.value?.setCurrentKey();
    treeRef.value?.setCheckedKeys([]);
    selectData = [];
  },
);
// 单独选择
let selectData: TreeData[] = [];
const selectChange = (data: TreeData, node: any) => {
  if (data.editInput) {
    return;
  }
  if (props.isMultiple) {
    // 表示是点击触发
    if (data.disabled && node.expand && !node.isLeaf) {
      treeRef.value?.setCurrentKey();
      selectData = getCheckeds();
      node.expanded ? node.collapse() : node.expand();
    } else if (!node.expand) {
      // 做这个判断是因为click和check会触发两次，这里过滤掉click
      treeRef.value?.setCurrentKey();
      selectData = getCheckeds();
    }
  } else {
    // 如果选中第一层，则取消该变化
    if (node?.level === 1) {
      treeRef.value?.setCurrentKey(selectData[0]?.id, false);
      if (!node.isLeaf) {
        node.expanded ? node.collapse() : node.expand();
      }
    } else if (selectData[0]?.id !== data.id) {
      selectData = [data];
      // 触发选择事件
      emit('selectNode', data);
    }
  }
};
// checkbox 多选择
const setCheckeds = (data: TreeData[]) => {
  if (props.isMultiple) {
    selectData = data;
    treeRef.value?.setCheckedKeys(data.map((a) => a.id));
  }
};

const getCheckeds = (): TreeData[] => {
  if (props.isMultiple) {
    return treeRef.value?.getCheckedNodes(true) as TreeData[];
  }
  return [];
};
const updateData = (
  sData: ElementPlusTypes.TreeType.TreeNodeData,
  tData: Record<string, any>,
) => {
  for (const key in tData) {
    if (key === 'data') {
      sData[key] = {
        ...sData[key],
        ...tData[key],
      };
    } else {
      sData[key] = tData[key];
    }
  }
  return sData;
};
const findAndUpdate = (node: ElementPlusTypes.Node | null, data: TreeData) => {
  if (!node) return;
  // 表示该节点没有展开，并且有已加载好的子节点
  if (node.childNodes?.length === 0) {
    // 该节点有子数据，还没展开构成子节点，直接更新数据
    if (node.data.children?.length > 0) {
      const children = node.data.children || [];
      // 找没有展开的子节点
      const index = children.findIndex(({ id }: TreeData) => id === data.id);
      // 找到未展开的
      if (index !== -1) {
        updateData(children[index], data);
      }
    } else {
      // 表示该节点是叶子节点，或者没有子节点
    }
  } else {
    // 表示该节点被展开，继续寻找下面的节点
    // 后续更改，如果要 break 需要 for 循环
    (node.childNodes || []).forEach((n) => findAndUpdate(n, data));
  }
};
const updateNode = (data: TreeData[]) => {
  /* TODO:
    1，使用 node = treeRef.value?.getNode(data.id)，看是否已经构成节点，如果构成，节点也要合并更新（使用 node.setData(updateData(node.data, data))）
    2，没有构成节点，就使用 findData 找到未构成节点的节点数据 data（在父节点的 data.children 里），更新这个数据（直接合并替换 children 里的数据）
    3，再获取父数据 data.parent，看看id是否与更新的数据父id一致
    4，一致或传入的数据不存在父id，或该父id findData 没找到，则认为就只是更新数据，
    5，若存在且不一致，则表明节点移动到新的父节点，新父节点要变成非叶子节点，原父节点移除该节点，新父级节点增加该节点
    6，注意，父节点已经构成 Node，就是用 remove, append, isLeaf=false，无论有没有构成，都要操作 children, leaf=false
    7，如果 1 中没找到数据，则是新增节点，找该数据父节点，若找到，就放到该父节点下，和 6,7 一样操作父节点
    8，若没找到，就挂在 fixIds 或树的最后一个节点下
    9，在添加节点时注意数据合并更新，还有 class: pnode.level === 1 ? 'host-level-one' : '',disabled: pnode.level <= 1,
  */
  // 这里暂时不考虑节点移动(忽略了parent)和节点添加(忽略了parent和找不到节点)情况
  // 只考虑节点数据更新，后续有需要再扩展，按上述逻辑更新
  data.forEach((_data) => {
    const node = treeRef.value?.getNode(_data.id);
    if (node) {
      // 当前数据已经变成节点，更新节点
      node.setData(updateData(node.data, _data));
    } else {
      // 查找没有变成节点的数据进行更新
      findAndUpdate(rootNode, _data);
    }
  });
};

const getData = (key?: ElementPlusTypes.TreeType.TreeKey): TreeData[] => {
  if (!key) {
    const tdata: TreeData[] = [];
    const deData = (a: ElementPlusTypes.Node[]) =>
      a.forEach((b) => {
        tdata.push(b.data as TreeData);
        deData(b.childNodes || []);
      });
    deData(rootNode?.childNodes || []);
    return tdata;
  }
  const node = treeRef.value?.getNode(key);
  return !node ? [] : [node.data as TreeData];
};

defineExpose<Expose>({ updateNode, setCheckeds, getCheckeds, getData });

// 筛选主机
const keywords = ref<string>('');
const treeRef = ref<InstanceType<typeof ElTree>>();
watch(keywords, (val) => {
  // 该 filter 内会调用自定义的 hostFilter 方法进行筛选
  treeRef.value?.filter(val);
});
const hostFilter = (value: string, node: any) => {
  if (!value) return true;
  return node.label.toUpperCase().includes(value.toUpperCase());
};
const fixedIds: ElementPlusTypes.TreeType.TreeKey[] = [];
// 获取节点数据，并展开第一层
let rootNode: ElementPlusTypes.Node | null = null;
const loadData = async (
  node: ElementPlusTypes.Node,
  resolve: (data: TreeData[]) => void,
) => {
  // 记录最根部的节点
  if (node.level === 0) {
    rootNode = node;
  }
  let nodeData = [];
  if (node.data.children && node.data.children.length > 0) {
    // 如果当前节点存在子子数据（数据还没有构成节点），则直接把当前节点的子数据返回，无需再去获取
    nodeData = [...node.data.children];
    // 子数据已经返回去构成节点，清空数据（后续拿数据从节点里拿）
    node.data.children = [];
  } else {
    // 是否加一个 loading ?
    nodeData = await props.getNodeData(node.level + 1, node.data as TreeData);
  }
  if (node.level === 0) {
    nodeData.forEach(({ id, fixed }) => fixed && fixedIds.push(id));
  }
  resolve(
    nodeData.map((n) => ({
      class: node.level === 1 ? 'host-level-one' : '',
      disabled: node.level <= 1,
      ...n,
    })),
  );
  // 每次加载数据后都要对已选择的数据进行选择
  nextTick().then(() => {
    if (!selectData.length) {
      if (node.level === 0) {
        // 展开默认第一个有子节点的节点
        const _node = rootNode?.childNodes.find((n) => !n.isLeaf);
        _node && _node.expand();
      }
    } else {
      // 展开已选择的节点
      const expand = (a: TreeData) => {
        /* TODO:
          如果 a.parent 不存在，就使用 findData 找构成节点的节点数据 data（在父节点的 data.children 里）
          然后取数数据的 parent: const parent = a.parent || findParent(rootNode);
        */
        const parent = a.parent;
        parent && expand(parent);
        // 初始化的时候，只有父类展开后，才能找到子类节点，所以放在父节点展开之后获取
        const _node = treeRef.value?.getNode(a.id);
        _node && !_node.isLeaf && node.expand();
      };
      selectData.forEach((a) => expand(a));
    }
    if (props.isMultiple) {
      treeRef.value?.setCheckedKeys(selectData.map((a) => a.id));
    } else {
      treeRef.value?.setCurrentKey(selectData[0]?.id, false);
    }
  });
};
// 对节点的添加修改和刷新
const editName = ref<string>('');
const editRef = ref<InstanceType<typeof ElInput>>();
const menuShow = ref<boolean>(false);
const menuPos = ref<{ x: number; y: number }>({ x: 0, y: 0 });
let menuDataId: ElementPlusTypes.TreeType.TreeKey | null = null;
const contextMenu = (
  e: MouseEvent,
  data: TreeData,
  node: ElementPlusTypes.Node,
) => {
  if (
    !props.isEditable ||
    fixedIds.includes(data.id) ||
    data.editInput ||
    node.level > 1
  ) {
    return;
  }
  // 右键菜单弹出时先把上一次的编辑取消掉
  cancel();
  menuShow.value = true;
  menuPos.value = { x: e.clientX, y: e.clientY };
  menuDataId = data.id;
};
const hideMenu = () => {
  menuShow.value = false;
};
onMounted(() => {
  document.body.addEventListener('click', hideMenu);
});

onUnmounted(() => {
  document.body.removeEventListener('click', hideMenu);
});
const refresh = () => {
  // 是否需要删除所有节点再加载？
  const childNodes = rootNode ? [...rootNode.childNodes] : [];
  childNodes.forEach((n) => {
    treeRef.value?.remove(n);
  });
  rootNode && ((rootNode.loaded = false), rootNode.expand());
};
const cancel = () => {
  if (!props.isEditable) {
    return;
  }
  const node = treeRef.value?.getNode(menuDataId || -999);
  if (!menuDataId) {
    // 新添加的节点编辑，直接删除
    node && treeRef.value?.remove(node);
  } else if (node) {
    // 修改的节点编辑，恢复
    node.setData(updateData(node.data, { editInput: false }));
  }
  editName.value = '';
};
const add = () => {
  if (!props.isEditable) {
    return;
  }
  cancel();
  // 对于点击菜单中的添加，要把菜单数据置空
  menuDataId = null;
  // 在固定节点之前添加一个节点编辑
  treeRef.value?.insertBefore(
    {
      id: -999,
      label: '',
      editInput: true,
      leaf: true,
      disabled: true,
    },
    fixedIds[0],
  );
  editName.value = '';
  nextTick().then(() => editRef.value?.focus());
};
const edit = () => {
  if (!props.isEditable || !menuDataId) {
    return;
  }
  cancel();
  // 将修改的节点更改为节点编辑
  const node = treeRef.value?.getNode(menuDataId);
  node && node.setData(updateData(node.data, { editInput: true }));
  editName.value = node?.data.label;
  nextTick().then(() => {
    editRef.value?.select();
    editRef.value?.focus();
  });
};
const del = async () => {
  if (!props.isEditable || !props.delNode || !menuDataId) {
    return;
  }
  await ElMessageBox.confirm('您确定要删除该条数据吗？', '消息提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  });
  const willDelNode = treeRef.value?.getNode(menuDataId);
  if (willDelNode) {
    const result = await props.delNode(willDelNode.data as TreeData);
    if (result === 'forceUpdate') {
      // 暴力刷新
      refresh();
    } else if (result) {
      // 前端删除数据
      const fixedNode = treeRef.value?.getNode(fixedIds[0]);
      // 把删除的节点的所有子节点放入fixedId节点下
      fixedNode &&
        (willDelNode.childNodes || []).forEach((node) => {
          treeRef.value?.append(node.data, fixedNode);
        });
      // 删除对应节点
      treeRef.value?.remove(willDelNode);
      ElNotification({
        type: result ? 'success' : 'error',
        message: result ? '删除成功' : '删除失败',
      });
    }
  }
};
const save = async () => {
  const name = editName.value.trim();
  if (!props.isEditable || !props.saveNode || !name) {
    return;
  }
  const node = treeRef.value?.getNode(menuDataId || -999);
  if (node) {
    const resultData = await props.saveNode({
      ...(node.data as TreeData),
      label: name,
    });
    if (resultData === 'forceUpdate') {
      // 暴力刷新
      refresh();
    } else if (resultData) {
      // 前端保存数据
      const ndata = {
        ...node.data,
        ...resultData,
        label: name,
        editInput: false,
      };
      if (!menuDataId) {
        // 这里不能直接 setData，因为 id 变化了
        treeRef.value?.remove(node);
        treeRef.value?.insertBefore(ndata, fixedIds[0]);
      } else {
        node.setData(updateData(node.data, ndata));
      }
      editName.value = '';
      ElNotification({
        type: resultData ? 'success' : 'error',
        message: resultData ? '添加成功' : '添加失败',
      });
    }
  }
};

// 拖拽
const handleDrop = async (
  node0: ElementPlusTypes.Node,
  node: ElementPlusTypes.Node,
  type: ElementPlusTypes.TreeType.NodeDropType,
) => {
  if (!props.isEditable || !props.moveNode) {
    return;
  }
  let moveType: MoveType = '';
  if (node0.level === node.level) {
    if (type === 'before') {
      moveType = node0.level === 1 ? 'groupBefore' : 'hostBefore';
    } else if (type === 'after') {
      moveType = node0.level === 1 ? 'groupAfter' : 'hostAfter';
    }
  } else {
    moveType = 'hostToGroup';
  }
  const result = await props.moveNode(
    moveType,
    node0.data as TreeData,
    node.data as TreeData,
  );
  if (result && type === 'inner') {
    const index = selectData.findIndex(({ id }) => id === node0.data.id);
    // 当前拖动的正是已经选中的节点，更新已选中节点的父节点
    if (index !== -1) {
      selectData[index].parent = node.data as TreeData;
    }
  }
  if (result === 'forceUpdate') {
    // 暴力刷新
    refresh();
  } else if (result) {
    // 前端更新数据
    if (type === 'inner') {
      // 目标父节点变成非叶子节点
      node.isLeaf = false;
      // 被移动的节点更新父节点为目标节点
      node0.data.parent = node.data;
      node.expand();
    }
    ElNotification({
      type: result ? 'success' : 'error',
      message: result ? '执行成功' : '执行失败',
    });
  }
};
const allowDrop = (
  node0: ElementPlusTypes.Node,
  node: ElementPlusTypes.Node,
  type: ElementPlusTypes.TreeType.AllowDropType,
) =>
  props.isEditable &&
  !node0.data.editInput &&
  !node.data.editInput &&
  ((node0.level === node.level &&
    type !== 'inner' &&
    !fixedIds.includes(node.data.id)) ||
    (node0.level - node.level === 1 && type === 'inner'));
const allowDrag = (node: ElementPlusTypes.Node) =>
  props.isEditable && !node.data.editInput && !fixedIds.includes(node.data.id);
</script>
<style scoped>
.xnebula-host-tree {
  padding: 5px;
}

.xnebula-host-tree :deep(.el-input-group__prepend),
.xnebula-host-tree :deep(.el-input-group__append) {
  padding: 0 16px;
  background-color: #fff;
}

.xnebula-host-tree :deep(.el-space .el-space__item:last-child) {
  margin-right: 0 !important;
}

.xnebula-host-tree :deep(.el-input-group__prepend button.el-button) {
  padding: 3px 16px;
  font-size: 24px;
}

.xnebula-host-tree :deep(.el-input-group--append) {
  width: 95%;
}

.xnebula-host-tree :deep(.el-input-group__append button.el-button) {
  padding: 5px 14px;
  font-size: 20px;
}

.xnebula-host-tree :deep(.el-input-group__append button.el-button--success) {
  color: #67c23a;
}

.xnebula-host-tree
  :deep(.el-input-group__append button.el-button--success:hover) {
  color: #95d475;
}

.xnebula-host-tree
  :deep(.el-input-group__append button.el-button--success:active) {
  color: #529b2e;
}

.xnebula-host-tree :deep(.el-input-group__append button.el-button--danger) {
  color: #f56c6c;
}

.xnebula-host-tree
  :deep(.el-input-group__append button.el-button--danger:hover) {
  color: #f89898;
}

.xnebula-host-tree
  :deep(.el-input-group__append button.el-button--danger:active) {
  color: #c45656;
}

.xnebula-host-tree :deep(.el-input__suffix .el-input__icon) {
  font-size: 18px;
}

.xnebula-host-tree :deep(.xnebula-edit-input:hover > .el-tree-node__content),
:deep(.el-tree-node:focus > .el-tree-node__content) {
  background-color: transparent;
}

:deep(.el-tree-node > .el-tree-node__content:hover) {
  background-color: #f5f7fa;
}

:deep(
    .el-tree--highlight-current
      .el-tree-node.is-current:focus
      > .el-tree-node__content
  ),
:deep(
    .el-tree--highlight-current
      .el-tree-node.is-current
      > .el-tree-node__content:hover
  ) {
  background-color: #ecf5ff;
}

.xnebula-host-tree :deep(.xnebula-left-border) {
  border-left: 3px solid transparent;
}

.xnebula-host-tree :deep(.xnebula-left-border.is-current),
.xnebula-host-tree :deep(.xnebula-left-border.is-expanded) {
  border-left-color: #8dc6ff;
}

.xnebula-host-tree :deep(.el-tree-node__content) {
  height: 32px;
}

.xnebula-host-tree :deep(.host-level-one > .el-tree-node__content) {
  height: 48px;
}

.xnebula-host-tree .xnebula-tree-scrollbar {
  min-height: 60px;
  margin-top: 6px;
}

.xnebula-host-tree .host-label {
  border-bottom: 1px solid #ddd;
  text-align: left;
}

.xnebula-host-tree .host-status {
  display: inline-block;
  width: 12px;
  height: 12px;
  background-color: #f56c6c;
  border-radius: 50%;
}

.xnebula-host-tree .host-icon,
.xnebula-host-tree .host-status {
  margin-right: 4px;
}

.xnebula-host-tree .host-status.online {
  background-color: #67c23a;
}

.xnebula-host-tree .sublabel {
  margin-left: 5px;
  font-size: 12px;
  color: #aaa;
}

.xnebula-host-tree-menu {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999;
  min-width: 100px;
  padding: 5px 0;
  font-size: 12px;
  color: #444;
  list-style: none;
  background-color: #fff;
  box-shadow: 0 2px 6px rgb(63 71 102 / 20%);
  transition: opacity 0.2s ease;
}

.xnebula-host-tree-menu > li {
  height: 28px;
  padding: 0 16px;
  line-height: 28px;
  cursor: pointer;
}

.xnebula-host-tree-menu > li:hover,
.xnebula-host-tree-menu > li:focus {
  color: #409eff;
  background-color: #ecf5ff;
  outline: none;
}

.xnebula-menu-enter-from,
.xnebula-menu-leave-to {
  opacity: 0;
}
</style>
