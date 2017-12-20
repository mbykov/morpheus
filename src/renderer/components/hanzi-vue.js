//

// import {log} from '../utils'
import { EventBus } from '../bus.js'

export default {
  name: 'hanzi',
  created () {
    EventBus.$on('show-dict', data => { this.hanzi = false })
    EventBus.$on('show-hanzi', doc => {
      this.hanzi = doc
    })
  },

  data: function () {
    return {
      hanzi: false
    }
  }
}
