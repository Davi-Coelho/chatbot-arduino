const options = {
    channels: []
}

const client = new tmi.client(options)

client.on('connected', onConnectedHandler)
client.on('message', onMessageHandler)
client.connect()

function onMessageHandler(target, context, msg, self) {
    if (self) {
        return
    }

    const command = msg

    console.log("target: ", target)
    console.log("context: ", context)
    console.log("msg: ", msg)
}

function onConnectedHandler(address, port) {

    console.log(`* Conectado em ${address}:${port}`)
}

let channel = ''
const channelName = document.querySelector('.channel-name')
const channelBtnConnect = document.querySelector('.channel-btn-connect')

channelBtnConnect.onclick = connectChannel
channelName.addEventListener('keypress', (e) => {
    const key = e.keyCode
    if (key === 32) {
        e.preventDefault()
    }
})

function connectChannel() {
    if (channelBtnConnect.innerHTML === 'Conectar') {
        channel = channelName.value.trim()
        if(channel.length > 3) {
            client.join(channel).then(() => {
                console.log(`Conectado ao canal ${channel}!`)
                channelName.disabled = true
                channelBtnConnect.style.backgroundColor = 'red'
                channelBtnConnect.innerHTML = 'Desconectar'
            }).catch(error => {
                console.log(error)
            })
        }
        else {
            alert('Canal vazio ou inválido!')
        }
    }
    else {
        client.part('#' + channel).then(() => {
            console.log(`Desconectado do canal ${channel}!`)
            channelName.disabled = false
            channelBtnConnect.style.backgroundColor = '#0d6efd'
            channelBtnConnect.innerHTML = 'Conectar'
            channel = ''
        }).catch((error) => {
            console.log(error)
        })
    }
}