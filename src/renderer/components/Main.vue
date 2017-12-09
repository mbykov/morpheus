<template>
  <div id="main">
    <div id="text"  class="split split-horizontal text" @mouseover="mainProc"  @click="showRec" >
       <!-- @mouseleave="cleanUp" -->
    </div>

    <div id="results" class="split split-horizontal">
      <ambis-popup :clean="clean"></ambis-popup>
      <recursive-popup :clean="clean"></recursive-popup>
      <dicts></dicts>
      <hanzi></hanzi>
    </div>

  </div>
</template>

<script src='./main-vue'></script>

<style src="./main-vue.css"></style>
