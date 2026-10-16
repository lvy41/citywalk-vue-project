<template>
  <!-- 路由出口！所有页面组件在这里渲染 -->
 <router-view></router-view>
</template>

<script setup>
// 不需要写任何业务代码
</script>

<style>
/* 去掉默认边距，移动端全屏 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
