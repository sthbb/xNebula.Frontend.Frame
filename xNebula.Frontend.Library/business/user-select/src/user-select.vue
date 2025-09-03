<template>
  <span class="xnebula-user-select">
    <span
      class="xnebula-user-select-action"
      v-loading.fullscreen.lock="loading"
      element-loading-text="Loading..."
      element-loading-background="rgba(0,0,0,0.3)"
      @click="visible = true">
      <el-button v-if="!$slots.action" type="success" icon="CirclePlus">
        选择用户
      </el-button>
      <slot name="action"></slot>
    </span>
    <el-dialog
      class="xnebula-user-select-modal"
      v-model="visible"
      title="选择用户"
      width="1000"
      append-to-body
      draggable
      center>
      <el-container>
        <el-aside width="230px">
          <el-input
            v-model="orgKeywords"
            placeholder="请输入关键字"
            prefix-icon="Search"
            clearable />
          <el-scrollbar class="tree-scrollbar">
            <el-tree
              ref="orgRef"
              node-key="id"
              empty-text="暂无组织"
              highlight-current
              :expand-on-click-node="false"
              :default-expanded-keys="defaultExpandedOrgKeys"
              :filter-node-method="orgFilter"
              :data="orgData"
              @node-click="selectOrg">
              <template #default="{ data }">
                <i :class="data.icon" />
                <span class="el-tree-node__label">{{ data.label }} </span>
              </template>
            </el-tree>
          </el-scrollbar>
        </el-aside>
        <el-main>
          <el-row style="margin-bottom: 10px">
            <el-col :span="2">
              <span class="keyword-label">关键字：</span>
            </el-col>
            <el-col :span="6">
              <el-input
                clearable
                placeholder="编号或姓名"
                v-model="userKeywords" />
            </el-col>
            <el-col :span="4">
              <el-button
                type="primary"
                style="margin-left: 12px"
                icon="Search"
                @click="userQuery">
                查询
              </el-button>
            </el-col>
          </el-row>
          <el-table
            style="width: 100%"
            height="396"
            ref="userRef"
            empty-text="暂无用户"
            row-key="id"
            size="default"
            show-overflow-tooltip
            :data="userData"
            @row-click="rowClick"
            @select="selectOne"
            @select-all="selectAll">
            <el-table-column type="selection" width="40" />
            <el-table-column type="index" label="#" width="100" />
            <el-table-column property="code" label="编号" width="120" />
            <el-table-column property="account" label="账号" width="120" />
            <el-table-column property="name" label="姓名" width="120" />
            <el-table-column label="组织">
              <template #default="{ row }">
                <span
                  :key="index"
                  v-for="(orgName, index) in row.orgNames || []">
                  <span>{{ orgName }}</span>
                  <br v-if="index < row.orgNames.length" />
                </span>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            layout="total, prev, pager, next"
            :current-page="pagination.current"
            :page-size="pagination.pageSize"
            :total="pagination.total"
            @current-change="pageChange" />
          <el-scrollbar class="tag-scrollbar">
            <span>已选择用户：</span>
            <el-tag
              v-for="sel in selectionData"
              :key="sel.id"
              closable
              size="large"
              @close="selClose(sel)"
              >{{ sel.name }}</el-tag
            >
          </el-scrollbar>
        </el-main>
      </el-container>
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="confirm"> 确定 </el-button>
          <el-button @click="visible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </span>
</template>
<script lang="ts" setup>
import {
  ref,
  shallowRef,
  reactive,
  nextTick,
  computed,
  watch,
  toRaw,
} from 'vue';
import { ElementPlus } from '@xnebula/components';
import type { Org, User, Props, Emits, Slots } from './types';

defineOptions({
  name: 'UserSelect',
});
defineSlots<Slots>();

const props = withDefaults(defineProps<Props>(), {
  isMultiple: true,
  selectedUser: () => [],
});
const emit = defineEmits<Emits>();

