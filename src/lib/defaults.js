'use strict'

const path = require('path')
const jetpack = require("fs-jetpack")
const tar = require('tar-fs')
const gunzip = require('gunzip-maybe')

// console.log('ISDEV', isDev)

module.exports = setOptions

function setOptions(app) {
    // path to config:
    let upath = app.getPath('userData')
    let fname = 'morpheus-config.json'
    let cpath = path.join(upath, fname)
    let config
    try {
        config = jetpack.read(cpath, 'json')
    } catch (err) {
        log('ERR', err)
    }

    if (config) return config

    config = {
        dtype: 'chinese',
        default: 'cedict',
        file: fname,
        upath: upath,
        cpath: cpath
    }

    config.rootdir = path.join(__dirname, '../..')
    // const fromPath = path.resolve(__dirname, '../app.asar.unpacked/chinese')
    const src = path.resolve(config.rootdir, config.default)
    const folder = path.resolve(config.upath, config.dtype)
    const dest = path.resolve(folder, config.default)
    // log('S', src)
    // log('F', folder)
    // log('D', dest)
    let dbs
    try {
        let dstate = jetpack.exists(folder)
        if (!dstate){
            jetpack.dir(folder, {empty: true})
        }
        dbs = jetpack.list(folder)
        if (!dbs || !dbs.length) {
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
