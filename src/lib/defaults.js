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
    try {
        let dstate = jetpack.exists(folder)
        if (!dstate){
            jetpack.dir(folder, {empty: true})
        } else {
        }
        if (!jetpack.exists(dest)) {
            jetpack.copy(src, dest, { matching: '**/*' })
        }
    } catch (err) {
        log('ERR options', err)
        app.quit()
    }
    // log('SRC', src)
    // log('FOLD', folder)
    // log('DEST', dest)
    let dbs = jetpack.list(folder)

    config.dbs = dbs
    jetpack.write(config.cpath, config)
    return config
}


function log() { console.log.apply(console, arguments); }
