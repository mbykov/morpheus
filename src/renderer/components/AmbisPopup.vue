<template>
  <div id="ambis" v-show="ambis">
    <span class="ambis" @mouseover="showDict" @click="showRec">
      <div v-for="row in ambis" class="amrow">
        <span v-for="col in row" class="seg">{{col.seg}}</span>
      </div>
      <!-- <span class=""> AMB: {{ambis}}</span> -->
    </span>
  </div>
</template>

<script src="./ambis-popup">
</script>

<style>
.ambis {
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
