const options = {
    identity: {
        username: window.bot.BOT_USERNAME,
        password: window.bot.BOT_PASSWORD
    },
    channels: ['davicoelho']
}

const client = new tmi.client(options)

client.on('connected', onConnectedHandler)
client.on('message', onMessageHandler)
client.connect()

function onMessageHandler(target, context, msg, self) {
    if (self) return

    const command = msg

    if (msg === 'Olá') {
        client.say(target, `Olá ${context.username}!`)
    }
}

function onConnectedHandler(address, port) {
    
    console.log(`* Conectado em ${address}:${port}`)
}