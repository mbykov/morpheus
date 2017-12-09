<template>
  <div id="recursive-popup" v-show="segs">
    <span class="segs">
      <span v-for="(row, idx) in segs" class="arow" :idx="idx">
        <span v-for="dict in row" class="seg" @mouseover="showDict" @click="queryHanzi">{{dict}}</span><br>
      </span>
    </span>
  </div>
</template>

<script src='./recursive-popup'>
</script>

<style>
  .segs {
    border: 1px solid rgba(0, 0, 0, 0.2);
    /* background-color: #8aba87; */
    /* color: white; */
    /* line-height: 24px; */
    background-color: white;
    color: black;
    display: 'block';
    padding: 3px;
    position: absolute;
    z-index: 1000;
    box-shadow: 0.15em 0.15em 1em rgba(0, 0, 0, 0.75);
    /* box-shadow: 0 0 10px 1px rgba(0,0,0,.3); */
    height: auto;
    top: 250px;
    left: 300px;
    /* font-family: 'DejaVu Sans'; */
    font-size: 26px;
    padding: 3px;
}
</style>
