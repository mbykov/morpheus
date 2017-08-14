'use strict'

const path = require('path')
const jetpack = require("fs-jetpack")
const tar = require('tar-fs')
const gunzip = require('gunzip-maybe')

// console.log('ISDEV', isDev)

/*
  - читаю options - список dbnames
  - если нет dbmnames, createDefault - cedict
  - создаю dbs
*/

module.exports = setOptions

function setOptions(app) {
    let config = {
        dtype: 'chinese',
        default: 'cedict',
        file: 'morpheus-config.json',
        upath: app.getPath('userData')
    }

    // path to config:
    config.cpath = path.join(config.upath, config.file)

    let rootdir = path.join(__dirname, '../..')
    // const fromPath = path.resolve(__dirname, '../app.asar.unpacked/chinese')
    const src = path.resolve(rootdir, config.default)
    const folder = path.resolve(config.upath, config.dtype)
    const dest = path.resolve(folder, config.default)
    log('S', src)
    log('F', folder)
    log('D', dest)
    let dbs
    try {
        let dstate = jetpack.exists(folder)
        if (!dstate){
            jetpack.dir(folder, {empty: true})
        }
        dbs = jetpack.list(folder)
        if (!dbs || !dbs.length) {
            log('COPY')
            jetpack.copy(src, dest, { matching: '**/*' })
        }
    } catch (err) {
        log('ERR options', err)
        app.quit()
    }

    config.dbs = jetpack.list(folder)
    jetpack.write(config.cpath, config)
    return config
}


function log() { console.log.apply(console, arguments); }
