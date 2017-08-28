import {q, qs, create, span, div, p, empty, remove, removeAll, recreate, recreateDiv, log} from '../utils.js'
let delegate = require('delegate');
const {ipcRenderer} = require('electron')
import {installDict, dictList} from './install.js'
const shell = require('electron').shell

import about from './about.html'
import help from './help.html'
import code from './code.html'
import contacts from './contacts.html'
import screencast from './screencast.html'
import acknowledgements from './acknowledgements.html'
import ecbt from './about-ecbt.html'
import ambipic from './ambiguity.png'
import recpic from './recursive.png'


export function showSection(name) {
    let oHeader = q('#text')
    switch (name) {
    case 'about':
        section(about)
        break
    case 'help':
        section(help)
        let apic = q('#ambipic')
        apic.src = ambipic
        let rpic = q('#recpic')
        rpic.src = recpic
        break
    case 'code':
        section(code)
        break
    case 'contacts':
        section(contacts)
        break
    case 'ecbt':
        section(ecbt)
        break
    case 'screencast':
        section(screencast)
        break
    case 'acknowledgements':
        section(acknowledgements)
        break
    case 'install':
        ipcRenderer.send('config')
        ipcRenderer.on('config', function(event, config) {
            installDict(config)
        })
        break
    }

    delegate(oHeader, '.external', 'click', function(e) {
        let href= e.target.textContent
        shell.openExternal(href)
    })
}

function section(sec) {
    let oHeader = q('#text')
    empty(oHeader)
    oHeader.classList.add('font16')
    oHeader.innerHTML = sec
    let odicts = q('#laoshi-dicts')
    empty(odicts)
}
