import _ from 'lodash'
import {q, qs, create, span, div, p, empty, remove, recreateDiv, log} from './utils.js'
var delegate = require('delegate');
import {phonetic} from './phonetic'

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
        oSeg.singles = []
        seg.dict.split('').forEach(sym => {
            let symseg = _.find(cl.singles, single => single.dict == sym)
            oSeg.singles.push(symseg)
        })
    })
    bindMessageEvents(oClause, cl)
    return oClause
}

document.addEventListener("keydown", keyDown, false)

function keyDown(e) {
    let keyCode = e.keyCode;
    if (e.keyCode != 17) return
    let cur = q('.current')
    if (!cur || cur.textContent.length < 2) return
    if (cur.classList.contains('ambis')) return
    let oResults = q('#laoshi-results')
    let oSingles = recreateDiv('singles')
    cur.textContent.split('').forEach(sym => {
        let symseg = _.find(cur.singles, single => single.dict == sym)
        let oSym = span(symseg.dict)
        oSym.classList.add('seg')
        oSingles.appendChild(oSym)
    })
    oResults.appendChild(oSingles)
    var coords = getCoords(cur);
    placePopup(coords, oSingles);
    delegate(oSingles, '.seg', 'mouseover', function(e) {
        let single = _.find(cur.singles, single => single.dict == e.target.textContent)
        createDict(single)
    }, false);
}

// 第三十各地区要切 en arche en ho logos
// 爾時世尊重說偈言
function bindMessageEvents(el, cl) {
    delegate(el, '.seg', 'mouseover', function(e) {
        let oAmbis = q('.ambis')
        if (oAmbis) remove(oAmbis)
        let oSingles = q('.singles')
        if (oSingles) remove(oSingles)
        if (e.ctrlKey) return
        let idx = e.target.getAttribute('idx')
        let curs = qs('.current')
        curs.forEach(cur => {cur.classList.remove('current')})
        e.target.classList.add('current')
        let seg = cl.segs[idx]
        createDict(seg)
    }, false);

    // AMBIES
    delegate(el, '.ambi', 'mouseover', function(e) {
        let oSingles = q('.singles')
        if (oSingles) remove(oSingles)
        let oResults = q('#laoshi-results')
        let oDicts = q('#laoshi-dicts')
        empty(oDicts)
        let test = q('.ambis')
        if (test) return
        let curs = qs('.current')
        curs.forEach(cur => {cur.classList.remove('current')})
        e.target.classList.add('current')

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
        let oDoc = create('div')
        let oDict = span(doc.dict)
        oDict.classList.add('dict')
        oDoc.appendChild(oDict)
        let odef = span(' - ')
        oDoc.appendChild(odef)
        let phone = phonetic(doc.pinyin)
        let oPinyin = span(phone)
        oDoc.appendChild(oPinyin)
        let oTrns = create('div')
        oTrns.classList.add('trns')
        doc.trns.forEach(trn => {
            oTrns.appendChild(p(trn))
        })
        oDoc.appendChild(oTrns)
        oDicts.appendChild(oDoc)
    })
}
