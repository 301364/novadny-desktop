const { app, BrowserWindow, Menu, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow;

function createWindow() {
  // Splash screen
  const splash = new BrowserWindow({
    width: 400,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    icon: path.join(__dirname, 'simplified-logo.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  splash.loadFile('splash.html');

  // Main app window
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, 'simplified.ico'),
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadURL('https://novaerp.com.novadny.com/app/Views/auth/login.php');

  mainWindow.once('ready-to-show', () => {
    splash.destroy();
    mainWindow.show();
  });

  mainWindow.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  createWindow();
  Menu.setApplicationMenu(null);

  // 🔁 Background update check every 30 minutes
  autoUpdater.checkForUpdatesAndNotify();
  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 30 * 60 * 1000);

  // 📦 Update available
  autoUpdater.on('update-available', (info) => {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Available',
      message: `A new version (${info.version}) is available.\n\nRelease notes:\n${info.releaseNotes || 'No changelog provided.'}\n\nIt will be downloaded in the background.`,
      buttons: ['OK']
    });
  });

  // ⏬ Download progress (you can integrate with a progress bar here too)
  autoUpdater.on('download-progress', (progress) => {
    const percent = Math.round(progress.percent);
    console.log(`🔄 Downloading update: ${percent}%`);
    // Send to renderer if using custom UI: mainWindow.webContents.send('download-progress', percent);
  });

  // ✅ Update ready
  autoUpdater.on('update-downloaded', () => {
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Update Ready',
      message: 'The update has been downloaded and will be installed when you close the app.',
      buttons: ['Restart Now', 'Later']
    }).then(result => {
      if (result.response === 0) autoUpdater.quitAndInstall();
    });
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
