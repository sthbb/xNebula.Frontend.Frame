<template>
  <div style="width: 600px; height: calc(100% - 20px)">
    <div v-if="!showSecsComponent" class="secs-textarea-container">
      <el-input v-model="pureCode" type="textarea"></el-input>
      <div v-if="pureCode" class="secs-switch" @click="switchModeHandle">
        <el-tooltip content="切换到编辑器模式" placement="top" effect="light">
          <Switch />
        </el-tooltip>
      </div>
    </div>
    <div v-else class="secs-component">
      <SecsViewerHeader
        ref="secsHeader"
        :code="headerCode"
        :theme="theme"
        :edit="edit"
        @change="secsViewerHeaderChangeHandle"></SecsViewerHeader>
      <SecsViewerBody
        ref="secsBody"
        :code="code"
        :theme="theme"
        :edit="edit"
        @change="secsViewerBodyChangeHandle"></SecsViewerBody>
      <div v-if="pureCode" class="secs-switch" @click="switchModeHandle">
        <el-tooltip content="切换到文本编辑模式" placement="top" effect="light">
          <Switch />
        </el-tooltip>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import { SecsViewerHeader, SecsViewerBody } from '@/index.js';
import { ElInput, ElTooltip } from 'element-plus';
import { Switch } from '@element-plus/icons-vue';
const theme = ref('light');
const edit = ref(true);
const pureCode = ref('');
const code = ref('');
const headerCode = ref('');
const showSecsComponent = ref(false);
const secsHeader = ref(null);
const secsBody = ref(null);

// const c = `
// SEND D0 SSR_PPID_Scenario:S1F3 W [4026531841]
// <L 4
//   <A [4] MDLN 'WXXX'>
//   <A [6] SOFTREV 'VO1R01'>
//   <L 1
//     <A [6] SOFTREV 'VO1R01'>
//   <L 3
//     <A [6] SOFTREV 'VO1R01'>
//     <L 2
//       <A [4] MDLN 'WXXX'>
//       <A [6] SOFTREV 'VO1R01'>
//     <A [6] SOFTREV 'VO1R02'>
//       `;

const getCode = () => {
  const headerInfo = secsHeader.value.getCode();
  const bodyInfo = secsBody.value.getCode();
  const codeArr = [...headerInfo.list, ...bodyInfo.list];

  return codeArr.join('\n');
};

const switchModeHandle = () => {
  if (pureCode.value) {
    // 切换到编辑器模式
    if (!showSecsComponent.value) {
      const pureCodeArr = pureCode.value.split('\n');
      headerCode.value = pureCodeArr[0];
      code.value = pureCodeArr.slice(1).join('\n');
    } else {
      // 切换到文本模式
      const _code = getCode();
      pureCode.value = _code;
    }
    showSecsComponent.value = !showSecsComponent.value;
  }
};

const secsViewerHeaderChangeHandle = ({ type }) => {
  console.log(`secsViewerHeader ${type} 成功`);
};

const secsViewerBodyChangeHandle = ({ type }) => {
  console.log(`secsViewerBody ${type} 成功`);
};
</script>
<style lang="scss" scoped>
.secs-textarea-container,
.secs-component {
  position: relative;
  height: 100%;

  .secs-switch {
    position: absolute;
    top: 0;
    right: 15px;
    display: flex;
    width: 20px;
    height: 20px;
    cursor: pointer;
    align-items: center;
    justify-content: center;

    svg {
      width: 14px;
      height: 14px;
      color: green;
      outline: none;
    }
  }
}

.secs-textarea-container {
  .el-textarea {
    height: 100%;
    font-family: Consolas, 'Courier New', monospace;
    font-size: 14px;
    line-height: 19px;

    :deep(.el-textarea__inner) {
      height: 100% !important;
    }
  }
}
</style>
