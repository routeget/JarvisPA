import { app, BrowserWindow, globalShortcut, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import { setupSecurityHeaders } from './security/csp';
import { registerIpcHandlers } from './ipc/handlers';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

let isQuitting = false;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#080c14',
    title: 'J.A.R.V.I.S. Desktop AI Agent',
    frame: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });

  setupSecurityHeaders();
  registerIpcHandlers(mainWindow);

  const indexPath = path.join(__dirname, '../../dist/index.html');
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173').catch(() => {
      mainWindow?.loadFile(indexPath);
    });
  } else {
    mainWindow.loadFile(indexPath).catch(() => {
      mainWindow?.loadURL('http://localhost:5173');
    });
  }

  mainWindow.on('close', (event) => {
    // Minimize to system tray instead of closing app
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
    return false;
  });
}

function createTray(): void {
  // Use a simple 16x16 cyan data icon for system tray
  const icon = nativeImage.createFromBuffer(
    Buffer.from('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMklEQVR42mNkYPj/n4GBgZGBgYFh1ICRDcA4YjAG/iMDGBm/4f+fUQMGDhg1YGQDAHhEB/3rUHQZAAAAAElFTkSuQmCC', 'base64')
  );

  tray = new Tray(icon);
  tray.setToolTip('J.A.R.V.I.S. Desktop AI Agent');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open J.A.R.V.I.S.',
      click: () => {
        mainWindow?.show();
        mainWindow?.focus();
      },
    },
    {
      label: 'Start Voice Mode',
      click: () => {
        mainWindow?.show();
        mainWindow?.webContents.send('voice:open');
      },
    },
    {
      label: 'View Pending Approvals',
      click: () => {
        mainWindow?.show();
        mainWindow?.webContents.send('navigate:tasks');
      },
    },
    { type: 'separator' },
    {
      label: 'Pause Agent (Safety)',
      click: () => {
        mainWindow?.webContents.send('agent:pause');
      },
    },
    { type: 'separator' },
    {
      label: 'Exit J.A.R.V.I.S.',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    mainWindow?.show();
  });
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  // Register Global Hotkey Ctrl+Space per Section 63
  globalShortcut.register('CommandOrControl+Space', () => {
    if (mainWindow) {
      if (mainWindow.isVisible() && mainWindow.isFocused()) {
        mainWindow.webContents.send('command-bar:toggle');
      } else {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send('command-bar:open');
      }
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
