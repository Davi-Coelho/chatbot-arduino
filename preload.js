require('dotenv').config()
const { contextBridge } = require('electron')

contextBridge.exposeInMainWorld('bot', {
    BOT_USERNAME: process.env.BOT_USERNAME,
    BOT_PASSWORD: process.env.BOT_PASSWORD
})