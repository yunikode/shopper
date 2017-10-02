const electron = require('electron')

const {app, BrowserWindow, webContents, Menu, ipcMain} = electron

const path = require('path')
const url = require('url')

const PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-find'))
const db = new PouchDB('my_shopping')

let mainWindow
let addWindow

function createWindow() {
  mainWindow = new BrowserWindow({width: 800, height: 600})

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  const mainMenu = Menu.buildFromTemplate(menuTemplate)

  Menu.setApplicationMenu(mainMenu)

  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    app.quit()
    mainWindow = null
  })
}

ipcMain.on('form:open', function(e) {
  openAddWindow()
})

ipcMain.on('item:delete', (e, item) => {
  db.find({
    selector: {
      title: {
        $eq: item
      }
    }
  }).then(function(res) {
    for (var i = 0; i < res.docs.length; i++) {
      let id = res.docs[i]._id
      db.get(id).then(function(doc) {
        db.remove(doc)
        return refreshItems()
      })
    }
  }).catch(err => console.log(err))

})

ipcMain.on('item:add', function(e, item) {

  let _item = {
    _id: new Date().toISOString(),
    title: item,
    completed: false
  }
  db.put(_item, function cb(err, res) {
    if (!err) {
      console.log('Successfully added item!')
    }
  })

  refreshItems()

  addWindow.close()
})

function refreshItems() {
  db.allDocs({include_docs: true, attachments: true}).then(items => {
    mainWindow.webContents.send('list:repopulate', items)
  }).catch(err => console.log(err));
}

app.on('ready', () => {
  createWindow()
  ipcMain.on('mainWindowLoaded', () => {
    console.log('DOMReady')
    refreshItems()
  })
})

app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function() {
  if (mainWindow === null) {
    createWindow()
  }
})

function openAddWindow() {
  addWindow = new BrowserWindow({width: 300, height: 200, frame: false})

  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'add.html'),
    protocol: 'file:',
    slashes: true
  }))

  addWindow.on('closed', function() {
    addWindow = null
  })
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
      }, {
        label: 'Clear Item',
        accelerator: process.platform == 'darwin'
          ? 'Command+Alt+X'
          : 'Ctrl+Alt+X',
        click() {
          mainWindow.webContents.send('item:clear')
        }
      }, {
        label: 'Help',
        accelerator: process.platform == 'darwin'
          ? 'Command+H'
          : 'Ctrl+H',
        click() {
          mainWindow.webContents.send('help:show')
        }
      }, {
        label: 'Quit',
        accelerator: process.platform == 'darwin'
          ? 'Command+Q'
          : 'Ctrl+Q',
        click() {
          app.quit()
        }
      }
    ]
  }
]

if (process.platform == 'darwin') {
  menuTemplate.unshift({})
}

if (process.env.NODE_ENV !== 'production') {
  menuTemplate.push({
    label: 'Dev Tools',
    submenu: [
      {
        label: 'Toggle Dev Tools',
        accelerator: process.platform == 'darwin'
          ? 'Command+Shift+I'
          : 'Ctrl+Shift+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools()
        }
      }, {
        role: 'reload'
      }
    ]
  })
}
