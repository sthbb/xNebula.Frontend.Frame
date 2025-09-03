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
        :class="[
          'line-viewer',
          {
            'line-viewer--remove': item.lineStatus === 'remove',
            'line-viewer--add': item.lineStatus === 'add',
          },
        ]"
        v-for="(item, index) in renderList"
        :key="index">
        <div class="guide-area">
          <!-- 行号 -->
          <div class="line-number">
            {{
              item.lineStatus === 'remove' || item.lineStatus === 'same'
                ? item.line
                : ''
            }}
          </div>
          <!-- 用于美化的间距 -->
          <div class="line-blank"></div>
          <!-- 行号 -->
          <div class="line-compare-number">
            {{ item.lineStatus === 'add' ? item.line : '' }}
          </div>
          <!-- 用于美化的间距 -->
          <div class="line-blank"></div>
          <!-- 此行的状态 -->
          <div
            :class="[
              'line-status',
              {
                'line-status--remove': item.lineStatus === 'remove',
                'line-status--add': item.lineStatus === 'add',
              },
            ]">
            {{ item.lineStatus === 'remove' ? '-' : '' }}
            {{ item.lineStatus === 'add' ? '+' : '' }}
          </div>
          <!-- 用于美化的间距 -->
          <div class="line-blank"></div>
        </div>
        <div class="code-area">
          <span>
            <span
              :class="[
                {
                  remove: ite.status === 'remove',
                  add: ite.status === 'add',
                },
              ]"
              v-for="(ite, idx) in item.members"
              :key="idx"
              v-html="ite.value">
            </span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup name="SecsViewerCompare">
import { ref, watch } from 'vue';
import { getTokens } from './utils/lexical.js';
import { getRenderListByTokens } from './utils/renderList.js';
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
});

const renderList = ref([]);

// 比较单行成员
const compareMember = (_item, _compareItem) => {
  const item = _item ? JSON.parse(JSON.stringify(_item)) : null;
  const compareItem = _compareItem
    ? JSON.parse(JSON.stringify(_compareItem))
    : null;
  const finalItems = [];
  const tplItem = {
    line: 0,
    lineStatus: '',
    members: [],
    text: '',
  };

  const removeItem = JSON.parse(JSON.stringify(tplItem));
  if (item) {
    removeItem.line = item.line;
    removeItem.lineStatus = 'remove';
    removeItem.text = item.text;
  }

  const addItem = JSON.parse(JSON.stringify(tplItem));
  if (compareItem) {
    addItem.line = compareItem.line;
    addItem.lineStatus = 'add';
    addItem.text = compareItem.text;
  }

  const sameItem = JSON.parse(JSON.stringify(tplItem));
  if (item) {
    sameItem.line = item.line;
    sameItem.lineStatus = 'same';
    sameItem.members = item.members;
    sameItem.text = item.text;
  }

  // 如果两行代码一样
  if (item && compareItem && item.text === compareItem.text) {
    finalItems.push(sameItem);
  } else {
    // 如果两行代码不一样
    while (item && item.members.length !== 0) {
      const nItem = item.members.shift();
      const cItem =
        compareItem && compareItem.members.length !== 0
          ? compareItem.members.shift()
          : null;
      if (cItem) {
        if (nItem.value === cItem.value) {
          const sameMember = JSON.parse(JSON.stringify(nItem));
          sameMember.status = 'same';
          removeItem.members.push(sameMember);
          addItem.members.push(sameMember);
        } else {
          const removeMember = JSON.parse(JSON.stringify(nItem));
          removeMember.status = 'remove';
          removeItem.members.push(removeMember);

          const addMember = JSON.parse(JSON.stringify(cItem));
          addMember.status = 'add';
          addItem.members.push(addMember);
        }
      } else {
        const removeMember = JSON.parse(JSON.stringify(nItem));
        removeMember.status = 'remove';
        removeItem.members.push(removeMember);
      }
    }

    while (compareItem && compareItem.members.length !== 0) {
      const cItem = compareItem.members.shift();
      const addMember = JSON.parse(JSON.stringify(cItem));
      addMember.status = 'add';
      addItem.members.push(addMember);
    }

    if (item) {
      finalItems.push(removeItem);
    }
    if (compareItem) {
      finalItems.push(addItem);
    }
  }

  return finalItems;
};

// 比较渲染 格式化、着色
const compareRender = (tokens, compareTokens) => {
  const { renderList: _renderList } = getRenderListByTokens(tokens);
  const { renderList: _compareRenderList } =
    getRenderListByTokens(compareTokens);

  console.log(_renderList);
  console.log(_compareRenderList);

  let __renderList = [];

  // 渲染数据结构设计，是renderList的增强版本
  // const renderItem = {
  //   line: 1,
  //   lineStatus: "", // 新增行状态, same：一致, remove:删除代码, add:新增代码
  //   members: [
  //     {
  //       key: "",
  //       type: "",
  //       value: "",
  //       status: "", // 新增字符状态
  //     },
  //   ],
  //   text: "",
  // };

  while (_renderList && _renderList.length !== 0) {
    const item = _renderList.shift();
    const compareItem =
      _compareRenderList && _compareRenderList.length !== 0
        ? _compareRenderList.shift()
        : null;
    // 比较行
    const list = compareMember(item, compareItem);
    __renderList = __renderList.concat(list);
  }

  while (_compareRenderList && _compareRenderList.length !== 0) {
    const item = null;
    const compareItem =
      _compareRenderList.length !== 0 ? _compareRenderList.shift() : null;
    // 比较行
    const list = compareMember(item, compareItem);
    __renderList = __renderList.concat(list);
  }

  return __renderList;
};

watch(
  () => props,
  (newVal) => {
    const { code, compareCode } = newVal;
    const tokens = getTokens(code); // 词法分析获取token
    const compareTokens = getTokens(compareCode); // 词法分析获取token
    const list = compareRender(tokens, compareTokens);
    renderList.value = list;
  },
  {
    immediate: true,
  },
);
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
  }
}

.overflow-guard {
  /* overflow: hidden; */
  position: relative;
}

.line-viewer {
  display: flex;
  cursor: default;
}

.line-viewer.line-viewer--add {
  background: #e6ffed;
}

.line-viewer.line-viewer--remove {
  background: #ffeef0;
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

  // 用于美化的行间距
  .line-blank {
    width: 10px;
    height: 19px;
  }

  // 比较行的编号
  .line-compare-number {
    width: 40px;
    height: 19px;
    color: #237893;
    text-align: center;
  }

  // 此行代码的状态
  .line-status {
    width: 10px;
    height: 19px;
    text-align: center;

    &--remove {
      color: red;
    }

    &--add {
      color: green;
    }
  }
}

/* 代码内容相关区域 */
.code-area {
  line-height: 19px;
  cursor: text;
  flex: 1;

  span {
    color: #666;

    .remove {
      background: #fb8787;
    }

    .add {
      background: #0eff52;
    }
  }
}
</style>
