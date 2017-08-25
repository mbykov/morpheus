import {q, qs, create, span, div, p, empty, remove, removeAll, recreate, recreateDiv, log} from '../utils.js'
import png from './check.png'
import isec from './install-dict.html'
const delegate = require('delegate');
const {ipcRenderer} = require('electron')
const  Progress = require('progress-component');
import {phonetic} from '../phonetic'


export function showDicts(seg) {
    let oDicts = q('#laoshi-dicts')
    empty(oDicts)
    let oRes = q('#results')
    if (!seg || !seg.docs) return
    // TODO: вынести
    let ordered = []
    oRes.dnames.forEach(dn => {
        let tmps = _.filter(seg.docs, (doc) => { return doc.dname === dn})
        ordered.push(tmps)
    })
    let flats = _.flatten(_.compact(ordered))

    flats.forEach(doc => {
        let oDocs = create('div')
        let oType = span(doc.dname)
        oType.classList.add('type')
        oDocs.appendChild(oType)
        let oDict = span(doc.dict)
        oDict.classList.add('dict')
        oDocs.appendChild(oDict)
        let odef = span(' - ')
        let phone = phonetic(doc.pinyin)
        let oPinyin = span(phone)
        oDocs.appendChild(oPinyin)
        let oTrns = create('div')
        oTrns.classList.add('trns')
        doc.trns.forEach(trn => {
            let html = cleanTrn(trn)
            oTrns.appendChild(html)
        })
        oDocs.appendChild(oTrns)
        oDicts.appendChild(oDocs)
    })
}

function cleanTrn(str) {
    str = str.trim()
    let oTrn = p()
    if (/^\[b\]/.test(str)) {
        oTrn.classList.add('hom')
    } else if (/^\[ex\]/.test(str)) {
        oTrn.classList.add('ex')
    } else {
        oTrn.classList.add('trn')
    }
    str = cleanSpan(str)
    oTrn.innerHTML = str
    return oTrn
}

function cleanSpan(str) {
    str = str.replace(/\[b\]/g, '<b>').replace(/\[\/b\]/g, '</b>')
    str = str.replace(/\[i\]/g, '<i>').replace(/\[\/i\]/g, '</i>')
    str = str.replace(/\[ex\]/g, '').replace(/\[\/ex\]/g, '')
    str = str.replace(/\[p\]/g, '<span class="pos">').replace(/\[\/p\]/g, '</span>')
    return str
}
