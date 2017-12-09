//

// import {log} from '../utils'
import _ from 'lodash'
import {q, qs, empty, create, span} from '../utils'
import Split from 'split.js'
import { EventBus } from '../bus'
import {ipcRenderer} from 'electron'

import AmbisPopup from '@/components/AmbisPopup'
import RecursivePopup from '@/components/RecursivePopup'
import Dicts from '@/components/Dicts'
import Hanzi from '@/components/Hanzi'

let zh = require('speckled-band')
// let segmenter = require('../../../../segmenter')
let segmenter = require('recursive-segmenter')

export default {
  name: 'main',
  data: function () {
    return {
      clean: false
    }
  },
  created () {
    EventBus.$emit('clean')
    this.setGrid()
  },
  components: {
    Dicts,
    Hanzi,
    AmbisPopup,
    RecursivePopup
  },

  watch: {
    '$route' (to, from) {
      if (!to.query || !to.query.text) return
      let text = to.query.text
      this.showRoute(text)
      this.clean = true
    }
  },
  methods: {
    setGrid () {
      let that = this
      this.$nextTick(function () {
        Split(['#text', '#results'], {
          sizes: [60, 40],
          cursor: 'col-resize',
          minSize: [0, 0]
        })
        let text = that.$route.query.text
        that.showRoute(text)
      })
    },
    showRoute (text) {
      let pars = zh(text)
      this.setClauses(pars)
    },
    setClauses (pars) {
      let text = q('#text')
      empty(text)
      if (!pars) return
      pars.forEach((cls) => {
        let par = create('p')
        cls.forEach((cl) => {
          let spn = span(cl.text)
          spn.classList = (cl.type === 'cl') ? 'cl' : 'sp'
          par.appendChild(spn)
        })
        text.appendChild(par)
      })
    },

    mainProc (ev) {
      if (ev.target.nodeName !== 'SPAN') return
      if (ev.shiftKey) return
      this.clean = true
      EventBus.$emit('close-popups')
      if (ev.target.classList.contains('cl')) {
        let cls = qs('.clause')
        cls.forEach(cl => { cl.classList.remove('clause') })
        ev.target.classList.add('clause')
        let data = ev.target.textContent
        ipcRenderer.send('data', data)
      } else if (ev.target.classList.contains('ambi')) {
        let cl = findAncestor(ev.target, 'cl')
        let clkey = cl.textContent
        let seg = ev.target.textContent
        let coords = getCoords(ev.target)
        let data = {seg: seg, coords: coords, ambis: ev.target.ambis, cl: clkey}
        EventBus.$emit('clean')
        EventBus.$emit('show-ambis', data)
      } else if (ev.target.classList.contains('hole')) {
        let seg = ev.target.textContent
        let data = {seg: seg, cl: 'no-result', hole: true}
        EventBus.$emit('clean')
        EventBus.$emit('show-dict', data)
      } else if (ev.target.classList.contains('seg')) {
        let cl = findAncestor(ev.target, 'cl')
        let clkey = cl.textContent
        let seg = ev.target.textContent
        let data = {seg: seg, cl: clkey}
        EventBus.$emit('clean')
        this.clean = true
        EventBus.$emit('show-dict', data)
      }
    },

    showRec (ev) {
      if (ev.shiftKey) return
      if (ev.target.nodeName !== 'SPAN') return
      if (!ev.target.classList.contains('seg')) return
      let seg = ev.target.textContent
      if (seg.length === 1) {
        ipcRenderer.send('hanzi', seg)
      }
      if (seg.length < 2) return
      // TODO: next level
      let cl = findAncestor(ev.target, 'cl')
      let clkey = cl.textContent
      let coords = getCoords(ev.target)
      let data = {seg: seg, coords: coords, cl: clkey}
      EventBus.$emit('show-recursive', data)
    }
  }
}

// string of the segments - spans
ipcRenderer.on('data', function (event, data) {
  let clause = q('.clause')
  if (!clause) return
  let docs = _.flatten(data.res.map(d => { return d.docs }))
  let dicts = _.uniq(_.flatten(data.res.map(d => { return d._id })))
  Promise.resolve(segmenter(data.str, dicts)).then(segs => {
    let key = clause.textContent
    if (!EventBus.res) EventBus.res = {}
    EventBus.res[key] = {docs: docs, segs: segs}
    clause.classList.remove('clause')
    setSegs(clause, segs)
  })
})

function setSegs (clause, segs) {
  empty(clause)
  segs.forEach(s => {
    let spn = span(s.seg)
    if (s.ambis) {
      spn.classList.add('ambi')
      spn.ambis = s.ambis
    } else if (s.hole) {
      spn.classList.add('hole')
    } else {
      spn.classList.add('seg')
    }
    clause.appendChild(spn)
  })
}

// utils:
function findAncestor (el, cls) {
  while ((el = el.parentElement) && !el.classList.contains(cls));
  return el
}

function getCoords (el) {
  let rect = el.getBoundingClientRect()
  return {top: rect.top + 28, left: rect.left}
}
