<template>
  <div class="secs-viewer" style="height: 500px; margin-top: 30px">
    <div class="overflow-guard">
      <div class="line-viewer">
        <div class="guide-area">
          <!-- 行号 -->
          <div class="line-number">1</div>
          <!-- 代码折叠 -->
          <div class="code-collapse"></div>
          <!-- 用于美化的间距 -->
          <div class="line-blank"></div>
          <!-- 用于美化的间距 -->
          <div class="line-blank"></div>
        </div>
        <div class="code-area">
          <span>
            <span class="st1">&lt;</span>
            <span class="st2">L</span>
            <span class="st7">&nbsp;</span>
            <span class="st4">2</span>
          </span>
        </div>
      </div>
      <div class="line-viewer">
        <div class="guide-area">
          <!-- 行号 -->
          <div class="line-number">2</div>
          <!-- 代码折叠 -->
          <div class="code-collapse"></div>
          <!-- 用于美化的间距 -->
          <div class="line-blank"></div>
          <!-- 用于美化的间距 -->
          <div class="line-blank"></div>
        </div>
        <div class="code-area">
          <span>
            <span class="st7">&nbsp;</span>
            <span class="st7">&nbsp;</span>
            <span class="st1">&lt;</span>
            <span class="st2">A</span>
            <span class="st7">&nbsp;</span>
            <span class="st3">[4]</span>
            <span class="st7">&nbsp;</span>
            <span class="st6">MDLN</span>
            <span class="st7">&nbsp;</span>
            <span class="st5">'WXXX'</span>
            <span class="st1">&gt;</span>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup></script>
<style lang="scss" scoped>
.secs-viewer {
  overflow: auto;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 14px;
  line-height: 19px;
  border: 1px solid #ced4da;
  box-sizing: border-box;
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
      border: 1px solid #424242;
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
  line-height: 19px;
  cursor: text;
  flex: 1;

  span {
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
      color: orange;
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
}
</style>
