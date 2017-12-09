<template>
  <div id="app">
    <div id="arrows"><img :src="lpng" class="arrow" @click="goBack"> <img :src="rpng" class="arrow" @click="goForward"></div>
    <router-view></router-view>
  </div>
</template>

<script src="./app-vue">
</script>

<style src='./app-vue.css'>
</style>
