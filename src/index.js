const path = require('path')
import {q, qs, create, span, div, p, empty, remove, removeAll, recreate, recreateDiv, log} from './lib/utils.js'
import _ from 'lodash'
import './style.css'
import Split from 'split.js'
import gutter from './lib/sections/vertical.png'
let delegate = require('delegate');
import {phonetic} from './lib/phonetic'
// import {segmenter} from '../../segmenter'
import {segmenter} from 'recursive-segmenter'

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

    if (!res.docs) return
    let oRes = q('#results')
    oRes.dnames = res.dnames
    setDictList(res.dnames)

    let mess = doc4seg(res)

    let oMess = headerMessage(mess)
    oHeader.appendChild(oMess)
})

function doc4seg(res) {
    let mess = []
    res.clauses.forEach(clause => {
        if (clause.sp) mess.push({sp: clause.sp})
        else {
            let sres = segmenter(clause.cl, res.docs)
            mess.push({cl: clause.cl, segs: sres.segs, gdocs: sres.gdocs })
        }
    })
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
        oSeg.setAttribute('idx', seg.idx)
        oSeg.classList.add('seg')
        oClause.appendChild(oSeg)
    })
    bindOverEvent(oClause, cl)
    bindClickEvent(oClause, cl)
    return oClause
}

function bindOverEvent(el, cl) {
    let oRes = q('#results')
    delegate(el, '.seg', 'mouseover', function(e) {
        if (el.classList.contains('clause')) closePopups()
        moveCurrent(e)
        if (e.ctrlKey) return
        let dict = e.target.textContent
        let seg = _.find(cl.segs, s => { return s.dict == dict}) || _.find(cl.gdocs, s => { return s.dict == dict})
        if (seg && seg.docs) return showDicts(seg)
        else if (seg && seg.ambis) return createAmbis(e, seg, cl)
    }, false);

}

function bindClickEvent(el, cl) {
    delegate(el, '.seg', 'click', function(e) {
        let oHeader = q('#text')
        if (e.target.textContent.length < 2) return

        let docs = _.values(cl.gdocs)
        docs = _.flatten(docs.map(doc => { return doc.docs}))
        docs = _.filter(docs, (doc) => { return doc.dict.length < e.target.textContent.length })
        let segs = segmenter(e.target.textContent, docs).segs

        if (segs.length == 1 && segs[0].ambis) {
            let aseg = segs[0]
            // let test = q('#ambis')
            // if (test && test.getAttribute('dict') == aseg.dict) return
            createAmbis(e, aseg, cl)
        }
        else createSegPopup(e, segs, cl)
    })
}

// 内蒙古自治区
function createSegPopup(e, segs, cl) {
    let oHeader = q('#text')
    let oDicts = q('#laoshi-dicts')
    empty(oDicts)
    let oSegs = q('#segs')
    if (oSegs && oSegs.getAttribute('dict') == e.target.textContent) return
    oSegs = recreateDiv('segs')
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
    oSegs.setAttribute('dict', e.target.textContent)
    oHeader.appendChild(oSegs)
    let coords = getCoords(e.target);
    placePopup(coords, oSegs);
}

function createAmbis(e, seg, cl) {
    let oHeader = q('#text')
    let oDicts = q('#laoshi-dicts')
    empty(oDicts)
    let oAmbis = q('#ambis')
    if (oAmbis && oAmbis.getAttribute('dict') == seg.dict) return
    oAmbis = recreateDiv('ambis')
    oAmbis.setAttribute('dict', seg.dict)

    seg.ambis.forEach((asegs, idy) => {
        let oAmbi = create('div')
        asegs.forEach((aseg, idx) => {
            let oAseg = span(aseg.dict)
            oAseg.classList.add('seg')
            oAmbi.appendChild(oAseg)
            let oSpace = span(' ')
            oAmbi.appendChild(oSpace)
        })
        oAmbis.appendChild(oAmbi)
    })
    bindOverEvent(oAmbis, cl)
    bindClickEvent(oAmbis, cl)

    oHeader.appendChild(oAmbis)
    let coords = getCoords(e.target);
    placePopup(coords, oAmbis);
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

function showDicts(seg) {
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
        oRes.dnames = dnames // TODO: remove
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
