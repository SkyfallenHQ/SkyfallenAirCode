const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const express = require('express')
const apiapp = express()
const ip = require('ip')
var win
var server
const robot = require('robotjs')
var applistenstatus = false

function createWindow () {
  if(process.platform === 'darwin'){
    win = new BrowserWindow({
      width: 800,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
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

  win.loadFile('index.html')

}

ipcMain.on("ready", function(e,args){

  win.webContents.send("ip",ip.address())
  if(applistenstatus){
    server.close()
  }
  server = apiapp.listen(9984,'0.0.0.0', function(){
    applistenstatus = true;
  })
})

apiapp.get("/sendcode/:code/", (req, res, next) => {
    win.webContents.send("code",req.params.code)
    robot.typeString(req.params.code)
 });

apiapp.get("/connected/:device/", (req, res, next) => {
  win.webContents.send("connected",req.params.device)
});

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform === 'darwin') {
    app.quit()
  } else {

    

  }
})