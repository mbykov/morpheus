<template>
  <div id="title" class="section">
    <p id="version" v-show="version" @click="openver">new version available: {{version}}</p>
    <div id="img">
      <img :src="msrc">
    </div>
    <div id="text">
      <p>
        Copy some Chinese text from anywhere on your desktop (Ctrl-C); then move the mouse over text to see the readings of Chinese characters and obtain further information from various dictionaries.  </p>
      <p>Try, for example, this phrase: 欢迎大家使用这个创新的软件，以便在瞬间学习新的汉字，并显着加快您的中文阅读速度！</p>
      <p>Or the same in traditional characters: 歡迎大家使用這個創新的軟件，以便在瞬間學習新的漢字，並顯著加快您的中文閱讀速度！</p>
      <!-- <p>&nbsp;</p> -->
      <!-- <p>MESS: {{mess}}</p> -->
    </div>
  </div>
</template>

<script src="./title-vue.js"></script>

<style>
.link {
    cursor: pointer;
}

span:hover,
span.router-link-active,
span.router-link-exact-active {
   /* background-color: indianred; */
   cursor: pointer;
}

#title {
    margin: auto;
    padding: 10px;
}

#img {
    float: left;
    padding: 25px;
}
#text {
    margin-top: 50px;
    margins: 25px;
}

#version {
    cursor: pointer;
    color: green;
    padding: 25px;
}
</style>