// 打开选择框，初始获取组织和用户数据
const visible = ref<boolean>(false);
watch(visible, (v) => {
  if (v) {
    if (props.isMultiple) {
      selectionData.value = [...(props.selectedUser ?? [])];
    } else {
      // 单选只保留最后一个
      const last = (props.selectedUser ?? []).pop();
      selectionData.value = last ? [last] : [];
    }
    // 如果当前没有选择的组织节点，就认为还没有初始化查询
    if (!currentOrg.value) {
      orgQuery();
    } else {
      userRef.value?.clearSelection();
      selectionData.value.forEach((s) => {
        const row = userData.value.find((u) => s.id === u.id);
        if (row) {
          userRef.value?.toggleRowSelection(row, true);
        }
      });
    }
  } else {
    selectionData.value = [];
    userRef.value?.clearSelection();
    emit('cancel');
  }
});
// 确定
const confirm = () => {
  visible.value = false;
  emit('confirm', [...toRaw(selectionData.value)]);
};
// 获取组织数据
const orgData = shallowRef<Org[]>([]);
const orgQuery = () => {
  loading.value = true;
  return props.requestOrg().then((orgs) => {
    loading.value = false;
    orgData.value = [...orgs];
    const current = currentOrg.value ? currentOrg.value : orgs[0];
    selectOrg(current);
    // 数据刚刚加载还没有挂到dom，所以操作需要放在nextTick中
    nextTick().then(() => {
      orgRef.value?.setCurrentKey(current.id);
    });
  });
};
// 根据组织数据计算默认展开key
const defaultExpandedOrgKeys = computed(() =>
  orgData.value.map(({ id }) => id),
);
// 当前选择的组织
const currentOrg = ref<Org | null>(null);
// 选择一个组织并加载对应用户数据
const selectOrg = (org: Org) => {
  currentOrg.value = { ...org };
  userQuery();
};
// 筛选组织数据
const orgKeywords = ref<string>('');
const orgRef = ref<InstanceType<typeof ElementPlus.ElTree>>();
watch(orgKeywords, (val) => {
  // 该filter内会调用自定义的orgFilter方法进行筛选
  orgRef.value?.filter(val);
});
const orgFilter = (value: string, node: any) => {
  if (!value) return true;
  return node.label.toUpperCase().includes(value.toUpperCase());
};
// 获取用户数据和关键字查询
const userKeywords = ref<string>('');
const userData = shallowRef<User[]>([]);
const loading = ref<boolean>(false);
const userQuery = () => {
  loading.value = true;
  return props
    .requestUser({
      pageIndex: pagination.current,
      pageSize: pagination.pageSize,
      keyword: userKeywords.value,
      currentOrg: currentOrg.value ? { ...toRaw(currentOrg.value) } : null,
    })
    .then((pageUser) => {
      userData.value = pageUser.data;
      pagination.total = pageUser.total;
      loading.value = false;
      // 每次查询之后要把包含的已选择数据选中
      selectionData.value.forEach((s) => {
        const row = userData.value.find((u) => s.id === u.id);
        if (row) {
          // 数据刚刚加载还没有挂到dom，所以操作需要放在nextTick中
          nextTick().then(() => {
            userRef.value?.toggleRowSelection(row, true);
          });
        }
      });
    });
};
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
const pageChange = (current: number) => {
  pagination.current = current;
  userQuery();
};
// 用户选择
const userRef = ref<InstanceType<typeof ElementPlus.ElTable>>();
const selectionData = ref<User[]>([]);
// 点击行的时候选中或取消选中
const rowClick = (row: User) => {
  const selectedIndex = selectionData.value.findIndex((u) => row.id === u.id);
  const noSelected = selectedIndex === -1;
  if (props.isMultiple) {
    userRef.value?.toggleRowSelection(row, noSelected);
    if (noSelected) {
      selectionData.value.push(row);
    } else {
      selectionData.value.splice(selectedIndex, 1);
    }
  } else {
    userRef.value?.clearSelection();
    if (noSelected) {
      userRef.value?.toggleRowSelection(row, true);
    }
    selectionData.value = noSelected ? [row] : [];
  }
};
const crossSel = (selection: User[]) => {
  const tempSelection = [...selection];
  const newSelectionData: User[] = [];
  selectionData.value.forEach((sel) => {
    // 找出选择数据和当前页面相交的部分
    const row = userData.value.find((u) => sel.id === u.id);
    if (row) {
      // 相交的部分看看是否在 selection 里面，在的话放进去，同时删除当前这个
      const crossIndex = tempSelection.findIndex((s) => row.id === s.id);
      if (crossIndex !== -1) {
        newSelectionData.push(sel);
        tempSelection.splice(crossIndex, 1);
      }
    } else {
      // 不相交的部分直接放进去
      newSelectionData.push(sel);
    }
  });
  selectionData.value = newSelectionData.concat(tempSelection);
};
const selectOne = (selection: User[], row: User) => {
  if (props.isMultiple) {
    crossSel(selection);
  } else {
    userRef.value?.clearSelection();
    const selected = selectionData.value.find((u) => row.id === u.id);
    if (!selected) {
      userRef.value?.toggleRowSelection(row, true);
    }
    selectionData.value = !selected ? [row] : [];
  }
};
// 点击行的时候选中或取消选中
const selectAll = (selection: User[]) => {
  if (props.isMultiple) {
    crossSel(selection);
  } else {
    userRef.value?.clearSelection();
    const row = userData.value.find((u) => selectionData.value[0]?.id === u.id);
    if (row) {
      userRef.value?.toggleRowSelection(row, true);
    }
  }
};
// 叉掉已选中的数据
const selClose = (sel: User) => {
  // 去掉表格里的勾选
  const row = userData.value.find((u) => sel.id === u.id);
  if (row) {
    userRef.value?.toggleRowSelection(row, false);
  }
  selectionData.value = selectionData.value.filter((u) => sel.id !== u.id);
};
</script>
<style>
.xnebula-user-select-modal.el-dialog {
  padding: 0;
  margin-top: calc((100vh - 700px) / 2);
  border-radius: 4px;
}

