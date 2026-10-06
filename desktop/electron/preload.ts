import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('jarvisDesktop', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close'),
  notify: (title: string, body: string) => ipcRenderer.invoke('app:notify', { title, body }),
  isDesktop: true,
});
