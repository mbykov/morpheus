//
// import bus from '../renderer/bus'
// import {app} from 'electron'

module.exports = function (win) {
  return [
    {
      label: 'window',
      submenu: [
        {label: 'home', click () { win.webContents.send('section', 'home') }},
        // {role: 'reload'},
        // {role: 'forcereload'},
        {role: 'minimize'},
        {role: 'quit'}
        // {label: 'quit', click () { app.quit() }}
      ]
    },
    {
      label: 'about',
      submenu: [
        {label: 'about Morpheus', click () { win.webContents.send('section', 'about') }},
        {label: 'authentic grammar', click () { win.webContents.send('section', 'authentic') }},
        {label: 'Dharma-Reader', click () { win.webContents.send('section', 'dharma') }},
        {label: 'code and license', click () { win.webContents.send('section', 'code') }},
        {label: 'external databases', click () { win.webContents.send('section', 'external') }},
        {label: 'contacs', click () { win.webContents.send('section', 'contacts') }},
        {label: 'acknowledgements', click () { win.webContents.send('section', 'acknowledgements') }}
      ]
    },
    {
      label: 'dictionaries',
      submenu: [
        {label: 'active dicts', click () { win.webContents.send('section', 'active') }},
        {label: 'install from file', click () { win.webContents.send('section', 'install') }},
        {label: 'cleanup db', click () { win.webContents.send('section', 'cleanup') }}
      ]
    },
    {
      label: 'help',
      submenu: [
        {label: 'help', click () { win.webContents.send('section', 'help') }},
        {label: 'screencast', click () { win.webContents.send('section', 'screencast') }},
        {role: 'toggledevtools'}
      ]
    }
  ]
}

// export default template
