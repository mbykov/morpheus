'use strict'

const path = require('path')
const electron = require('electron')
const {app, Menu, Tray, ipcMain, nativeImage} = require('electron')
const clipboard = electron.clipboard
const jetpack = require("fs-jetpack")
const band = require('speckled-band')

let setDefauts = require('./lib/defaults')
let query = require('./lib/queryDBs')
const _ = require('lodash')

let PouchDB = require('pouchdb')
// PouchDB.plugin(require('pouchdb-adapter-node-websql'))
// const reload = require('require-reload')(require)
const isDev = require('electron-is-dev')
const tar = require('tar-fs')
const gunzip = require('gunzip-maybe')
const http = require('http')

const autoUpdater = require("electron-updater").autoUpdater
// autoUpdater.logger = log;
// autoUpdater.logger.transports.file.level = 'info';
// log.info('App starting...');
// console.log('ISDEV', isDev)


let config = setDefauts(app)

process.on('unhandledRejection', (reason, p) => {
  // console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

let timerId = null
let tray = null

const BrowserWindow = electron.BrowserWindow

let mainWindow

function createWindow () {
    let winpath = path.join(__dirname, '../assets/book.png')
    let icon = nativeImage.createFromPath(winpath)

    mainWindow = new BrowserWindow(
        {width: 800,
         height: 600,
         icon: icon
         // webPreferences: { webSecurity: false }
        })

    let name = require('../package.json').name
    let version = require('../package.json').version
    mainWindow.setTitle([name, 'v.', version].join(' '));

    let rootpath = path.resolve(__dirname, '..')
    mainWindow.loadURL(`file://${rootpath}/build/index.html`)

    // mainWindow.webContents.openDevTools()
    mainWindow.focus()

    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time this is the time
        // when you should delete the corresponding element.
        timerId = null
        mainWindow = null
        query = null
  })

    tray.on('click', () => {
        mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
    })

    let template = require('./menu-template.html')(mainWindow, electron)
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)

    const ses = mainWindow.webContents.session
    ses.clearCache(function() {
        log('CACHE')
    })
}

const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
    }
})

if (shouldQuit) {
    app.quit()
}

app.on('ready', () => {
    let oldstr = null
    timerId = setInterval(function(){
        if (!query) return
        let str = clipboard.readText()
        if (!str) return
        if (str === oldstr) return
        oldstr = str

        let code = 'zh'
        band(code, str, function(err, clauses) {
            if (err) return
            let clean = clauses.map(cl => {return cl.cl }).join('')
            if (!clean.length) return

            Promise.resolve().then(function () {
                query(clauses, config, function(err, res) {
                    if (!mainWindow) return
                    if (err) {
                        log('db err: ', err)
                        app.quit()
                    } else {
                        mainWindow.webContents.send('parsed', {clauses: clauses, docs: res, dnames: config.dbs, config: config})
                    }
                })
            }).then(function () {
                // log('seg ok', str)
            }).catch(console.log.bind(console))

        })

    }, 100)
})

app.on('ready', () => {
    let trayicon = path.join(__dirname, '../assets/icons/png/32x32.png')
    // let trayicon = path.join(__dirname, '../assets/book.png')
    tray = new Tray(trayicon)
    const contextMenu = Menu.buildFromTemplate([
        {label: 'help', role: 'help'},
        {label: 'learn more', click () { electron.shell.openExternal('http:\/\/diglossa.org') }},
        {label: 'quit', role: 'quit'}
    ])
    tray.setToolTip('Morpheus-eastern')
    tray.setContextMenu(contextMenu)
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

ipcMain.on('config', (event) => {
    mainWindow.webContents.send('config', config);
})

ipcMain.on('dnames', (event, dnames) => {
    config.dbs = dnames
    saveConfig(config)
})

function saveConfig(config) {
    try {
        jetpack.write(config.cpath, config)
    } catch (err) {
        console.log('ERR', err)
    }
}

ipcMain.on('remove', (event, dname) => {
    let dest = path.join(config.upath, 'chinese', dname)
    jetpack.remove(dest)
    let dnames = config.dbs
    let index =  dnames.indexOf(dname)
    if (index < 1) return
    dnames.splice(index, 1)
    config.dbs = dnames
    saveConfig(config)
    // mainWindow.webContents.send('section', {sec: 'install', config: config})
    mainWindow.webContents.send('section', 'install')
    // app.relaunch()
    // app.quit()
})

ipcMain.on('install', (event, dname) => {
    if (!dname) return
    let bar = {wait: 'wait'}
    mainWindow.webContents.send('bar', bar);

    const resourse = ['/dicts/', dname, '.tar.gz'].join('')

    let dest = path.join(config.upath, 'chinese')

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

        bar = {start: len}
        mainWindow.webContents.send('bar', bar);

        res.pipe(gunzip()).pipe(tar.extract(dest));

        res.on('data', function (chunk) {
            bar = {part: chunk.length}
            mainWindow.webContents.send('bar', bar);
        })

        res.on('end', function () {
            // log('==complete==')
            config.dbs.push(dname)
            saveConfig(config)
            // mainWindow.webContents.send('section', {sec: 'install', config: config})
            mainWindow.webContents.send('section', 'install')
            // app.relaunch()
            // app.quit()
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

autoUpdater.on('checking-for-update', () => {
    sendStatus('Checking for update...');
})
autoUpdater.on('update-available', (ev, info) => {
    sendStatus('Update available, downloading');
})
// autoUpdater.on('update-not-available', (ev, info) => {
    // sendStatus('Update not available.');
// })
autoUpdater.on('error', (ev, err) => {
    sendStatus('Error in auto-updater: ' + err);
})

// // autoUpdater.on('download-progress', (progressObj) => {
// //     let log_message = "Download speed: " + progressObj.bytesPerSecond;
// //     log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
// //     log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
// //     sendStatus(log_message);
// // })


function log() { console.log.apply(console, arguments); }
