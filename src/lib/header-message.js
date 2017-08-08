const path = require('path')
import _ from 'lodash'
import {q, qs, create, span, div, p, empty, remove, recreate, recreateDiv, log} from './utils.js'
var delegate = require('delegate');
import {phonetic} from './phonetic'
const {ipcRenderer} = require('electron')
const jetpack = require("fs-jetpack")
const http = require('http')
const tar = require('tar-fs')
const gunzip = require('gunzip-maybe')
const  Progress = require('progress-component');

export function headerMessage(mess) {
    let oText = create('div')
    mess.forEach(cl => {
        if (cl.segs) {
            let oClause = parseClause(cl)
            oText.appendChild(oClause)
        } else {
            let oSpace = span(cl.sp)
            oText.appendChild(oSpace)
        }
    })
    return oText
}

function parseClause(cl) {
    let oClause = create('span')
    oClause.classList.add('clause')
    cl.segs.forEach((seg, idx) => {
        let oSeg = span(seg.dict)
        oSeg.setAttribute('idx', idx)
        let klass = (seg.docs) ? 'seg' : 'ambi'
        oSeg.classList.add(klass)
        oSeg.classList.remove('current')
        oClause.appendChild(oSeg)
        let singles = []
        seg.dict.split('').forEach(sym => {
            let symseg = _.find(cl.singles, single => single.dict == sym)
            singles.push(symseg)
        })
        oSeg.singles = _.compact(singles)
    })
    bindMouseEvents(oClause, cl)
    return oClause
}

// document.addEventListener("keydown", keyDown, false)

// 第三十各地区要切 en arche en ho logos
// 爾時世尊重說偈言
function bindMouseEvents(el, cl) {
    delegate(el, '.seg', 'mouseover', function(e) {
        setCurrent(e)
        let oAmbis = q('.ambis')
        if (oAmbis) remove(oAmbis)
        let oSingles = q('.singles')
        if (oSingles) remove(oSingles)
        if (e.ctrlKey) return
        let idx = e.target.getAttribute('idx')
        let seg = cl.segs[idx]
        createDict(seg)
    }, false);

    delegate(el, '.seg', 'click', function(e) {
        setCurrent(e)
        let cur = e.target
        if (!cur || cur.textContent.length < 2) return
        if (cur.classList.contains('ambis')) return
        let oResults = q('#laoshi-results')
        let oSingles = recreateDiv('singles')
        cur.textContent.split('').forEach(sym => {
            let symseg = _.find(cur.singles, single => single.dict == sym)
            if (!symseg) return
            let oSym = span(symseg.dict)
            oSym.classList.add('seg')
            oSingles.appendChild(oSym)
        })
        if (oSingles.childNodes.length) oResults.appendChild(oSingles)
        var coords = getCoords(cur);
        placePopup(coords, oSingles);
        delegate(oSingles, '.seg', 'mouseover', function(e) {
            let single = _.find(cur.singles, single => single.dict == e.target.textContent)
            createDict(single)
        }, false);
    }, false)

    // AMBIES
    delegate(el, '.ambi', 'mouseover', function(e) {
        setCurrent(e)
        let oSingles = q('.singles')
        if (oSingles) remove(oSingles)
        let oResults = q('#laoshi-results')
        let oDicts = q('#laoshi-dicts')
        empty(oDicts)
        let test = q('.ambis')
        if (test) return

        let idx = e.target.getAttribute('idx')
        let seg = cl.segs[idx]
        let oAmbis  = createAmbi(e, seg)
        oResults.appendChild(oAmbis)
        var coords = getCoords(e.target);
        placePopup(coords, oAmbis);

        delegate(oAmbis, '.seg', 'mouseover', function(e) {
            let aseg = e.target
            let idx = e.target.getAttribute('idx')
            let idy = e.target.getAttribute('idy')
            let cur = seg.ambis[idx][idy]
            createDict(cur)
        }, false);
    }, false);
}

function setCurrent(e) {
    let curs = qs('.current')
    curs.forEach(cur => {cur.classList.remove('current')})
    e.target.classList.add('current')
}

