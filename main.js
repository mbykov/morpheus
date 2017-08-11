'use strict'

const path = require('path')
const electron = require('electron')
const {app, Menu, Tray, ipcMain} = require('electron')
const clipboard = electron.clipboard
const jetpack = require("fs-jetpack")
const seg = require('hieroglyphic')
// let seg = require('../segmenter')
let PouchDB = require('pouchdb')
// PouchDB.plugin(require('pouchdb-adapter-node-websql'))
// const reload = require('require-reload')(require)
const isDev = require('electron-is-dev')
const tar = require('tar-fs')
const gunzip = require('gunzip-maybe')
const http = require('http')

// console.log('ISDEV', isDev)

const upath = app.getPath('userData')
const dbPath = path.resolve(upath, 'chinese')
let dbState = jetpack.exists(dbPath)

if (!dbState) {
    console.log('COPYING')
    // fs.chmodSync('test', 0755)
    const toPath = path.resolve(upath, 'chinese')
    const fromPath = path.resolve(__dirname, '../app.asar.unpacked/chinese')
    // const fromPath = path.resolve(__dirname, 'chinese')
    jetpack.copy(fromPath, toPath, { matching: '**/*' })
   dbState = jetpack.exists(dbPath)
}

process.on('unhandledRejection', (reason, p) => {
  // console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});


// 新华社北京
// 第三十七次会议 并发表重要讲话
// let remote = new PouchDB('http:\/\/diglossa.org:5984/chinese')
let remote = new PouchDB('http:\/\/localhost:5984/chinese')
let db = new PouchDB(dbPath)
// // let db = PouchDB(dpath, {adapter: 'websql'})


let timerId = null
let tray = null

app.on('ready', () => {
    let traypath = path.join(__dirname, 'assets/icons/32x32.png')
    tray = new Tray(traypath)
    const contextMenu = Menu.buildFromTemplate([
        {label: 'help', role: 'help'},
        {label: 'learn more', click () { electron.shell.openExternal('http:\/\/diglossa.org') }},
        {label: 'quit', role: 'quit'}
    ])
    tray.setToolTip('This is my application.')
    tray.setContextMenu(contextMenu)
})

const BrowserWindow = electron.BrowserWindow

let mainWindow

function createWindow () {
    mainWindow = new BrowserWindow({width: 800, height: 600, webPreferences: { webSecurity: false }})

    mainWindow.loadURL(`file://${__dirname}/build/index.html`)

    mainWindow.webContents.openDevTools()
    mainWindow.focus()

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        timerId = null
        mainWindow = null
        tray = null
        db = null
  })

  tray.on('click', () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })
}

ipcMain.on('download', (event, dname) => {
    log('LANG START', dname)
    // hande - 246580
    // remote.info(function(err, info) {
    //     remoteCount = info.doc_count;
    //     console.log('REM SIZE', remoteCount);
    // });
    // tmp, for a time being...
    let counts = {
        hande: 246580,
        cedict: 183236,
        bkrs: 2920249
    }

    let bar = {wait: 'wait'}
    mainWindow.webContents.send('bar', bar);

    let rep = PouchDB.replicate(remote, db, {
        // live: true,
        retry: true,
        filter: 'chinese/by_dict',
        query_params: { "dname": dname },
        batches_limit: 10,
        batch_size: 10000
    })
        .on('change', function (info) {
            bar = {part: info.docs.length}
            mainWindow.webContents.send('bar', bar);
        }).on('paused', function (err) {
            log('paused')
        }).on('active', function () {
            bar = {start: counts[dname]}
            mainWindow.webContents.send('bar', bar);
            log('==start==')
        }).on('denied', function (err) {
            // a document failed to replicate (e.g. due to permissions)
        }).on('complete', function (info) {
            log('==complete==')
            bar = {end: 'end'}
            mainWindow.webContents.send('bar', bar);
        }).on('error', function (err) {
            log('sync err: ', err)
            bar = {err: err}
            mainWindow.webContents.send('bar', bar);
        });

    // https://github.com/pouchdb/pouchdb/issues/5713
})

ipcMain.on('install', (event, dname) => {
    log('INSTALL START', dname)

    let bar = {wait: 'wait'}
    mainWindow.webContents.send('bar', bar);

    const resourse = ['/dicts/chinese_', dname, '.tar.gz'].join('')
    log('RESOURSE', resourse)

    let uPath = upath
    let pouchPath = path.join(upath, 'chinese')
    console.log('toPATH', uPath)
    let req = http.request({
        host: 'en.diglossa.org', // 'localhost'
        // port: 80, // 3001,
        path: resourse
    })
    // let len
    req.on('response', function(res){
        log('START', req.statusCode)

        jetpack.dir(pouchPath, {empty: true})

        if (('' + req.statusCode).match(/^2\d\d$/)) {
            log('res: happy')
        } else if (('' + req.statusCode).match(/^5\d\d$/)) {
            log('res: some server error', req.statusCode)
            bar = {err: req.statusCode}
            mainWindow.webContents.send('bar', bar);
            // Server error, I have no idea what happend in the backend
            // but server at least returned correctly (in a HTTP protocol sense) formatted response
        }
        res.pipe(gunzip()).pipe(tar.extract(uPath));

        let len = parseInt(res.headers['content-length'], 10)
        bar = {start: len}
        mainWindow.webContents.send('bar', bar);

        res.on('data', function (chunk) {
            bar = {part: chunk.length}
            mainWindow.webContents.send('bar', bar);
        })

        res.on('end', function () {
            res.pipe(gunzip()).pipe(tar.extract(uPath));
            log('==complete==')
            app.relaunch()
            app.quit() // quit the current app
            // log('APP NOT QUITTED')

        })
    })
    req.on('error', function (err) {
        log('ERR', err)
        bar = {err: JSON.stringify(err)}
        mainWindow.webContents.send('bar', bar);
    });
    req.end()

})


function sendStatus(text) {
    mainWindow.webContents.send('status', text);
}

const template = [
    {
        role: 'window',
        submenu: [
            {role: 'minimize'},
            {role: 'close'},
            {role: 'quit'}
        ]
    },
    {
        label: 'Actions',
        submenu: [
            {label: 'replicate dict',  click() { mainWindow.webContents.send('section', 'replicate-dict') }},
            {label: 'install dict.tar.gz',  click() { mainWindow.webContents.send('section', 'install-dict') }},
            {label: 'signup/login'}
        ]
    },
    {
        role: 'help',
        submenu: [
            {
                label: 'Learn More',
                click () { electron.shell.openExternal('https://electron.atom.io') }
            }
        ]
    }
]

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)


app.on('ready', () => {
    let oldstr = null
    timerId = setInterval(function(){
        if (!db) return
        if (!mainWindow) return
        // if (mainWindow.isVisible()) return
        let str = clipboard.readText()
        if (!str) return
        if (str === oldstr) return
        oldstr = str

        function somePromiseAPI() {
            return Promise.resolve().then(function () {
                seg(db, str, function(err, res) {
                    if (err) return log('seg err', err)
                    mainWindow.webContents.send('parsed', res)
                })
                return 'foo';
            }).then(function () {
                log('seg ok', str)
            }).catch(console.log.bind(console))
        }

        somePromiseAPI()

        // seg(db, str, function(err, res) {
        //     if (err) return
        //     if (!mainWindow) return
        //     mainWindow.webContents.send('parsed', res)
        // })

    }, 100)
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function log() { console.log.apply(console, arguments); }
