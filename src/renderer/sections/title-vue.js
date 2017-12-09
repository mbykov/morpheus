//

// import {log} from '../utils'
import axios from 'axios'
import {ipcRenderer, shell} from 'electron'
const morpheuspng = 'static/256x256.png'

export default {
  name: 'title',
  data: function () {
    return {
      version: null,
      msrc: morpheuspng
    }
  },
  created () {
    let that = this
    let over
    ipcRenderer.on('version', (event, ver) => {
      over = ver
    })
    axios.get('https://api.github.com/repos/mbykov/morpheus/releases/latest')
      .then(function (response) {
        if (!response || !response.data) return
        if (!over) return
        let nver = response.data.name
        if (over && nver && nver > over) {
          that.version = nver
        }
      })
      .catch(function (error) {
        console.log('API ERR', error)
      })
  },
  methods: {
    openver: function () {
      let href = 'https://github.com/mbykov/morpheus/releases/latest'
      shell.openExternal(href)
    }
  }
}
