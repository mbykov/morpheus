const path = require('path')
import {q, qs, create, span, div, p, empty, remove, removeAll, recreate, recreateDiv, log} from './lib/utils.js'
import _ from 'lodash'
import './style.css'
import Split from 'split.js'
import gutter from './lib/sections/vertical.png'
let delegate = require('delegate');
import {phonetic} from './lib/phonetic'
import {segmenter} from '../../segmenter'

const {ipcRenderer} = require('electron')
// const shell = require('electron').shell

const jetpack = require("fs-jetpack")
const http = require('http')
const tar = require('tar-fs')
const gunzip = require('gunzip-maybe')
const  Progress = require('progress-component');
import png from './lib/sections/check.png'

let split = Split(['#text', '#results'], {
    sizes: [60, 40],
    cursor: 'col-resize',
    minSize: [0, 0]
});

require('electron').ipcRenderer.on('parsed', (event, res) => {
    split.setSizes([60, 40])
    let oHeader = q('#text')
    oHeader.classList.remove('font16')
    empty(oHeader)
    oHeader.addEventListener("wheel", onWheel)
    let oDicts = q('#laoshi-dicts')
    empty(oDicts)

    // log('R', res)
    if (!res.docs) return
    let oRes = q('#results')
    oRes.dnames = res.dnames
    setDictList(res.dnames)

    let mess = doc4seg(res)
    // log('M', mess)

    let oMess = headerMessage(mess)
    oHeader.appendChild(oMess)
})

function doc4seg(res) {
    // log('=R=', res)
    let mess = []
    res.clauses.forEach(clause => {
        if (clause.sp) mess.push({sp: clause.sp})
        else {
            let sres = segmenter(clause.cl, res.docs)
            // log('=SRES=', sres)
            mess.push({cl: clause.cl, segs: sres.segs, gdocs: sres.gdocs })
        }
    })
    // log('=M=', mess)
    return mess
}
// 内蒙古自治区

function headerMessage(mess) {
    let oText = create('div')
    mess.forEach(cl => {
        if (cl.segs) {
            let oClause = parseClause(cl)
            oText.appendChild(oClause)
        } else {
            let oSpace = span()
            let sp = cl.sp.replace('\n', '<br><br>')
            oSpace.innerHTML = sp
            oText.appendChild(oSpace)
        }
    })
    return oText
}

let closePopups = function() {
    let oAmbis = q('.ambis')
    if (oAmbis) remove(oAmbis)
    removeAll('.segs')
}

function parseClause(cl) {
    let oClause = create('span')
    oClause.classList.add('clause')
    cl.segs.forEach((seg, idx) => {
        let oSeg = span(seg.dict)
        // let sidx = (seg.docs) ? seg.idx : idx // there are no ambis in gdocs by definition
        oSeg.setAttribute('idx', seg.idx)
        let klass = (seg.docs) ? 'seg' : 'ambi'
        oSeg.classList.add(klass)
        // oSeg.classList.remove('current')
        oClause.appendChild(oSeg)
    })
    bindOverEvent(oClause, cl)
    bindClickEvent(oClause, cl)
    // bindAmbiEvents(oClause, cl)
    return oClause
}

function bindOverEvent(el, cl) {
    let oRes = q('#results')
    // show dicts:
    delegate(el, '.seg', 'mouseover', function(e) {
        if (el.classList.contains('clause')) closePopups()
        moveCurrent(e)
        if (e.ctrlKey) return
        log('EL', e.target)
        let idx = e.target.getAttribute('idx')
        let seg = cl.gdocs[idx]
        oRes.current = seg
        showDicts(seg)
    }, false);

    // born ambis popup:
    delegate(el, '.ambi', 'mouseover', function(e) {
        let test = q('#ambis')
        if (test) return
        moveCurrent(e)
        closePopups()
        let oHeader = q('#text')
        let oDicts = q('#laoshi-dicts')
        empty(oDicts)

        let idx = e.target.getAttribute('idx')
        let seg = cl.segs[idx] // there are no ambis in gdocs
        // seg.aidx = idx
        // log('S', idx, seg)
        let oAmbis  = createAmbis(seg, cl)
        oHeader.appendChild(oAmbis)
        let coords = getCoords(e.target);
        placePopup(coords, oAmbis);
    }, false);
}

