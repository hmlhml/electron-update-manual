const { autoUpdater } = require("electron-updater");
const { ipcMain } = require("electron");

// 关闭自动下载
autoUpdater.autoDownload = false;

let mainWindow = null;

module.exports.updateHandle = function (window, feedUrl) {
  mainWindow = window;
  let message = {
    error: "检查更新出错",
    checking: "正在检查更新……",
    updateAva: "检测到新版本，正在下载……",
    updateNotAva: "现在使用的就是最新版本，不用更新",
  };
  //设置更新包的地址
  autoUpdater.setFeedURL(feedUrl);
  //监听升级失败事件
  autoUpdater.on("error", function (error) {
    sendUpdateMessage({
      cmd: "error",
      message: error,
    });
  });
  //监听开始检测更新事件
  autoUpdater.on("checking-for-update", function (message) {
    sendUpdateMessage({
      cmd: "checking-for-update",
      message: message,
    });
  });
  //监听发现可用更新事件
  autoUpdater.on("update-available", function (message) {
    sendUpdateMessage({
      cmd: "update-available",
      message: message,
    });
  });
  //监听没有可用更新事件
  autoUpdater.on("update-not-available", function (message) {
    sendUpdateMessage({
      cmd: "update-not-available",
      message: message,
    });
  });

  // 更新下载进度事件
  autoUpdater.on("download-progress", function (progressObj) {
    sendUpdateMessage({
      cmd: "download-progress",
      message: progressObj,
    });
  });
  //监听下载完成事件
  autoUpdater.on(
    "update-downloaded",
    function (event, releaseNotes, releaseName, releaseDate, updateUrl) {
      sendUpdateMessage({
        cmd: "update-downloaded",
        message: {
          releaseNotes,
          releaseName,
          releaseDate,
          updateUrl,
        },
      });
      // 退出并安装更新包
      autoUpdater.quitAndInstall();
    }
  );

  //接收渲染进程消息，开始检查更新
  ipcMain.on("checkForUpdate", (e, arg) => {
    //执行自动更新检查
    sendUpdateMessage({ cmd: "checkForUpdate", message: arg });
    autoUpdater.checkForUpdates();
  });

  // 接收渲染进程消息，安装最新版本
  ipcMain.on("installNewVersion", (e, arg) => {
    // 退出并安装更新包
    console.log("接收渲染进程消息，下载新包");
    // 关闭自动下载后可通过调用此方法启动下载
    autoUpdater.downloadUpdate();
  });
};

//给渲染进程发送消息
function sendUpdateMessage(text) {
  console.log("给渲染进程发送消息:", text);
  console.log({ mainWindow });
  mainWindow.webContents.send("message", text);
}