.xnebula-user-select-modal.el-dialog .el-dialog__header {
  padding: 12px 18px;
  margin-right: 0;
  text-align: left;
  background-color: #fafafa;
  border-radius: 4px 4px 0 0;
  border-bottom: 1px solid #ebeef5;
  user-select: none;
}

.xnebula-user-select-modal.el-dialog .el-dialog__body {
  padding: 12px 18px 0;
}

.xnebula-user-select-modal.el-dialog .el-dialog__footer {
  padding: 12px 18px 18px;
}

.xnebula-user-select-modal.el-dialog .el-dialog__title {
  font-size: 14px;
  font-weight: bold;
  color: #606266;
}

.xnebula-user-select-modal.el-dialog .el-dialog__headerbtn {
  top: 0;
}

.xnebula-user-select-modal.el-dialog .tree-scrollbar {
  height: 504px;
  margin-top: 8px;
}

.xnebula-user-select-modal.el-dialog .iconfont {
  margin: 4px;
  font-size: 16px !important;
}

.xnebula-user-select-modal.el-dialog .el-aside {
  padding-right: 16px;
}

.xnebula-user-select-modal.el-dialog .el-main {
  padding: 0;
}

.xnebula-user-select-modal.el-dialog .el-pagination {
  justify-content: right;
  margin-top: 5px;
}

.xnebula-user-select-modal.el-dialog .tag-scrollbar {
  height: 74px;
  margin-top: 5px;
}

.xnebula-user-select-modal.el-dialog .keyword-label {
  display: inline-flex;
  align-items: center;
  height: 100%;
}

.xnebula-user-select-modal.el-dialog .el-tag {
  margin-right: 8px;
  margin-bottom: 5px;
}
</style>
