//

import {log} from '../utils'
import _ from 'lodash'
import {q, placePopup} from '../utils'
import { EventBus } from '../bus'
import {ipcRenderer} from 'electron'

// let segmenter = require('../../../../segmenter')
let segmenter = require('recursive-segmenter')

export default {
  name: 'recursive-popup',
  created () {
    EventBus.$on('show-recursive', data => {
      this.showPopup(data)
    })
    EventBus.$on('clean', data => {
      this.segs = null
    })
  },
  data: function () {
    return {
      segs: null
    }
  },
  // props: ['clean'],
  // watch: {
  //   'clean' () {
  //     // this.segs = null
  //   }
  // },

  methods: {
    showPopup: function (data) {
      // log('-->', data)
      if (!EventBus.res[data.cl]) return
      let dicts = _.uniq(EventBus.res[data.cl].docs.map(doc => { return doc.dict }))
      this.dicts = dicts
      this.cl = data.cl

      Promise.resolve(segmenter(data.seg, dicts, true)).then(segs => {
        let strsegs = segs.map(s => { return s.seg })
        this.segs = [strsegs]
      })

      this.$nextTick(function () {
        let osegs = q('.segs')
        // log('L', osegs)
        placePopup(data.coords, osegs)
      })
    },

    queryHanzi: function (ev) {
      if (ev.shiftKey) return
      let seg = ev.target.textContent
      if (seg.length === 1) {
        ipcRenderer.send('hanzi', seg)
      }
      if (seg.length < 2) return
      // если есть seg - получить level - row-id
      // и добавить row, или заменить row
      let level = 0
      this.segs.forEach((row, idx) => {
        if (row.includes(seg)) level = idx
      })
      Promise.resolve(segmenter(seg, this.dicts, true)).then(segs => {
        let strsegs = segs.map(s => { return s.seg })
        if (this.segs[level+1]) this.segs.pop()
        this.segs.push(strsegs)
      })
    },

    showDict: function (ev) {
      // TODO: а если длина больше 1, и м.б. и rec, и ambis?
      if (ev.shiftKey) return
      let seg = ev.target.textContent
      let data = {seg: seg, cl: this.cl}
      EventBus.$emit('show-dict', data)
    }
  }
}

// function findAncestor (el, cls) {
//   while ((el = el.parentElement) && !el.classList.contains(cls));
//   return el
// }

function getCoords (el) {
  let rect = el.getBoundingClientRect()
  return {top: rect.top + 28, left: rect.left}
}
