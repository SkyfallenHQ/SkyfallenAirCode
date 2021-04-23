const { app, BrowserWindow, ipcMain, Menu, Tray } = require('electron')
const path = require('path')
const express = require('express')
const apiapp = express()
const ip = require('ip')
var win
var server
var tray
const robot = require('robotjs')
var applistenstatus = false
var connectedIP
var codesInCurrentSession = []

app.setName("Skyfallen AirCode")

const template = [
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      },
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.reload();
        }
      },
      {
        label: 'Toggle Full Screen',
        accelerator: (function() {
          if (process.platform === 'darwin')
            return 'Ctrl+Command+F';
          else
            return 'F11';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      }
    ]
  },
  {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      },
    ]
  },
  {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Skyfallen Support',
        click: function() { shell.openExternal('https://help.theskyfallen.com') }
      },
    ]
  },
];

if (process.platform === 'darwin') {
  const name = "AirCode";
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: 'Hide ' + name,
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        role: 'hideothers'
      },
      {
        label: 'Show All',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function() { process.exit(); }
      },
    ]
  });
  const windowMenu = template.find(function(m) { return m.role === 'window' })
  if (windowMenu) {
    windowMenu.submenu.push(
      {
        type: 'separator'
      },
      {
        label: 'Bring All to Front',
        role: 'front'
      }
    );
  }
} else {
  template.unshift({
    label: "AirCode",
    submenu: [
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function() { process.exit(); }
      },
    ]
  });
}

Menu.setApplicationMenu(Menu.buildFromTemplate(template));

function createWindow () {
  if(process.platform === 'darwin'){
    win = new BrowserWindow({
      width: 800,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
      devTools: false,
      titleBarStyle: 'hidden'
    })
  } else {
    win = new BrowserWindow({
      width: 800,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    })
  }
  win.on('close', function (evt) {
    evt.preventDefault();
    win.hide()
    tray = new Tray(path.join(__dirname, "icons/png/icon.png")
    tray.on('right-click', toggleWindow)
    tray.on('double-click', toggleWindow)
    tray.on('click', function (event) {
      toggleWindow()
    })
  });
  win.loadFile('index.html')

}

ipcMain.on("ready", function(e,args){

  if(applistenstatus){
    win.webContents.send("init","reload")
    server.close()
  } else {
    win.webContents.send("init","init")
  }
  server = apiapp.listen(9984,'0.0.0.0', function(){
    applistenstatus = true;
    connectedIP = null;
    win.webContents.send("startcomplete")
    win.webContents.send("ip",ip.address())
  })
})

apiapp.get("/sendcode/:code/", (req, res, next) => {
  if(connectedIP == req.connection.remoteAddress){
    codesInCurrentSession.push(req.params.code)
    win.webContents.send("code",req.params.code)
    robot.typeString(req.params.code)
    res.send("OK")
  } else {
    res.send("ERROR")
  }
 });

apiapp.get("/connected/:device/", (req, res, next) => {
  if(connectedIP == null){
    connectedIP = req.connection.remoteAddress;
    win.webContents.send("connected",{ name: req.params.device, ip: connectedIP })
    res.send("OK")
  } else {
    res.send("ERROR")
  }
});

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

function toggleWindow(){
  win.show()
  win.focus()
  tray.destroy()
}