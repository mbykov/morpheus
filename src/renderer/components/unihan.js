import {shell} from 'electron'

export function unihan (sym, seg) {
  if (sym.length !== 1) return
  let codepoint = seg.charCodeAt(0).toString(16)
  if (sym === 'c' || sym === 'n') codepoint = seg
  if (sym === 'm') codepoint = ['*', seg, '*'].join('')
  let urls = {
    u: 'http://www.unicode.org/cgi-bin/GetUnihanData.pl?codepoint=',
    g: 'http://www.unicode.org/cgi-bin/GetUnihanData.pl?codepoint=',
    c: 'http://www.chise.org/est/view/char/',
    s: ' http://www2.dhii.jp:3000/?char=',
    m: 'https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=c%3A',
    n: 'http://ntireader.org/#?text='
  }
  let unihan = urls[sym]
  let href = [unihan, codepoint].join('')
  shell.openExternal(href)
}

// https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=c%3A*%E6%A3%8B*