function bindClickEvent(el, cl) {
    delegate(el, '.seg', 'click', function(e) {
        let oHeader = q('#text')
        let cur = e.target
        let idx = e.target.getAttribute('idx')
        let idy = e.target.getAttribute('idy')
        let idz = e.target.getAttribute('idz')
        let seg
        if (idz && idz > -1) {
            let ambi = cl.segs[idz]
            seg = ambi.ambis[idy][idx]
        }
        else seg = cl.gdocs[idx]
        // log('SEG', seg)
        if (seg.dict.length == 1) return
        // log('ELEM', e.target)

        // let gdocs = _.filter(cl.gdocs, (doc) => { return doc.dict != seg.dict })
        // log('Gdocs', cl.gdocs)
        let docs = _.values(cl.gdocs)
        docs = _.flatten(docs.map(doc => { return doc.docs}))
        // log('Vdocs', docs)
        docs = _.filter(docs, (doc) => { return doc.dict.length < seg.dict.length })
        let segs = segmenter(seg.dict, docs).segs
        // log('SGs', segs)

        let osegs
        if (segs[0].ambis) {
            let aseg = segs[0]
            aseg.aidx = _.findIndex(cl.segs, s => { return s.dict == aseg.dict})
            // log('aSG', aseg)
            let test = q('#ambis')
            if (test) return
            osegs = createAmbis(segs[0], cl)
        }
        else osegs = createSegPopup(segs, cl)
        // log('OS', osegs)
        oHeader.appendChild(osegs)
        let coords = getCoords(cur);
        // log('coord', coords)
        placePopup(coords, osegs);
    })

}

// 内蒙古自治区
function createSegPopup(segs, cl) {
    let oSegs = create('div')
    oSegs.classList.add('segs')
    segs.forEach(seg => {
        let oseg = span(seg.dict)
        oseg.setAttribute('idx', seg.idx)
        if (seg.docs) oseg.classList.add('seg')
        else oseg.classList.add('ambi')
        oSegs.appendChild(oseg)
        let oSpace = span(' ')
        oSegs.appendChild(oSpace)
    })
    bindOverEvent(oSegs, cl)
    bindClickEvent(oSegs, cl)
    return oSegs
}

function createAmbis(seg, cl) {
    // log('CRE AMB SG', seg)
    let oAmbis = recreateDiv('ambis')
    seg.ambis.forEach((asegs, idy) => {
        let oAmbi = create('div')
        asegs.forEach((aseg, idx) => {
            let oAseg = span(aseg.dict)
            oAseg.classList.add('seg')
            oAseg.setAttribute('idx', idx)
            oAseg.setAttribute('idy', idy)
            oAseg.setAttribute('idz', seg.aidx)
            oAmbi.appendChild(oAseg)
            let oSpace = span(' ')
            oAmbi.appendChild(oSpace)
        })
        oAmbis.appendChild(oAmbi)
    })
    bindClickEvent(oAmbis, cl)
    bindOverAmbis(oAmbis, seg)
    return oAmbis
}

// .seg внутри .ambis
function bindOverAmbis(el, seg) {
    delegate(el, '.seg', 'mouseover', function(e) {
        // let aseg = e.target
        log('OAm', e.target)
        log('OAms', seg)
        let idx = e.target.getAttribute('idx')
        let idy = e.target.getAttribute('idy')
        let cur = seg.ambis[idy][idx]
        log('OACur', cur)
        showDicts(cur)
    }, false);
}

function moveCurrent(e) {
    let curs = qs('.current')
    curs.forEach(cur => {cur.classList.remove('current')})
    e.target.classList.add('current')
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

// 内蒙古自治区
function showDicts(seg) {
    let oDicts = q('#laoshi-dicts')
    empty(oDicts)
    let oRes = q('#results')
    log('DICTseg:', seg)
    // console.log('ORD1', seg.docs)
    // seg = seg || oRes.current
    if (!seg || !seg.docs) return
    let ordered = []
    oRes.dnames.forEach(dn => {
        let tmps = _.filter(seg.docs, (doc) => { return doc.dname === dn})
        ordered.push(tmps)
    })
    let flats = _.flatten(_.compact(ordered))
    // log('ORD2', seg.docs)
    // log('FL', flats)

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
        // let oDoc = create('div')
        let oTrns = create('div')
        oTrns.classList.add('trns')
        doc.trns.forEach(trn => {
            let html = cleanTrn(trn)
            oTrns.appendChild(html)
        })
        oDocs.appendChild(oTrns)
        oDicts.appendChild(oDocs)
    })
    // oRes.appendChild(oDicts)
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

function showMessage(str) {
    let parent = q('#antrax-dicts')
    parent.textContent = str
}

ipcRenderer.on('section', function(event, text) {
    showSection(text)
})

