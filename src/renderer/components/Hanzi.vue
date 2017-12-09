<template>
  <div id="hanzi" v-show="hanzi">
    <div id="hanzisvg">
      <svg version="1.1" viewBox="0 0 1024 1024"  width="150" height="150" xmlns="http://www.w3.org/2000/svg">
        <g stroke="lightgray" stroke-dasharray="1,1" stroke-width="1" transform="scale(4, 4)">
          <line x1="0" y1="0" x2="256" y2="256"></line>
          <line x1="256" y1="0" x2="0" y2="256"></line>
        <line x1="128" y1="0" x2="128" y2="256"></line>
        <line x1="0" y1="128" x2="256" y2="128"></line>
        </g>
        <g transform="scale(1, -1) translate(0, -900)" v-for="stroke in hanzi.strokes" :key="stroke">
          <path :d="stroke"  fill="black"></path>
        </g>
    </svg>
    </div>
    <div id="hanzidescr">
      <ul>
      <li><b>definition</b>: {{hanzi.definition}}</li>
      <li><b>pinyin</b>: {{hanzi.pinyin}}</li>
      <!-- <li><b>pinyin</b>: {{hanzi.pinyin.join(', ')}}</li> -->
      <li><b>decomposition</b>: {{hanzi.decomposition}}</li>
      <li><b>radical</b>: {{hanzi.radical}}</li>
      <li v-if="hanzi.etymology"><b>etymology</b>:
        <ul>
          <li>type: {{hanzi.etymology.type}}</li>
          <li v-if="hanzi.etymology.phonetic">phonetic: {{hanzi.etymology.phonetic}}</li>
          <li v-if="hanzi.etymology.semantic">semantic: {{hanzi.etymology.semantic}}</li>
          <li>hint: {{hanzi.etymology.hint}}</li>
          <li></li>
        </ul>
      </li>
      <li>&nbsp;</li>
      <li v-if="hanzi.children" v-for="child in hanzi.children"><b><span class="component">{{child.dict}}</span></b> conponent:
        <ul>
          <!-- <li><b>dict</b>: {{child.dict}}</li> -->
          <li><b>def</b>: {{child.definition}}</li>
          <li><b>decomposition</b>: {{child.decomposition}}</li>
          <li><b>pinyin</b>: {{child.pinyin}}</li>
          <!-- <li><b>pinyin</b>: {{child.pinyin.join(', ')}}</li> -->
          <li><b>radical</b>: {{child.radical}}</li>
          <li v-if="child.etymology"><b>etymology</b>:
            <ul>
              <li>type: {{child.etymology.type}}</li>
              <li v-if="child.etymology.phonetic">phonetic: {{child.etymology.phonetic}}</li>
              <li v-if="child.etymology.semantic">semantic: {{child.etymology.semantic}}</li>
              <li>hint: {{child.etymology.hint}}</li>
              <li></li>
            </ul>
          <li>&nbsp;</li>
          <li><b></b></li>
          <!-- <li>child: {{child}}</li> -->
          <li></li>
        </ul>
      </li>
      <li>&nbsp;</li>
       <li></li>
      <li></li>
      <li></li>
      </ul>
    </div>

  </div>
</template>

<script src="./hanzi-vue"></script>

<style src="./hanzi.css">
</style>
