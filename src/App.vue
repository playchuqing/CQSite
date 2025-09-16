<template>
  <div id="app">
    <MarkdownViewer />
  </div>
</template>

<script setup>
import MarkdownViewer from '@/components/MarkdownViewer.vue';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faSyncAlt, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// 导入需要的图标
library.add(faSyncAlt, faExclamationCircle);
</script>

<style>
#app {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
  padding: 0;
}
</style>
