//

// import {log} from '../utils'
// import _ from 'lodash'
import {q, placePopup} from '../utils'
import { EventBus } from '../bus'
// import {ipcRenderer} from 'electron'

export default {
  name: 'ruby-popup',
  created () {
    EventBus.$on('show-ruby', data => {
      this.showPopup(data)
    })
    EventBus.$on('clean', data => {
      this.rubies = null
      clearInterval(this.timerId)
      this.timerId = null
    })
  },
  data: function () {
    return {
      rubies: null,
      timerId: null,
      random: 0
    }
  },

  methods: {
    calcSeg: function (segs) {
      let idx = Math.floor(this.random * segs.length)
      return segs[idx]
    },
    showPopup: function (data) {
      EventBus.$emit('clean')
      this.rubies = data.rubies
      let that = this
      if (!this.timerId) {
        this.timerId = setInterval(function() {
          // that.random = Math.floor(Math.random() * 10) + 1
          that.random = Math.random()
        }, 2000)
      }
      let popup = q('.rubies')
      let coords = data.coords
      // coords.top = coords.top - 62
      let ncoords = {top: data.coords.top - 65, left: data.left}
      placePopup(ncoords, popup)
    }
  }
}
