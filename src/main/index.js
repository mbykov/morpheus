'use strict'

// import {log} from '../renderer/utils'
import _ from 'lodash'
import { app, BrowserWindow, Menu, Tray, ipcMain, globalShortcut, shell } from 'electron'
import {getWindowState, defaultDBs, readCfg, writeCfg, createDBs, queryHanzi, queryDBs, cleanupDBs} from './createDBs'
// import { autoUpdater } from 'electron-updater'

const path = require('path')

const decompress = require('decompress')
const decompressTargz = require('decompress-targz')

// HACK
app.setPath('userData', app.getPath('userData').replace(/Electron/i, 'morpheus'))
let upath = app.getPath('userData')

const Storage = require('node-localstorage').JSONStorage
const nodeStorage = new Storage(upath)

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason)
  // application specific logging, throwing an error, or other logic here
  app.quit()
})

process.on('uncaughtException', function (err) {
  console.log('err: uncaughtException', err)
  app.quit()
})

// Can be overridden by setting the ELECTRON_IS_DEV environment variable to 1.
// const isDev = require('electron-is-dev')
// if (isDev) {
//   console.log('Running in development')
// } else {
//   console.log('Running in production')
// }

var windowState = getWindowState()
let mainWindow

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

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    title: 'morpheus',
    backgroundColor: '#002b36',
    useContentSize: true,
    x: (windowState.bounds && windowState.bounds.x) || undefined,
    y: (windowState.bounds && windowState.bounds.y) || undefined,
    width: (windowState.bounds && windowState.bounds.width) || 550,
    height: (windowState.bounds && windowState.bounds.height) || 450
  })

  mainWindow.loadURL(winURL)

  // mainWindow.webContents.openDevTools()

  mainWindow.webContents.on('did-finish-load', () => {
    let pckg = require('../../package.json')
    let name = pckg.name
    let version = pckg.version
    mainWindow.webContents.send('version', version)
    mainWindow.setTitle([name, 'v.', version].join(' '))
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.webContents.on('crashed', function (err) {
    console.log('err: CRASHED', err)
    app.quit()
  })

  mainWindow.on('unresponsive', function (err) {
    console.log('err: unresponsive', err)
    app.quit()
  })

  let states = ['resize', 'move', '.close']
  states.forEach(function (e) {
    mainWindow.on(e, function () {
      windowState.bounds = mainWindow.getBounds()
      nodeStorage.setItem('windowstate', windowState)
    })
  })

  let template = require('./menu-template')(mainWindow)
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  let trayicon = path.join(__dirname, '../../build/icons/64x64.png')
  // let trayicon = path.join(__dirname, '../build/book.png')
  let tray = new Tray(trayicon)
  const contextMenu = Menu.buildFromTemplate([
    {label: 'help', role: 'help'},
    {label: 'learn more', click () { shell.openExternal('http://diglossa.org') }},
    {label: 'quit', role: 'quit'}
  ])
  tray.setToolTip('Morpheus-eastern')
  tray.setContextMenu(contextMenu)

  // HACK
  // app.setPath('userData', app.getPath('userData').replace(/Electron/i, 'morpheus'))
  // let upath = app.getPath('userData')
  defaultDBs(upath)

  ipcMain.on('cfg', function (event, newcfg) {
    let cfg
    if (newcfg) {
      cfg = newcfg
      writeCfg(upath, cfg)
    } else {
      cfg = readCfg(upath)
    }
    mainWindow.webContents.send('cfg', cfg)
    // createDBs(upath, cfg).then(dbs => {
    Promise.resolve(createDBs(upath, cfg)).then(dbs => {
      if (!dbs) return
      ipcMain.removeAllListeners('data')
      ipcMain.on('data', function (event, data) {
        let str = data.text
        queryDBs(dbs, str)
          .then(function (arrayOfResults) {
            let flats = _.flatten(_.compact(arrayOfResults))
            if (!flats.length) return
            let answer = {str: str, res: flats, parid: data.parid, clid: data.clid}
            mainWindow.webContents.send('data', answer)
          }).catch(function (err) {
            console.log('ERR queryDBs', err)
          })
      })

      ipcMain.removeAllListeners('hanzi')
      ipcMain.on('hanzi', function (event, seg) {
        queryHanzi(dbs, upath, seg).then(function (doc) {
          if (!doc) return
          mainWindow.webContents.send('hanzi', doc)
        }).catch(function (err) {
          console.log('catched hanzi err', err)
        })
      })
    }).catch(err => {
      console.log('err creating dbns', err)
    })
    // log('CFG', cfg)
  })

  ipcMain.on('ipath', function (event, ipath) {
    let dbpath = path.resolve(upath, 'pouch')
    decompress(ipath, dbpath, {
      plugins: [
        decompressTargz()
      ]
    }).then(() => {
      // console.log('Files decompressed')
      mainWindow.webContents.send('section', 'active')
    })
  })

  ipcMain.on('cleanup', function (event, ipath) {
    cleanupDBs(upath)
    mainWindow.webContents.send('section', 'active')
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

app.on('ready', () => {
  // globalShortcut.register('CommandOrControl+q', () => {
  //   app.quit()
  // })
  globalShortcut.register('CommandOrControl+Shift+q', () => {
    app.quit()
  })
})
