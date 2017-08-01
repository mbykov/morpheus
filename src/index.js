import _ from 'lodash'
import './style.css'
import {q, qs, create, span, empty, log} from './lib/utils.js'
import {headerMessage} from './lib/header-message.js'

const {ipcRenderer} = require('electron')
// const shell = require('electron').shell


require('electron').ipcRenderer.on('parsed', (event, res) => {
    // let opro = q('#progress')
    // opro.classList.remove('hidden')
    // console.log('R:', res)
    let oHeader = q('#laoshi-header')
    empty(oHeader)
    let oDicts = q('#laoshi-dicts')
    empty(oDicts)

    let oMess = headerMessage(res)
    oHeader.appendChild(oMess)
})


// 第三十各地区要切 实把
// 新华社北京
// 第三十七次会议 并发表重要讲话
// 第三十各地区要切实把
