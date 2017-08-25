import {q, qs, create, span, div, p, empty, remove, removeAll, recreate, recreateDiv, log} from '../utils.js'
import png from './check.png'
import isec from './install-dict.html'
const delegate = require('delegate');
const {ipcRenderer} = require('electron')
const  Progress = require('progress-component');


export function installDict(config) {
    let oHeader = q('#text')
    empty(oHeader)
    oHeader.classList.add('font16')
    oHeader.innerHTML = isec
    let odicts = q('#laoshi-dicts')
    empty(odicts)

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

export function dictList(dnames) {
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
        dictList(dnames)
        // showDicts()
    })
    return oList
}