// 第三十各地区要切 实把
function createAmbi(e, seg) {
    let oAmbis = recreateDiv('ambis')
    seg.ambis.forEach((asegs, idy) => {
        let oAmbi = create('div')
        asegs.forEach((aseg, idx) => {
            let oAseg = span(aseg.dict)
            oAseg.classList.add('seg')
            oAseg.setAttribute('idx', idx)
            oAseg.setAttribute('idy', idy)
            oAmbi.appendChild(oAseg)
            let oSpace = span(' ')
            oAmbi.appendChild(oSpace)
        })
        oAmbis.appendChild(oAmbi)
    })
    return oAmbis
}

function placePopup(coords, el) {
    var top = [coords.top, 'px'].join('');
    var left = [coords.left, 'px'].join('');
    el.style.top = top;
    el.style.left = left;
}

function getCoords(el) {
    let rect = el.getBoundingClientRect();
    return {top: rect.top+28, left: rect.left};
}

function createDict(seg) {
    let oDicts = q('#laoshi-dicts')
    empty(oDicts)
    seg.docs.forEach(doc => {
        let oDocs = create('div')
        let oDict = span(doc.dict)
        oDict.classList.add('dict')
        oDocs.appendChild(oDict)
        let odef = span(' - ')
        oDocs.appendChild(odef)
        doc.docs.forEach(doc => {
            let oDoc = create('div')
            let phone = phonetic(doc.pinyin)
            let oPinyin = span(phone)
            oDoc.appendChild(oPinyin)
            let oTrns = create('div')
            oTrns.classList.add('trns')
            doc.trns.forEach(trn => {
                let html = cleanTrn(trn)
                oTrns.appendChild(html)
            })
            oDoc.appendChild(oTrns)
            oDocs.appendChild(oDoc)
        })
        oDicts.appendChild(oDocs)
    })
}

// 是
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

function showMessage(str) {
    let parent = q('#antrax-dicts')
    parent.textContent = str
}

ipcRenderer.on('section', function(event, text) {
    showSection(text)
    // if (text == 'Update available, downloading') {
    //     let opro = q('#progress')
    //     opro.classList.remove('hidden')
    // }
})

function showSection(name) {
    let oHeader = q('#laoshi-header')
    empty(oHeader)
    let fpath = path.join('src/lib/sections', [name, 'html'].join('.') )
    let html = jetpack.read(fpath)
    let odicts = q('#laoshi-dicts')
    empty(odicts)
    odicts.innerHTML = html
    let ores = q('#laoshi-results')
    ores.appendChild(odicts)
    let cedict = q('#cedict')
    let bkrs = q('#bkrs')
    // let allangs
    delegate(odicts, '.load-dict', 'click', function(e) {
        let chcks = qs('.load-dict')
        let size = 0
        let langs = []
        chcks.forEach(chck => {
            if (!chck.checked) return
            size += chck.getAttribute('size')*1.0
            langs.push(chck.getAttribute('id'))
        })
        let osize = q('#approx-size')
        osize.textContent = size
        let oname = q('#dict-name')
        oname.textContent = ''
        if (!langs.length) return ores.langs = null
        let dname = ['chinese', langs.join('_')].join('_')
        dname = [dname, 'dict'].join('.')
        oname.textContent = dname
        ores.langs = langs
        log('LL', ores.langs)
    })
    let submit = q('#install-dict')
    submit.addEventListener('click', loadDict, false)
}


function loadDict() {
    let ores = q('#laoshi-results')
    if (!ores.langs || !ores.langs.length) return
    ipcRenderer.send('download', ores.langs)
}

let bar, len, part = 0

ipcRenderer.on('barstart', function(event, text) {
    len = text*1.0
    bar = new Progress;
    let odicts = q('#laoshi-dicts')
    // recreate(odicts)
    odicts.appendChild(bar.el);
})

ipcRenderer.on('bar', function(event, text) {
    part += text*1.0
    let n = part*100/len
    bar.update(n);
})

ipcRenderer.on('barerr', function(event, text) {
    let ores = q('#laoshi-results')
    let str = 'server connection error: '+ text
    let oerr = div(str)
    ores.appendChild(oerr);
})

// ipcRenderer.on('barend', function(event, text) {
//     console.log('\n')
// })

// 新华社北京
