<template>
  <div
    :class="[
      'secs-viewer',
      {
        'secs-viewer--dark': props.theme === 'dark',
      },
    ]">
    <div class="overflow-guard">
      <div
        v-show="showLineList.includes(index + 1)"
        :class="[
          'line-viewer',
          {
            'line-viewer--edit': props.edit === true,
          },
        ]"
        v-for="(item, index) in renderList"
        :key="index">
        <div class="guide-area">
          <!-- 行号 -->
          <div class="line-number">{{ index + 1 }}</div>
          <!-- 代码折叠 -->
          <div
            v-if="
              rangeMap[`line_${index + 1}`]['parentNode'] === false &&
              props.edit === false
            "
            class="code-collapse--empty"></div>
          <div
            v-if="
              rangeMap[`line_${index + 1}`] &&
              rangeMap[`line_${index + 1}`]['parentNode'] === true &&
              props.edit === false
            "
            :class="[
              'code-collapse',
              {
                'code-collapse--unexpand':
                  rangeMap[`line_${index + 1}`]['isExpand'] === false,
              },
            ]"
            @click="toggleExpandHandle(index + 1)"></div>
          <!-- 修改代码的状态不支持折叠 -->
          <div v-if="props.edit === true" class="code-collapse--empty"></div>
          <!-- 用于美化的间距 -->
          <div class="line-blank"></div>
        </div>
        <div
          :class="[
            'code-area',
            {
              'code-area--pointer': props.edit === true,
            },
          ]">
          <span v-for="(token, idx) in item['members']" :key="idx">
            <span
              v-if="token.key !== 'string'"
              v-html="token.value"
              :class="`st${token.type}`"></span>
            <code v-else :class="`st${token.type}`">
              {{ token.value }}
            </code>
          </span>
          <!-- 折叠行示意 -->
          <span
            v-if="
              rangeMap[`line_${index + 1}`]['parentNode'] === true &&
              rangeMap[`line_${index + 1}`]['isExpand'] === false
            "
            >...</span
          >
          <span class="line-action">
            <el-tooltip content="修改" placement="top" effect="light">
              <Edit class="line--edit" @click="editHandle(item)" />
            </el-tooltip>
            <el-tooltip content="往下添加一行" placement="top" effect="light">
              <CirclePlus class="line--add" @click="addHandle(item)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top" effect="light">
              <Delete class="line--delete" @click="deleteHandle(item)" />
            </el-tooltip>
          </span>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="actionDialogVisible"
      :title="actionTitle"
      append-to-body
      width="500">
      <el-input v-model="editCode" type="textarea" :rows="10" />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="actionDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitConfirmHandle"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup name="SecsViewerBody">
import { nextTick, ref, watch } from 'vue';
import { getTokens } from '../utils/lexical.js';
import { getRenderListByTokens } from '../utils/renderList.js';
import {
  ElMessageBox,
  ElDialog,
  ElButton,
  ElInput,
  ElTooltip,
} from 'element-plus';
import { CirclePlus, Edit, Delete } from '@element-plus/icons-vue';
const props = defineProps({
  theme: {
    type: String,
    default: 'light',
  },
  code: {
    type: String,
    default: '',
  },
  compareCode: {
    type: String,
    default: '',
  },
  // 默认折叠第一个节点
  defaultExpand: {
    type: Boolean,
    default: false,
  },
  // 是否可以修改代码
  edit: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['change']);
const actionDialogVisible = ref(false);
const actionTitle = ref('');
const actionType = ref(''); // edit add
const editCode = ref('');
const editItem = ref(null);

const rangeMap = ref({});
const showLineList = ref([]); // 用于存放需要显示的列
const renderList = ref([]);
const lineTree = ref([]);

// 普通渲染 格式化、着色、缩进
const normalRender = (tokens) => {
  const {
    renderList: _renderList,
    rangeMap: _rangeMap,
    lineTree: _lineTree,
  } = getRenderListByTokens(tokens);
  let _showLineList = [];

  // 默认折叠第一个节点
  if (props.defaultExpand) {
    if (_renderList.length !== 0 && _renderList.length > 1) {
      Object.keys(_rangeMap).forEach((key) => {
        if (_rangeMap[key]['line'] === 1) {
          if (_rangeMap[key]['isExpand'] === true) {
            _rangeMap[key]['isExpand'] = false;
            _showLineList.push(_rangeMap[key]['line']);
          }
        }
      });
    } else {
      _showLineList = _renderList.map((item) => item.line);
    }
  } else {
    _showLineList = _renderList.map((item) => item.line);
  }

  rangeMap.value = _rangeMap;
  showLineList.value = _showLineList;
  renderList.value = _renderList;
  lineTree.value = _lineTree;
};

watch(
  () => props,
  (newVal) => {
    const { code } = newVal;

    // 根据是否传入compareCode来判断是否需要进行代码比较
    const tokens = getTokens(code); // 词法分析获取token
    // 普通渲染
    normalRender(tokens);
  },
  {
    immediate: true,
  },
);

// 展开折叠点击事件
const toggleExpandHandle = (line) => {
  rangeMap.value[`line_${line}`]['isExpand'] =
    !rangeMap.value[`line_${line}`]['isExpand'];

  // 展开折叠状态修改完毕以后，计算用于显示的行
  nextTick(() => {
    const _showLineList = [];

    const getShowLineListHandle = (list = [], parentExpand) => {
      let expandStatus = null;
      list.forEach((item) => {
        const children = item['children'];
        const parentNode = rangeMap.value[`line_${item['line']}`]['parentNode'];

        if (parentExpand === null) {
          expandStatus = rangeMap.value[`line_${item['line']}`]['isExpand'];
          _showLineList.push(item['line']);
        }
        // 不是父节点，但父节点的展开状态为展开
        if (parentExpand) {
          _showLineList.push(item['line']);
        }
        if (parentNode && children && children.length !== 0) {
          const isExpand = rangeMap.value[`line_${item['line']}`]['isExpand'];
          if (parentExpand === null) {
            expandStatus = isExpand;
          } else {
            expandStatus = parentExpand ? isExpand : parentExpand;
          }
          getShowLineListHandle(children, expandStatus);
        }
      });
    };

    // console.log(lineTree);
    getShowLineListHandle(lineTree.value, null);

    // console.log(_showLineList);
    showLineList.value = _showLineList;
  });
};

// 获取当前的文本
const getCode = () => {
  const list = [];
  renderList.value.forEach((item) => {
    list.push(item['text']);
  });
  return {
    list,
    text: list.join('\n'),
  };
};

// 点击修改代码
const editHandle = (item) => {
  const text = item['text'];
  editCode.value = text;
  editItem.value = item;
  actionType.value = 'edit';
  actionTitle.value = '修改代码';
  actionDialogVisible.value = true;
};

// 提交
const submitConfirmHandle = () => {
  const { line } = editItem.value;
  const idx = line - 1;
  const { list } = getCode();
  let code;
  // 添加行
  if (actionType.value === 'add') {
    list.splice(idx + 1, 0, editCode.value);
    code = list.join('\n');
  }

  // 修改行
  if (actionType.value === 'edit') {
    list[idx] = editCode.value;
    code = list.join('\n');
  }

  const tokens = getTokens(code); // 词法分析获取token
  // 普通渲染
  normalRender(tokens);
  actionDialogVisible.value = false;
  emit('change', { type: actionType.value });
};

// 点击添加代码
const addHandle = (item) => {
  const { line } = item;
  editCode.value = '';
  editItem.value = item;
  actionType.value = 'add';
  actionTitle.value = '添加代码';

  ElMessageBox.confirm(`在第${line}行下面添加一行代码?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  })
    .then(() => {
      actionDialogVisible.value = true;
    })
    .catch(() => {});
};

// 点击删除代码
const deleteHandle = (item) => {
  const { line } = item;
  ElMessageBox.confirm(`删除第${line}行代码?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  })
    .then(() => {
      const { list } = getCode();
      list.splice(line - 1, 1);
      const code = list.join('\n');
      const tokens = getTokens(code); // 词法分析获取token
      // 普通渲染
      normalRender(tokens);
      emit('change', { type: 'delete' });
    })
    .catch(() => {});
};

