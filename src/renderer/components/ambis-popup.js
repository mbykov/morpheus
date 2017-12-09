//

import { EventBus } from '../bus'
import {q, placePopup} from '../utils'
import {ipcRenderer} from 'electron'

export default {
  name: 'ambis-popup',
  created () {
    EventBus.$on('show-ambis', data => {
      this.showPopup(data)
    })
    EventBus.$on('clean', () => { this.ambis = null })
  },
  data: function () {
    return {
      ambis: null,
      cl: null
    }
  },
  props: ['clean'],
  watch: {
    'clean' () {
      this.ambis = null
    }
  },

  methods: {
    showPopup: function (data) {
      this.cl = data.cl
      this.ambis = data.ambis
      let oambis = q('.ambis')
      placePopup(data.coords, oambis)
    },

    showDict: function (ev) {
      if (ev.shiftKey) return
      if (!ev.target.classList.contains('seg')) return
      let seg = ev.target.textContent
      let data = {seg: seg, cl: this.cl}
      EventBus.$emit('show-dict', data)
    },

    showRec: function (ev) {
      if (ev.shiftKey) return
      let seg = ev.target.textContent
      if (seg.length > 1) {
        let data = {seg: seg, coords: getCoords(ev.target), cl: this.cl}
        EventBus.$emit('show-recursive', data)
      } else {
        ipcRenderer.send('hanzi', seg)
      }
    }
  }
}

function getCoords (el) {
  let rect = el.getBoundingClientRect()
  return {top: rect.top + 28, left: rect.left}
}
