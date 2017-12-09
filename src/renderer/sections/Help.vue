<template>
  <div id="help" class="section">
    <h2>help:</h2>
    <p>just copy Crtl+C Chinese text everywhere on a desktop</p>
    <p><b>Shift</b> disables showing dictionaries (to move mouse freely)</p>
    <p><b>ESC</b> close all popups
    <p><b>shift + mouse-wheel</b> scrolls other pane (to scroll dicts pane without moving mouse to it)</p>
    <p><b>click on a single symbol</b> shows dictionary and graphical data (thanks to MakeMeAHanzi project)
    <p><img id="mmhpng" :src="mmh"></p>
    <p><b>recursive segmentation</b>: long (more then one symbol) segment can be segmented further with mouse-click</p>
    <p><img id="recpic" :src="recpng" ></p>
    <p>&nbsp</p>
    <p>&nbsp</p>
    <p>&nbsp;</p>
    <p>&nbsp;</p>
    <p></p>
    <p></p>
  </div>
</template>

<script>
const recpng = 'static/recur.png'
const mmhpng = 'static/makemeahanzi.png'
export default {
  name: 'help',
  data: function () {
    return {
      mmh: mmhpng,
      recpng: recpng
    }
  }
}
</script>

<style>
</style>
