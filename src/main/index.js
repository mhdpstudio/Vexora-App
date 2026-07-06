import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import fs from 'fs'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.ico?asset'

let mainWindow = null;


function createWindow() {
  mainWindow = new BrowserWindow({
    icon,
    width: 900,
    height: 670,
    show: false,
    frame: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.maximize()
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // simple will-download handler: save to user's Downloads folder automatically
  try {
    mainWindow.webContents.session.on('will-download', (event, item) => {
      try {
        const downloadsDir = app.getPath('downloads') || app.getPath('userData');
        fs.mkdirSync(downloadsDir, { recursive: true });
        const savePath = join(downloadsDir, item.getFilename());
        item.setSavePath(savePath);
      } catch (e) {
        console.error('will-download handler error', e);
      }
    });
  } catch (e) {
    console.warn('could not attach will-download handler', e);
  }

  

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  const bookmarksFile = join(app.getPath('userData'), 'bookmarks.json');

  ipcMain.handle('bookmarks-read', async () => {
    try {
      if (!fs.existsSync(bookmarksFile)) return [];
      const content = await fs.promises.readFile(bookmarksFile, 'utf8');
      return JSON.parse(content || '[]');
    } catch (e) {
      console.error('Failed to read bookmarks:', e);
      return [];
    }
  });

  ipcMain.handle('bookmarks-write', async (event, data) => {
    try {
      await fs.promises.writeFile(bookmarksFile, JSON.stringify(data, null, 2), 'utf8');
      return { ok: true };
    } catch (e) {
      console.error('Failed to write bookmarks:', e);
      return { ok: false, error: String(e) };
    }
  });
  ipcMain.handle('download-url', async (event, meta) => {
    try {
      const url = meta?.url || meta;
      if (!url || !mainWindow) return { ok: false, error: 'invalid' };
      // trigger download in the main window
      mainWindow.webContents.downloadURL(url);
      return { ok: true };
    } catch (e) {
      console.error('download-url error', e);
      return { ok: false, error: String(e) };
    }
  });
  

  ipcMain.on('window-minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.minimize()
  })

  ipcMain.on('window-maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)

    if (!win) return

    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  })

  ipcMain.on('window-close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.close()
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})