'use strict'

import {app} from 'electron'
import {log} from '../renderer/utils'
import _ from 'lodash'

const path = require('path')
const fse = require('fs-extra')
let PouchDB = require('pouchdb')

app.setPath('userData', app.getPath('userData').replace(/Electron/i, 'morpheus'))
let upath = app.getPath('userData')

const Storage = require('node-localstorage').JSONStorage
const nodeStorage = new Storage(upath)

// emptyDirSync(dir) ?? FIX

export function getWindowState () {
  let windowState
  try {
    windowState = nodeStorage.getItem('windowstate')
    if (!windowState) {
      windowState = {}
      windowState.bounds = {x: undefined, y: undefined, width: 800, height: 600}
      // nodeStorage.setItem('windowstate', windowState)
    }
  } catch (err) {
    log('STERR', err)
  }
  return windowState
}

export function defaultDBs (upath) {
  let dest = path.resolve(upath, 'pouch')
  let src = path.resolve(__dirname, '../..', 'pouch')
  try {
    let dstate = fse.pathExistsSync(dest)
    // dstate = false // FIX: всегда создаю 2 словаря
    if (!dstate) {
      fse.copySync(src, dest, { matching: '**/*' })
    }
  } catch (err) {
    log('ERR creating pouch', err)
    app.quit()
  }
}

// export function createDBs_ (upath, config) {
//   if (!config) return
//   let promise = new Promise(function (resolve, reject) {
//     resolve(manyDBs(upath, config))
//   })
//   return promise
// }

export function createDBs (upath, infos) {
// function manyDBs (upath, infos) {
  let databases = []
  // let dbns = config.map(info => { return info.path })
  infos = _.sortBy(infos, 'weight')
  infos.forEach(info => {
    if (!info.active) return
    let dn = info.path
    let dpath = path.resolve(upath, 'pouch', dn)
    let dstate = fse.exists(dpath)
    if (dstate) {
      let pouch = new PouchDB(dpath)
      pouch.dname = dn
      // pouch.active = true
      databases.push(pouch)
    } else {
      console.log('NO DB', dn, dpath)
    }
  })
  return databases
}

export function queryDBs (dbs, str) {
  let keys = parseKeys(str)
  let active = _.filter(dbs, db => { return db.dname !== 'hanzi' })
  return Promise.all(active.map(function (db) {
    return db.allDocs({
      keys: keys,
      include_docs: true
    }).then(function (res) {
      if (!res || !res.rows) throw new Error('no dbn result')
      let rdocs = _.compact(res.rows.map(row => { return row.doc }))
      if (!rdocs.length) return
      rdocs.forEach(rd => {
        rd.docs.forEach(d => {
          d.dname = db.dname
          d.dict = rd._id
          // log('D', d)
        })
      })
      return rdocs
    }).catch(function (err) {
      console.log('ERR 1', err)
    })
  }))
}

export function queryHanzi (dbs, upath, seg) {
  let keys = [seg]
  let active = _.find(dbs, db => { return db.dname === 'hanzi' })
  let opt = {keys: keys, include_docs: true}
  let promise = new Promise((resolve, reject) => {
    active.allDocs(opt).then(function (res) {
      if (!res || !res.rows) throw new Error('no dbn result')
      let docs = _.compact(res.rows.map(row => { return row.doc }))
      return Promise.all(docs.map(function (doc) {
        return doc
      }))
    }).then(function (docs) {
      let doc = docs[0]
      if (doc) delete doc._rev
      resolve(doc)
    }).catch(function (err) {
      log('ERR query HANZI', err)
      reject(err)
    })
  })
  return promise
}

function parseKeys (str) {
  let h, t
  let padas = []
  for (let idx = 1; idx < str.length + 1; idx++) {
    h = str.slice(0, idx)
    t = str.slice(idx)
    padas.push(h)
    let h_
    for (let idy = 1; idy < t.length + 1; idy++) {
      h_ = t.slice(0, idy)
      padas.push(h_)
    }
  }
  return padas
}

export function cleanupDBs (upath) {
  let dest = path.resolve(upath, 'pouch')
  let src = path.resolve(__dirname, '../..', 'pouch')
  try {
    fse.emptyDirSync(dest)
    fse.copySync(src, dest, { matching: '**/*' })
  } catch (err) {
    log('ERR creating pouch', err)
    app.quit()
  }
}

export function readCfg (upath) {
  let dest = path.resolve(upath, 'pouch')
  let infos = []
  try {
    fse.readdirSync(dest).forEach((fn, idx) => {
      if (path.extname(fn) !== '.json') return
      let ipath = path.resolve(dest, fn)
      let info = fse.readJsonSync(ipath)
      // ==========
      if (!info.hasOwnProperty('active')) info.active = true
      if (!info.hasOwnProperty('weight')) info.weight = idx
      infos.push(info)
    })
  } catch (err) {
    log('ERR: can not read cfg')
    app.quit()
  }
  return infos
}

export function writeCfg (upath, cfg) {
  let dest = path.resolve(upath, 'pouch')
  try {
    cfg.forEach(info => {
      let fn = [info.path, 'json'].join('.')
      let ipath = path.resolve(dest, fn)
      fse.writeJsonSync(ipath, info)
    })
  } catch (err) {
    log('can not write cfg')
    app.quit()
  }
}

// function defaultCfg () {
//   let dest = path.resolve(upath, 'pouch')
//   let infos = []
//   try {
//     fse.readdirSync(dest).forEach((fn, idx) => {
//       if (path.extname(fn) !== '.json') return
//       let ipath = path.resolve(dest, fn)
//       let info = fse.readJsonSync(ipath)
//       if (!info.hasOwnProperty('active')) info.active = true
//       if (!info.hasOwnProperty('weight')) info.weight = idx
//       infos.push(info)
//     })
//   } catch (err) {
//     log('ERR: can not read cfg')
//     app.quit()
//   }
//   return infos
// }

// export function readCfg_ (upath) {
//   let cfg = nodeStorage.getItem('cfg')
//   if (!cfg) cfg = defaultCfg()
//   // log('R', cfg)
//   return cfg
// }

// export function writeCfg_ (upath, cfg) {
//   try {
//     nodeStorage.setItem('cfg', cfg)
//   } catch (err) {
//     log('can not write cfg')
//     app.quit()
//   }
// }
