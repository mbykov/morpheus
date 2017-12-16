<template>
  <div id="ruby-popup" v-show="rubies">
    <span class="rubies">
        <span v-for="(seg, idx) in rubies" class="arow" :idx="idx">
        <span class="ruby">{{calcSeg(seg.pins)}} </span>
        <!-- <span class="ruby">{{seg.pins[Math.floor(0.2)]}} </span> -->
      </span>
    </span>
  </div>
</template>

<script src="./ruby-popup">
</script>

<style>
.rubies {
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
    font-size: 16px;
    padding: 3px;
}
</style>
