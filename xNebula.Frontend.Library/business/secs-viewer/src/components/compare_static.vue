<template>
  <div class="secs-viewer" style="height: 500px; margin-top: 30px">
    <div class="overflow-guard">
      <div class="line-viewer">
        <div class="guide-area">
          <!-- 行号 -->
          <div class="line-number">1</div>
          <!-- 用于美化的间距 -->
          <div class="line-blank"></div>
          <!-- 行号 -->
          <div class="line-compare-number"></div>
          <!-- 用于美化的间距 -->
          <div class="line-blank"></div>
          <!-- 此行的状态 -->
          <div class="line-status"></div>
          <!-- 用于美化的间距 -->
          <div class="line-blank"></div>
        </div>
        <div class="code-area">
          <span>
            <span>&lt;</span>
            <span>L</span>
            <span>&nbsp;</span>
            <span>2</span>
          </span>
        </div>
      </div>
      <div class="line-viewer line-viewer--remove">
        <div class="guide-area">
          <!-- 行号 -->
          <div class="line-number">2</div>
          <!-- 用于美化的间距 -->
          <div class="line-blank"></div>
          <!-- 行号 -->
          <div class="line-compare-number"></div>
          <!-- 用于美化的间距 -->
          <div class="line-blank"></div>
          <!-- 此行的状态 -->
          <div class="line-status line-status--remove">-</div>
          <!-- 用于美化的间距 -->
          <div class="line-blank"></div>
        </div>
        <div class="code-area">
          <span>
            <span>&nbsp;</span>
            <span>&nbsp;</span>
            <span>&lt;</span>
            <span>A</span>
            <span>&nbsp;</span>
            <span>[4]</span>
            <span>&nbsp;</span>
            <span>MDLN</span>
            <span>&nbsp;</span>
            <span class="remove">'WXXX'</span>
            <span>&gt;</span>
          </span>
        </div>
      </div>
      <div class="line-viewer line-viewer--add">
        <div class="guide-area">
          <!-- 行号 -->
          <div class="line-number"></div>
          <!-- 用于美化的间距 -->
          <div class="line-blank"></div>
          <!-- 行号 -->
          <div class="line-compare-number">2</div>
          <!-- 用于美化的间距 -->
          <div class="line-blank"></div>
          <!-- 此行的状态 -->
          <div class="line-status line-status--add">+</div>
          <!-- 用于美化的间距 -->
          <div class="line-blank"></div>
        </div>
        <div class="code-area">
          <span>
            <span>&nbsp;</span>
            <span>&nbsp;</span>
            <span>&lt;</span>
            <span>A</span>
            <span>&nbsp;</span>
            <span>[4]</span>
            <span>&nbsp;</span>
            <span>MDLN</span>
            <span>&nbsp;</span>
            <span class="add">'1234'</span>
            <span>&gt;</span>
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
    width: 10px;
    height: 19px;
    color: #237893;
  }

  // 此行代码的状态
  .line-status {
    width: 10px;
    height: 19px;

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
    .remove {
      background: #fb8787;
    }

    .add {
      background: #0eff52;
    }
  }
}
</style>
