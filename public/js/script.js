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

    if (context.badges.hasOwnProperty('broadcaster') || context.mod) {
        
    }
    else if (context.subscriber) {

    }
    else {

    }

    console.log('target: ', target)
    console.log('context: ', context)
    console.log('msg: ', msg)
}

function onConnectedHandler(address, port) {

    console.log(`* Conectado em ${address}:${port}`)
}

let channel = ''
const channelName = document.querySelector('.channel-name')
const channelBtnConnect = document.querySelector('.channel-btn-connect')
const btnAddCommand = document.querySelector('.btn-add-command')
const tableBody = document.querySelector('.table-body')

channelBtnConnect.onclick = connectChannel
btnAddCommand.onclick = addCommand

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

function addCommand() {

    const rowIndex = tableBody.rows.length
    const commandRow = tableBody.insertRow(rowIndex)

    const nameCell = commandRow.insertCell(0)
    const descriptionCell = commandRow.insertCell(1)
    const actionCell = commandRow.insertCell(2)

    const saveButton = document.createElement('button')
    const editButton = document.createElement('button')
    const removeButton = document.createElement('button')

    saveButton.onclick = () => saveCommand(commandRow, nameCell, descriptionCell)
    editButton.onclick = () => editCommand(commandRow, nameCell, descriptionCell)
    removeButton.onclick = () => removeCommand(commandRow)

    saveButton.classList.add('btn-row-command')
    editButton.classList.add('btn-row-command')
    removeButton.classList.add('btn-row-command')
    saveButton.innerHTML = `<i class="fas fa-save"></i>`
    editButton.innerHTML = `<i class="fas fa-edit"></i>`
    removeButton.innerHTML = `<i class="fas fa-trash-alt"></i>`

    nameCell.innerHTML = "<input></input>"
    descriptionCell.innerHTML = "<input></input>"
    actionCell.appendChild(saveButton)
    actionCell.appendChild(editButton)
    actionCell.appendChild(removeButton)
}

function saveCommand(row, name, description) {

    name.childNodes[0].disabled = true
    description.childNodes[0].disabled = true
    
}

function editCommand(row, name, description) {

    name.childNodes[0].disabled = false
    description.childNodes[0].disabled = false
}

function removeCommand(row) {

    tableBody.deleteRow(row.rowIndex - 1)
}