<template>
  <div id="dicts" v-show="dict">
    <!-- v-show="dict" -->
    <div id="dict-glyph" @click="showHanzi"><span class="dict-glyph">{{dict.seg}}</span> <span class="dict-other-type">{{dict.otype}}</span> <span class="dict-other">{{dict.other}}</span></div>
    <div v-for="(docs, dn) in dict.dbns">
      <br>
      <span class="dname">{{dn}}</span>
      <div v-for="(doc, idx) in docs">
        <span class="pinyin">{{idx + 1}}. {{doc.pinyin}}</span>
        <span class="pos">{{doc.pos}}</span>
        <div class="trns" v-for="(trn, idy) in doc.trns">
            {{trn}}
        </div>
        <div class="note" v-if="doc.cf">note: {{doc.cf}}</div>
      </div>
    </div>
  </div>
</template>

<script src="./dicts-vue"></script>

<style src="./dicts.css">
</style>
