const { app, BrowserWindow, globalShortcut } = require("electron");
const path = require("path");
require("@electron/remote/main").initialize();
const { updateHandle } = require("./update");
let win;
function creatWindow() {
  win = new BrowserWindow({
    width: 160,
    height: 160,
    frame: false,

    webPreferences: {
      nodeIntegration: true, //设置开启nodejs环境
      contextIsolation: false, // v12.0的require解决办法
      enableRemoteModule: true, // 解决 v10之后remote是undefined, v14之后废弃remote，需要配置这个属性后，并且安装@electron/remote
      // webSecurity: false,
    },
  });

  win.loadFile(path.resolve(__dirname, "./render/update.html"));

  // win.webContents.openDevTools();
  require("@electron/remote/main").enable(win.webContents);

  win.on("closed", () => {
    console.log("closed");
    win = null;
  });

  updateHandle(win, "http://127.0.0.1:8080/");
}
app.whenReady().then(() => {
  // 创建窗口
  creatWindow();
});

app.on("will-quit", () => {
  // 注销全局快捷键
  // globalShortcut.unregisterAll() // 取消所有的
});
