//

import {log} from '../utils'
import {ipcRenderer} from 'electron'
import { EventBus } from '../bus.js'
import { unihan } from './unihan.js'
import _ from 'lodash'

export default {
  name: 'dicts',
  data: function () {
    return {
      dict: false
    }
  },
  props: ['clean'],
  watch: {
    'clean' () {
      this.dict = null
    }
  },
  created () {
    EventBus.$on('show-hanzi', data => { this.dict = false })
    EventBus.$on('show-dict', data => {
      if (data.hole) {
        this.dict = {seg: data.seg, dbns: {'no result': []}}
        return
      }
      // if (!EventBus.res[data.cl]) log('E', EventBus.res)
      if (!EventBus.res[data.cl]) return
      let docs = _.filter(EventBus.res[data.cl].docs, doc => { return doc.dict === data.seg })
      let simps = _.compact(_.uniq(docs.map(doc => { return doc.simp })))
      let trads = _.compact(_.uniq(docs.map(doc => { return doc.trad })))
      let other, otype
      if (trads.length && simps.length && simps.toString() !== trads.toString()) {
        otype = (simps.includes(data.seg)) ? 'trad:' : 'simp:'
        other = (simps.includes(data.seg)) ? [trads].join(' ') : [simps].join(' ')
      }
      docs.forEach(doc => {
        if (doc.dname !== 'bkrs') return
        let trns = []
        doc.trns.forEach(trn => {
          trn = trn.replace(/\[\/*?i\]/g, '').replace(/\[\/*?p\]/g, '').replace(/\[\/*?c\]/g, '').replace(/\[\/*?b\]/g, '')
          trns.push(trn)
        })
        doc.trns = trns
      })

      let dbns = _.groupBy(docs, 'dname')
      this.dict = {seg: data.seg, otype: otype, other: other, dbns: dbns}
    })
    EventBus.$on('showUnihan', (sym) => {
      let doc = this.dict
      if (!doc) return
      let seg = doc.seg
      if (!seg) return
      unihan(sym, seg)
    })
  },
  methods: {
    showHanzi: function (ev) {
      if (!ev.target.classList.contains('dict-glyph') && !ev.target.classList.contains('dict-other')) return
      let seg = ev.target.textContent
      ipcRenderer.send('hanzi', seg)
    }
  }
}
