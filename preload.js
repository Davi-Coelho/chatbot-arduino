const { ipcRenderer, contextBridge } = require('electron')

contextBridge.exposeInMainWorld('api', {
    saveChannel: (channel) => {

        ipcRenderer.invoke('store-save-channel', channel)

        return
    },
    saveCommand: (command) => {

        ipcRenderer.invoke('store-save-command', command)

        return
    },
    loadChannel:  async () => {
        
        return await ipcRenderer.invoke('store-load-channel')
    },
    loadAllCommands: async () => {

        return await ipcRenderer.invoke('store-load-commands')
    },
    editCommand: (indexCommand, command) => {

        ipcRenderer.invoke('store-edit-command', indexCommand, command)        

        return
    },
    deleteChannel: () => {

        ipcRenderer.invoke('store-delete-channel')

        return
    },
    deleteCommand: (command) => {

        ipcRenderer.invoke('store-delete-command', command)

        return
    },
})