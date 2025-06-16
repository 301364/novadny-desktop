const { app, BrowserWindow, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

function createWindow() {
  // Splash screen window
  const splash = new BrowserWindow({
    width: 400,
    height: 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    icon: path.join(__dirname, 'novadny-firm-logo.ico')
  });

  splash.loadFile('splash.html');

  // Main app window
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, 'novadny-firm-logo.ico'),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadURL('https://novadny.com');

  win.once('ready-to-show', () => {
    splash.destroy();
    win.show();
  });

  win.setMenuBarVisibility(false);
}

app.whenReady().then(() => {
  createWindow();

  // 🔒 Remove default Electron menu
  Menu.setApplicationMenu(null);

  // 🚀 Auto-update check
  autoUpdater.checkForUpdatesAndNotify();

  autoUpdater.on('update-available', () => {
    console.log('🔄 Update available...');
  });

  autoUpdater.on('update-downloaded', () => {
    console.log('✅ Update downloaded; will install on quit.');
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
