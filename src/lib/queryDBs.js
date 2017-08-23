const path = require('path')
const jetpack = require("fs-jetpack")
const _ = require('lodash')
let PouchDB = require('pouchdb')
// PouchDB.plugin(require('pouchdb-adapter-node-websql'))

module.exports = queryDBs


function createDbs(config) {
    let dbs = config.dbs
    let databases = []
    dbs.forEach(dn => {
        let dpath = path.resolve(config.upath, config.dtype, dn)
        let dstate = jetpack.exists(dpath)
        if (dstate) {
            let db = new PouchDB(dpath)
            db.dname = dn
            databases.push(db)
        } else {
            log('NO DB', dn, dpath)
        }
    })
    return databases
}

function queryDBs(clauses, config, cb) {
    let dbs = createDbs(config)
    let keys = []
    clauses.forEach(clause => {
        if (clause.sp) return
        let ckeys = parseKeys(clause.cl)
        keys.push(ckeys)
    })
    keys = _.uniq(_.flatten(keys))
    if (!keys.length) return cb(null, null)
    // log('==UKEYS==', keys.toString())

    Promise.all(dbs.map(function (db) {
        return db.allDocs({
            keys: keys,
            include_docs: true
        }).then(function (res) {
            if (!res || !res.rows) throw new Error('no term result')
            let rdocs = _.compact(res.rows.map(row => { return row.doc}))
            let docs = rdocs.map(rdoc => {
                rdoc.docs.forEach(d => {d.dict = rdoc._id})
                rdoc.docs.forEach(d => {if (!d.trad) d.trad = d.simp })
                rdoc.docs.forEach(d => {d.dname = db.dname, d.type = db.dname.split('-')[0], d.name = db.dname.split('-')[1] })
                return rdoc.docs
            })
            return _.flatten(_.compact(docs))
        }).catch(function (err) {
            log('ERR 1', err)
        })
    })).then(function(arrayOfResults) {
        let flats = _.flatten(_.compact(arrayOfResults))
        cb(null, flats)
    }).catch(function (err) {
        log('ERR 2', err)
    })
}

function parseKeys(str) {
    let h, t
    let padas = []
    for (let idx = 1; idx < str.length+1; idx++) {
        h = str.slice(0, idx)
        t = str.slice(idx)
        padas.push(h)
        let h_
        for (let idy = 1; idy < t.length+1; idy++) {
            h_ = t.slice(0, idy)
            padas.push(h_)
        }
    }
    return padas
}

function log() { console.log.apply(console, arguments); }