defineExpose({
  getCode,
});
</script>
<style lang="scss" scoped>
.secs-viewer {
  overflow: auto;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 14px;
  line-height: 19px;
  border-top: none;
  box-sizing: border-box;

  &--dark {
    background: #1e1e1e;

    .line-viewer {
      &--edit {
        &:hover {
          background: #333;
        }
      }
    }
  }
}

.overflow-guard {
  /* overflow: hidden; */
  position: relative;

  &:hover .code-collapse {
    opacity: 1;
  }
}

.line-viewer {
  display: flex;
  cursor: default;

  &--edit {
    cursor: pointer;

    &:hover {
      background: #f2f7ff;

      .line-action {
        display: flex;
      }
    }
  }
}

/* 行号等相关区域 */
.guide-area {
  display: flex;
  min-width: 70px;
  justify-content: flex-start;

  .line-number {
    width: 40px;
    color: #237893;
    text-align: right;
  }

  // 代码折叠按钮
  .code-collapse {
    position: relative;
    width: 19px;
    height: 19px;
    margin: 0 3px 0 8px;
    cursor: pointer;
    opacity: 0;

    &::before {
      position: absolute;
      width: 8px;
      height: 8px;
      border: 1px solid #666;
      content: '';
      transform: translate(50%, 50%) rotateZ(-45deg);
      border-top: 0;
      border-right: 0;
    }
  }

  .code-collapse--empty {
    position: relative;
    width: 19px;
    height: 19px;
    margin: 0 3px 0 8px;
    opacity: 1;
  }

  .code-collapse.code-collapse--unexpand {
    &::before {
      transform: translate(20%, 65%) rotateZ(-135deg);
    }
  }
  // 代码折叠按钮

  // 用于美化的行间距
  .line-blank {
    width: 10px;
    height: 19px;
  }
}

/* 代码内容相关区域 */
.code-area {
  position: relative;
  line-height: 19px;
  cursor: text;
  flex: 1;

  &--pointer {
    cursor: pointer;
  }

  span {
    color: #666;
    // 界符样式
    .st1 {
      color: #319331;
    }
    // 关键字
    .st2 {
      color: red;
    }
    // 值判断
    .st3 {
      color: orange;
    }
    // 整型
    .st4 {
      color: #03a9f4;
    }
    // 字符串类型
    .st5 {
      color: red;
    }
    // 指令
    .st6 {
      color: #1596c9;
    }
  }

  .line-action {
    position: absolute;
    top: 2px;
    right: 0;
    display: none;
    height: 17px;
    overflow: hidden;
    align-items: center;

    svg {
      width: 14px;
      height: 14px;
      margin-right: 5px;
      outline: none;

      &:last-child {
        margin-right: 0;
      }
    }

    svg.line--edit {
      color: orange;
    }

    svg.line--add {
      color: green;
    }

    svg.line--delete {
      color: red;
    }
  }
}
</style>
