const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const Store = require('electron-store')
const path = require('path')
const env = process.env.NODE_ENV || 'development';

const store = new Store()

if (env === 'development') {
    try {
        require('electron-reloader')(module, {
            debug: true,
            watchRenderer: true
        });
    } catch (_) { console.log('Error'); }
}


const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 700,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    mainWindow.setMenu(new Menu())

    mainWindow.webContents.session.on('select-serial-port', (event, portList, webContents, callback) => {
        
        event.preventDefault()
        if (portList && portList.length > 0) {
            callback(portList[0].portId)
        } else {
            callback('') //Could not find any matching devices
        }
    })

    mainWindow.webContents.session.on('serial-port-added', (event, port) => {

        console.log('serial-port-added FIRED WITH', port)
    })

    mainWindow.webContents.session.on('serial-port-removed', (event, port) => {

        console.log('serial-port-removed FIRED WITH', port)
    })

    mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission, requestingOrigin, details) => {
        
        if (permission === 'serial' && details.securityOrigin === 'file:///') {
            return true
        }
    })

    mainWindow.webContents.session.setDevicePermissionHandler((details) => {

        if (details.deviceType === 'serial' && details.origin === 'file://') {
            return true
        }
    })

    ipcMain.handle('store-save-channel', (event, channel) => {

        store.set('channel', channel)
        return
    })

    ipcMain.handle('store-save-command', (event, command) => {

        const commands = store.get('commands')

        if(commands) {
            store.set('commands', commands.concat(command))
        }
        else {
            store.set('commands', [command])
        }

        return
    })

    ipcMain.handleOnce('store-load-channel', async (event) => {

        return await store.get('channel')
    })

    ipcMain.handleOnce('store-load-commands', async (event) => {

        return await store.get('commands')
    })

    ipcMain.handle('store-edit-command', (event, commandIndex, command) => {

        const commands = store.get('commands')

        commands[commandIndex].command = command.command
        commands[commandIndex].permission = command.permission
        commands[commandIndex].type = command.type

        store.set('commands', commands)

        return
    })

    ipcMain.handle('store-delete-channel', (event) => {

        store.delete('channel')

        return
    })

    ipcMain.handle('store-delete-command', (event, command) => {

        const commands = store.get('commands')

        commands.splice(command, 1)
        store.set('commands', commands)

        return
    })

    mainWindow.loadFile('index.html')
    mainWindow.webContents.openDevTools()
}

app.whenReady().then(() => {

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