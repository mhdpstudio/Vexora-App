import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', {
      ...electronAPI,
      ...api
    })

    contextBridge.exposeInMainWorld('api', {
      bookmarks: {
        read: () => ipcRenderer.invoke('bookmarks-read'),
        write: (data) => ipcRenderer.invoke('bookmarks-write', data)
      }
      ,
      download: {
        start: (meta) => ipcRenderer.invoke('download-url', meta)
      }
    })
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = {
    ...electronAPI,
    ...api
  }

  window.api = {
    bookmarks: {
      read: () => ipcRenderer.invoke('bookmarks-read'),
      write: (data) => ipcRenderer.invoke('bookmarks-write', data)
    }
    ,
    download: {
      start: (meta) => ipcRenderer.invoke('download-url', meta)
    }
  }
}