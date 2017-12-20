//
// import {log} from '../utils'
import {ipcRenderer} from 'electron'

export default {
  name: 'cleanup',
  created () {
  },
  methods: {
    go: function () {
      ipcRenderer.send('cleanup')
    }
  }
}
