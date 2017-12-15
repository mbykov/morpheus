//
import {log} from '../utils'
import {ipcRenderer} from 'electron'

export default {
  name: 'cleanup',
  created () {
    log('CLEANUP')
  },
  methods: {
    go: function () {
      log('cl-go!')
      ipcRenderer.send('cleanup')
    }
  }
}