function showSection(name) {
    ipcRenderer.send('config')
    ipcRenderer.on('config', function(event, config) {
        setInstallSection(config)
    })
}

function setInstallSection(config) {
    let oHeader = q('#text')
    empty(oHeader)
    // recreate(oHeader)
    oHeader.classList.add('font16')
    let odicts = q('#laoshi-dicts')
    empty(odicts)
    split.setSizes([100, 0])

    oHeader.addEventListener('mouseover', closePopups(), false)
    // let fpath = path.join('src/lib/sections/install-dict.html')
    let fpath = path.join(config.rootdir, 'src/lib/sections/install-dict.html')
    try {
        let html = jetpack.read(fpath)
        if (!html) return
        oHeader.innerHTML = html
    } catch (err) {
        return
    }

    let ochcks = qs('.check')
    ochcks.forEach(ochck => {
        let tr = ochck.parentNode
        if (!config.dbs.includes(tr.id)) return
        let img = create('img')
        img.src = png
        img.classList.add('check')
        ochck.appendChild(img)
    })


    let cedict = q('#cedict')
    let bkrs = q('#bkrs')
    let submit = q('#install-dict')
    let oname = q('#dict-name')
    // let name
    delegate(oHeader, '.load-dict', 'click', function(e) {
        let chck = e.target
        let tr = chck.parentNode.parentNode
        if (config.dbs.includes(tr.id)) return chck.checked = false
        oHeader.name = tr.id
        oHeader.remove = false
        let dname = [oHeader.name, 'tar.gz'].join('.')
        oname.textContent = dname
        let rem = q('.remove-dict:checked')
        if (rem) rem.checked = false
        submit.value = 'install'
    })
    delegate(oHeader, '.remove-dict', 'click', function(e) {
        let chck = e.target
        let tr = chck.parentNode.parentNode
        if (!config.dbs.includes(tr.id)) return chck.checked = false
        oHeader.name = tr.id
        oHeader.remove = true
        let dname = ['installed', oHeader.name, 'dictionary'].join(' ')
        oname.textContent = dname
        let load = q('.load-dict:checked')
        if (load) load.checked = false
        submit.value = 'remove'
    })
    submit.addEventListener('click', loadDict, false)
}

function loadDict() {
    let oHeader = q('#text')
    if (oHeader.remove) ipcRenderer.send('remove', oHeader.name)
    else ipcRenderer.send('install', oHeader.name)
}

let bar, len, part = 0

ipcRenderer.on('bar', function(event, obj) {
    let oHeader = q('#text')
    let ores = div('')
    oHeader.appendChild(ores);
    if (obj.wait) {
        // log('wait')
        ores.textContent = 'process starting, please wait...'
    } else if (obj.start) {
        // log('=start=')
        len = obj.start*1.0
        bar = new Progress;
        ores.appendChild(bar.el);
    } else if (obj.part) {
        // log('part', obj.part)
        if (!bar) return
        part += obj.part*1.0
        let n = part*100/len
        bar.update(n);
    } else if (obj.end) {
        // log('complete')
        ores.textContent = 'sucsess'
    } else if (obj.err) {
        let str = 'server connection error: '+ obj.err
        ores.textContent = str
    }
})

function compactDocs(str, docs) {
    let gdocs = _.groupBy(docs, 'dict')
    let cdocs = []
    for (let dict in gdocs) {
        let indices = []
        let idx = str.indexOf(dict)
        while (idx != -1) {
            indices.push(idx);
            idx = str.indexOf(dict, idx + 1);
        }
        indices.forEach(idx => {
            let res = {dict: dict, size: dict.length, start: idx, docs: gdocs[dict]}
            cdocs.push(res)
        })
    }
    return _.sortBy(cdocs, 'start')
}

function setDictList(dnames) {
    let oRes = q('#results')
    let oList = q('#dicts-list')
    empty(oList)
    oList.classList.add('dicts-list')
    dnames.forEach(dn => {
        let odn = span(dn)
        odn.id = dn
        oList.appendChild(odn)
    })
    delegate(oList, 'span', 'click', function(e) {
        let dn = e.target.id
        if (!dn) return
        let index =  dnames.indexOf(dn)
        if (index < 1) return
        dnames.splice(index, 1)
        dnames.unshift(dn)
        oRes.dnames = dnames
        ipcRenderer.send('dnames', dnames)
        setDictList(dnames)
        showDicts()
    })
    return oList
}

function onWheel(e) {
    let isShift = !!e.shiftKey;
    if (!isShift) return
    let oRes = q('#results')
    oRes.scrollTop += e.deltaY
    e.preventDefault()
}
