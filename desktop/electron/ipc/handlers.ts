import { ipcMain, BrowserWindow, app, Notification } from 'electron';

export function registerIpcHandlers(mainWindow: BrowserWindow): void {
  ipcMain.handle('window:minimize', () => {
    mainWindow.minimize();
  });

  ipcMain.handle('window:maximize', () => {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.handle('window:close', () => {
    mainWindow.hide(); // Minimize to tray instead of quitting
  });

  ipcMain.handle('app:notify', (_event, { title, body }) => {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show();
    }
  });
}
