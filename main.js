const electron = require('electron')

const {app, BrowserWindow, Menu} = electron

const path = require('path')
const url = require('url')

let mainWindow
let addWindow

function createWindow () {
  mainWindow = new BrowserWindow({width: 800, height: 600})

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  const mainMenu = Menu.buildFromTemplate(menuTemplate)

  Menu.setApplicationMenu(mainMenu)

  // mainWindow.webContents.openDevTools()

  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    app.quit()
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

function openAddWindow() {
  addWindow = new BrowserWindow({width: 300, height: 200})

  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'add.html'),
    protocol: 'file:',
    slashes: true
  }))
}

const menuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Add Item',
        accelerator: 'Ctrl+I',
        click() {
          openAddWindow()
        }
      },
      {
        label: 'Clear Item'
      },
      {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click() {
          app.quit()
        }
      }
    ]
  }
]
