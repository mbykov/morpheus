//

// import {log} from '../utils'
import { EventBus } from '../bus.js'
import { unihan } from './unihan.js'

export default {
  name: 'hanzi',
  created () {
    // let that = this
    EventBus.$on('show-dict', data => { this.hanzi = false })
    EventBus.$on('show-hanzi', doc => {
      this.hanzi = doc
    })
    EventBus.$on('showUnihan', (sym) => {
      let doc = this.hanzi
      if (!doc) return
      let seg = doc._id
      if (!seg) return
      unihan(sym, seg)
    })
  },

  data: function () {
    return {
      hanzi: false
    }
  }
}
