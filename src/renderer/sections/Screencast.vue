<template>
  <div id="screencast" class="section">
    <h2>screencast:</h2>
    <p>alas, here you can not expand this video in full-screen mode, open it at youtube:</p>
    <p class="external">https://www.youtube.com/watch?v=JkLvujnKg_g</p>
    <p>&nbsp;</p>
    <webview src="http://www.youtube.com/embed/JkLvujnKg_g" class="webview"></webview>
    <p>&nbsp;</p>
    <p>&nbsp;</p>
    <p>&nbsp;</p>
  </div>
</template>

<script>
export default {
  name: 'screencast'
}
</script>

<style>
.webview {
    width: 640px;
    height: 390px;
    margin:0px auto;
    /* padding:15px; */
}
</style>
