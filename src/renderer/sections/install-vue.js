//

// import { EventBus } from '../bus.js'
import {ipcRenderer} from 'electron'
// import {log} from '../utils'
// import router from '../router'
// import _ from 'lodash'

export default {
  name: 'install',
  data: function () {
    return {
      file: null
    }
  },
  methods: {
    open (ev) {
      // let file = ev.target.files[0]
      // log('OPEN', ev.target.files)
    },
    go (ev) {
      let ipath = this.file.path
      if (!ipath) return
      ipcRenderer.send('ipath', ipath)
    }
  }
}
