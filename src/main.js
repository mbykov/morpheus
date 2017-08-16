'use strict'

const path = require('path')
const electron = require('electron')
const {app, Menu, Tray, ipcMain} = require('electron')
const clipboard = electron.clipboard
const jetpack = require("fs-jetpack")
const seg = require('hieroglyphic')
// let seg = require('../../segmenter')

let setDefauts = require('./lib/defaults')

let PouchDB = require('pouchdb')
// PouchDB.plugin(require('pouchdb-adapter-node-websql'))
// const reload = require('require-reload')(require)
const isDev = require('electron-is-dev')
const tar = require('tar-fs')
const gunzip = require('gunzip-maybe')
const http = require('http')

// console.log('ISDEV', isDev)

let config = setDefauts(app)
// log('=OPTIONS=', config)

let dbs = createDbs(config)

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
            // log('D', db)
        } else {
            log('NO DB', dn, dpath)
        }
    })
    return databases
}

// app.quit()

process.on('unhandledRejection', (reason, p) => {
  // console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});


let remote = new PouchDB('http:\/\/diglossa.org:5984/chinese')
// let remote = new PouchDB('http:\/\/localhost:5984/chinese')
// let db = new PouchDB(dbPath)
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
    tray.setToolTip('Morpheus-eastern')
    tray.setContextMenu(contextMenu)
})

const BrowserWindow = electron.BrowserWindow

let mainWindow

function createWindow () {
    mainWindow = new BrowserWindow({width: 800, height: 600, webPreferences: { webSecurity: false }})

    let rootpath = path.resolve(__dirname, '..')
    mainWindow.loadURL(`file://${rootpath}/build/index.html`)

    mainWindow.webContents.openDevTools()
    mainWindow.focus()
    // 胆探索和成功实践胆

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        timerId = null
        mainWindow = null
        tray = null
        dbs = null
  })

  tray.on('click', () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })
}

ipcMain.on('config', (event) => {
    mainWindow.webContents.send('config', config);
})

ipcMain.on('remove', (event, dname) => {
    let dest = path.join(config.upath, 'chinese', dname)
    jetpack.remove(dest)
    app.relaunch()
    app.quit()
})

ipcMain.on('install', (event, dname) => {
    // log('INSTALL START', dname)

    if (!dname) return
    let bar = {wait: 'wait'}
    mainWindow.webContents.send('bar', bar);

    const resourse = ['/dicts/', dname, '.tar.gz'].join('')
    // log('RESOURSE', resourse)

    let dest = path.join(config.upath, 'chinese')
    // console.log('dest:', dest)
    let req = http.request({
        host: 'en.diglossa.org', // 'localhost'
        // port: 80, // 3001,
        path: resourse
    })

    req.on('response', function(res){
        // log('=start=', req.statusCode)

        jetpack.dir(dest) // , {empty: true}

        if (('' + req.statusCode).match(/^2\d\d$/)) {
            // log('res: happy')
        } else if (('' + req.statusCode).match(/^5\d\d$/)) {
            log('res: some server error', req.statusCode)
            bar = {err: req.statusCode}
            mainWindow.webContents.send('bar', bar);
            // Server error, I have no idea what happend in the backend
            // but server at least returned correctly (in a HTTP protocol sense) formatted response
        }
        let len = parseInt(res.headers['content-length'], 10)
        // log('LEN', len)
        bar = {start: len}
        mainWindow.webContents.send('bar', bar);

        res.pipe(gunzip()).pipe(tar.extract(dest));

        res.on('data', function (chunk) {
            bar = {part: chunk.length}
            mainWindow.webContents.send('bar', bar);
        })

        res.on('end', function () {
            res.pipe(gunzip()).pipe(tar.extract(dest));
            // log('==complete==')
            app.relaunch()
            app.quit()
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
            // {label: 'replicate dict',  click() { mainWindow.webContents.send('section', 'replicate-dict') }},
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
        if (!dbs) return
        let str = clipboard.readText('selection')
        if (!str) return
        if (str === oldstr) return
        oldstr = str
        // 胆探索和成功实践

        function somePromiseAPI() {
            return Promise.resolve().then(function () {
                seg(dbs, str, function(err, res) {
                    if (err) return log('seg err', err)
                    if (!mainWindow) return
                    mainWindow.webContents.send('parsed', res)
                })
                return 'foo';
            }).then(function () {
                // log('seg ok', str)
            }).catch(console.log.bind(console))
        }

        somePromiseAPI()
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
