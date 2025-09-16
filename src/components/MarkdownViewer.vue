<template>
  <div class="markdown-viewer">
    <!-- 顶部导航 -->
    <header class="navbar">
      <div class="logo">Markdown 文档查看器</div>
      <button @click="loadDoc" :disabled="isLoading">重新加载</button>
    </header>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="loading">加载中...</div>

    <!-- 错误提示 -->
    <div v-if="error" class="error">❌ {{ error }}</div>

    <!-- Markdown 渲染组件（核心） -->
    <main v-else class="markdown-container github-markdown">
      <!-- 使用 vue3-markdown-it 组件，直接传入 markdown 文本 -->
      <MarkdownIt :source="markdownText" :options="mdOptions" />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
// 1. 导入核心组件和工具
import MarkdownIt from 'vue3-markdown-it'; // 组件形式导入
import hljs from 'highlight.js'; // 代码高亮

import 'highlight.js/styles/github-dark-dimmed.css'; // 代码高亮主题（可更换）
import 'github-markdown-css/github-markdown.css'; // GitHub 风格的 Markdown 样式


// 2. 状态管理
const isLoading = ref(true);
const error = ref('');
const markdownText = ref(''); // 存储原始 Markdown 文本
const markdownUrl = ref('http://xiaochuqing.com/static/docs/CheckboxManager.md'); // 目标文档地址

// 3. Markdown 解析配置（关键：配置代码高亮）
const mdOptions = ref({
  html: true, // 允许解析 HTML 标签
  linkify: true, // 自动识别链接（如 http://xxx 转为 <a>）
  typographer: true, // 优化排版（如 -- 转为 —）
  // 代码高亮配置（核心，解决代码无样式问题）
  highlight: (str, lang) => {
    // 如果指定了语言且 highlight.js 支持，直接高亮
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (e) {
        console.warn(`高亮 ${lang} 代码失败:`, e);
      }
    }
    // 未指定语言时，自动检测高亮
    return hljs.highlightAuto(str).value;
  }
});

// 4. 加载 Markdown 文档（处理跨域注意事项见下文）
const loadDoc = async () => {
  isLoading.value = true;
  error.value = '';
  try {
    // 注意：浏览器跨域限制，直接请求外部域名可能失败（解决方案见下文）
    const res = await fetch(markdownUrl.value);
    if (!res.ok) throw new Error(`请求失败: ${res.status}`);
    markdownText.value = await res.text(); // 读取 Markdown 原始文本
  } catch (err) {
    error.value = err.message || '加载文档失败，请检查网络或地址';
    console.error('加载错误:', err);
  } finally {
    isLoading.value = false;
  }
};

// 5. 组件挂载时加载文档
onMounted(() => {
  loadDoc();
});
</script>

<style scoped>
.markdown-viewer {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f5f5f5;
}
.navbar {
  display: flex;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: #24292e;
  color: #fff;
}
.navbar button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #4CAF50;
  color: #fff;
  cursor: pointer;
}
.navbar button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
.loading, .error {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2rem;
}
.error {
  color: #dc3545;
}
/* 让 Markdown 内容适配屏幕，和 GitHub 样式对齐 */
.markdown-container {
  flex: 1;
  padding: 2rem;
  max-width: 980px;
  margin: 0 auto;
  width: 100%;
}
/* 修复代码块溢出问题 */
.markdown-container pre {
  overflow-x: auto;
}
/* 表格样式穿透 markdown表格样式 */


/* 其他原有样式（导航、加载态、代码块等）保持不变 */

/* 1. 表格外层容器：实现横向滑动（核心） */
.markdown-container :deep(.table-container)  {
  width: 100%;
  overflow-x: auto; /* 长表格横向滚动 */
  margin: 1.5rem 0; /* 与上下内容间距 */
  border-radius: 8px; /* 容器圆角 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3); /* 阴影增强层次 */
}

/* 2. 表格主体：深色背景+圆角 */
.markdown-container :deep(table) {
  width: 100%;
  min-width: 600px; /* 防止短表格过窄 */
  border-collapse: separate; /* 取消边框合并（实现圆角必需） */
  border-spacing: 0; /* 清除单元格间距 */
  background-color: #000; /* 你的深色背景 */
  border-radius: 8px; /* 表格整体圆角 */
  overflow: hidden; /* 裁剪超出部分，确保圆角生效 */
}

/* 3. 表头样式：突出区分 */
.markdown-container :deep(th) {
  background-color: #1a1a1a; /* 表头深色背景（比表格深，显层级） */
  color: #ffffff; /* 表头文字白色 */
  font-weight: 600;
  padding: 12px 16px; /* 内边距（避免拥挤） */
  text-align: left;
  border-bottom: 1px solid #333; /* 表头下分隔线 */
  font-size: 14px;
  white-space: nowrap; /* 表头文字不换行（防止挤压） */
}

/* 4. 单元格样式：文字优化+hover 过渡 */
.markdown-container :deep(td) {
  color: #e0e0e0; /* 内容文字浅灰（深色背景易读） */
  padding: 12px 16px; /* 与表头内边距一致 */
  border-bottom: 1px solid #222; /* 行分隔线（浅色不刺眼） */
  font-size: 13px;
  transition: background-color 0.2s ease; /* hover 流畅过渡 */
}

/* 5. 行 hover 效果：增强交互 */
.markdown-container :deep(tbody tr:hover td) {
  background-color: #111; /* hover 时行背景加深，定位当前行 */
}

/* 6. 最后一行取消下边框：避免底部多余线条 */
.markdown-container :deep(tbody tr:last-child td) {
  border-bottom: none;
}

/* 7. 表头圆角：细节优化（配合表格整体圆角） */
.markdown-container :deep(th:first-child) {
  border-top-left-radius: 8px;
}
.markdown-container :deep(th:last-child) {
  border-top-right-radius: 8px;
}

/* 8. 表格底部圆角（无滚动时生效） */
.markdown-container :deep(tbody tr:last-child td:first-child) {
  border-bottom-left-radius: 8px;
}
.markdown-container :deep(tbody tr:last-child td:last-child) {
  border-bottom-right-radius: 8px;
}

/* 9. 滚动条美化（适配深色模式） */
.markdown-container :deep(.table-container::-webkit-scrollbar) {
  height: 8px; /* 横向滚动条高度 */
}
.markdown-container :deep(.table-container::-webkit-scrollbar-track) {
  background: #111; /* 滚动条轨道背景 */
  border-radius: 4px;
}
.markdown-container :deep(.table-container::-webkit-scrollbar-thumb) {
  background: #333; /* 滚动条滑块背景 */
  border-radius: 4px;
}
.markdown-container :deep(.table-container::-webkit-scrollbar-thumb:hover) {
  background: #444; /* 滑块 hover 加深 */
}

</style>