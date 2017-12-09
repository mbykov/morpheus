<template>
  <div id="active" class="section">
        <h2>Dictionaries: {{test}}</h2>
      <table width="75%">
        <tr class="bold">
          <!-- <td></td><td>name</td><td>lang</td><td>remove</td><td>active</td> -->
          <td></td><td>name</td><td>lang</td><td>active</td>
        </tr>
        <tr v-for="info in cfg" @click="toggleDict" v-show="info.name != 'Hanzi'">
          <td><img :src="chcksrc" class="check" v-show="info.active"></td><td>{{info.name}}</td><td>{{info.lang}}</td><td><input type="checkbox" :name="info.path" :checked="info.active" class="radio-dict"></td>
        </tr>
      </table>
        <div id="order">click to move first:
        </div>
          <template v-for="info in cfg">
            <b-button size="sm" variant="success" @click="first" class="order" v-show="info.name != 'Hanzi'">
              {{info.name}}
            </b-button>
          </template>
  </div>
</template>

<script src="./active-vue.js">
</script>

<style>
.bold {
    font-weight: bold;
}
.check {
    width: 25px;
}

#order {
    margin-top: 50px;
    /* margin-left: 50px; */
}

.order {
    /* padding: 10px; */
    cursor: pointer;
}

.btn-success {
    margin-left: 5px;
}

</style>
