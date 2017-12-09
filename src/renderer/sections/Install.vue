<template>
  <div id="install" class="section">
    <p>Download precompiled dictionaries from XXX, or create your own, then</p>
    <h2>install from file:</h2>
    <p>do not untar / ungzip files!</p>
    <p></p>
    <p><b-form-file id="file_input" v-model="file" @change="open" accept=".tar.gz"></b-form-file></p>

    <p>&nbsp;</p>
    <b-button size="lg" variant="success" @click="go" class="install" v-show="file">Install</b-button>

    <p></p>
    <p></p>
  </div>
</template>

<script src="./install-vue">
</script>

<style>
  #install {
    width: 500px;
  }
</style>
