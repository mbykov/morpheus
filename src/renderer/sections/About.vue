<template>
  <div id="about" class="section">
    <h2>Morpheus for Eastern Languages:</h2>
    <ul class="list">
      <li>- reading Chinese (including Classical Chinese) made easy</li>
      <li>- offline web application. Works offline, but synchronizes when online</li>
      <li>- works everywhere on desktop</li>
      <li>- based on CouchDB + Electron.js, so distributed, multiuser, open-source, cross-platform and scalable</li>
      <li>- instantly displays any amount of text</li>
      <li>- has recursive segmentation of a long word (segmenting of segments), so allows in-depth analysis</li>
      <li>- user can install / connect / remove dictionaries on the fly, English, German, Russian, etc reliable open-source dicts</li>
      <li>by default only NTI-Reader and Make-me-a-Hanzi dictinaries are installed</li>
      <li>- (in next version) user can add / edit dictionary's articles (login required)</li>
      <li>- specialized dictionaries for expert users, e.g. supporting "Early Chinese Buddhist translations" (see "Dharma-Reader project")</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'about'
}
</script>

<style>
  .list {
    list-style: none;
  }
</style>
