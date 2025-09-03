<template>
  <div
    :class="[
      'secs-viewer-header',
      {
        'secs-viewer-header--dark': props.theme === 'dark',
      },
      {
        'secs-viewer-header--pointer': props.edit === true,
      },
    ]"
    @click="editHandle">
    <div v-if="!editStatus" :title="headerCode">{{ headerCode }}</div>
    <div v-else>
      <input
        ref="headerInput"
        type="text"
        v-model="tempCode"
        @input="inputHandle"
        @keydown.enter="saveHandle"
        @blur="saveHandle" />
    </div>
  </div>
</template>

<script setup name="SecsViewerHeader">
import { ref, watch } from 'vue';
const props = defineProps({
  theme: {
    type: String,
    default: 'light',
  },
  code: {
    type: String,
    default: '',
  },
  edit: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(['change']);
const headerInput = ref(null);
const headerCode = ref('');
const tempCode = ref('');
const editStatus = ref(false); // 修改状态

// 点击修改事件
const editHandle = () => {
  if (props.edit) {
    editStatus.value = true;
    tempCode.value = headerCode.value;
    setTimeout(() => {
      headerInput.value.focus();
    }, 10);
  }
};

// 输入事件
const inputHandle = () => {
  headerCode.value = tempCode.value;
};

// 失去焦点保存值
const saveHandle = () => {
  if (props.edit) {
    editStatus.value = false;
    console.log(`保存成功: ${headerCode.value}`);
    emit('change', { type: 'save' });
  }
};

// 获取当前的文本
const getCode = () => {
  const list = [];
  const _tempCode = headerCode.value.replace('\n', '');
  list.push(_tempCode);

  return {
    list,
    text: `${_tempCode}\n`,
  };
};

watch(
  () => props,
  (newVal) => {
    const { code: _code } = newVal;
    if (_code) {
      headerCode.value = _code;
    }
  },
  {
    immediate: true,
  },
);

defineExpose({
  getCode,
});
</script>

<style lang="scss" scoped>
.secs-viewer-header {
  height: 19px;
  padding-left: 34px;
  overflow: hidden;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 14px;
  line-height: 19px;
  box-sizing: border-box;

  &--dark {
    color: #fff;
    background: #1e1e1e;

    div {
      input[type='text'] {
        color: #fff;
        background: transparent;
      }
    }
  }

  &--pointer {
    cursor: pointer;
  }

  div {
    input[type='text'] {
      width: 100%;
      font-family: Consolas, 'Courier New', monospace;
      font-size: 14px;
      background: transparent;
      border: none;

      &:focus {
        outline: none;
      }
    }
  }
}
</style>
