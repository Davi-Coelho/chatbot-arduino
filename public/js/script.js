const options = {
    channels: []
}

const client = new tmi.client(options)
const commands = []

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

channelBtnConnect.disabled = true
channelBtnConnect.onclick = connectChannel
btnAddCommand.onclick = addCommand

channelName.addEventListener('keypress', preventWhiteSpace)
channelName.addEventListener('keyup', (e) => {
    if (!!(e.target.value.length > 3)) {
        channelBtnConnect.disabled = false
    }
    else {
        channelBtnConnect.disabled = true
    }
})

async function connectChannel() {

    if (channelBtnConnect.innerHTML === 'Conectar') {
        await detectUsb(false)
        if (port) {
            channel = channelName.value.trim()
            if (channel.length > 3) {
                client.join(channel).then(async () => {
                    console.log(`Conectado ao canal ${channel}!`)
                    channelName.disabled = true
                    btnDetect.disabled = true
                    channelBtnConnect.classList.add('connected')
                    channelBtnConnect.innerHTML = 'Desconectar'
                    await connectUsb()
                }).catch(error => {
                    console.log(error)
                })
            }
            else {
                alert('Canal vazio ou inválido!')
            }
        }
        else {
            alert('Nenhum Arduino detectado!')
        }
    }
    else {
        client.part('#' + channel).then(async () => {
            console.log(`Desconectado do canal ${channel}!`)
            channelName.disabled = false
            btnDetect.disabled = false
            channelBtnConnect.classList.remove('connected')
            channelBtnConnect.innerHTML = 'Conectar'
            channel = ''
            await disconnectUsb()
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

    const commandInput = document.createElement('input')
    const descriptionInput = document.createElement('input')

    const saveButton = document.createElement('button')
    const editButton = document.createElement('button')
    const removeButton = document.createElement('button')

    editButton.disabled = true
    saveButton.disabled = true

    commandInput.addEventListener('keypress', preventWhiteSpace)
    commandInput.addEventListener('keyup', (e) => {
        if (!!e.target.value.length) {
            saveButton.disabled = false
        }
        else {
            saveButton.disabled = true
        }
    })

    saveButton.onclick = () => saveCommand(commandRow, nameCell, descriptionCell, saveButton, editButton)
    editButton.onclick = () => editCommand(commandRow, nameCell, descriptionCell, saveButton, editButton)
    removeButton.onclick = () => removeCommand(commandRow)

    commandInput.classList.add('input-box')
    descriptionInput.classList.add('input-box')

    saveButton.classList.add('btn-row-command')
    editButton.classList.add('btn-row-command')
    removeButton.classList.add('btn-row-command')

    saveButton.innerHTML = `<i class="fas fa-save" title="Salvar"></i>`
    editButton.innerHTML = `<i class="fas fa-edit" title="Editar"></i>`
    removeButton.innerHTML = `<i class="fas fa-trash-alt" title="Remover"></i>`

    nameCell.appendChild(commandInput)
    descriptionCell.appendChild(descriptionInput)
    actionCell.appendChild(saveButton)
    actionCell.appendChild(editButton)
    actionCell.appendChild(removeButton)
}

function saveCommand(row, name, description, saveButton, editButton) {

    name.childNodes[0].disabled = true
    description.childNodes[0].disabled = true
    saveButton.disabled = true
    editButton.disabled = false
    commands.push({ command: name.childNodes[0].value })
}

function editCommand(row, name, description, saveButton, editButton) {

    name.childNodes[0].disabled = false
    description.childNodes[0].disabled = false
    saveButton.disabled = false
    editButton.disabled = true
}

function removeCommand(row) {

    const rowIndex = row.rowIndex - 1
    console.log(rowIndex)

    if (confirm('Tem certeza que deseja remover esse comando?')) {
        commands.splice(rowIndex, 1)
        tableBody.deleteRow(rowIndex)
    }
}

function preventWhiteSpace(e) {

    const key = e.keyCode
    if (key === 32) {
        e.preventDefault()
    }
}

let port = null
let reader = null
let encoder = null
let inputDone = null
let outputDone = null
let inputStream = null
let outputStream = null

const baudRate = 9600
const filters = [{ usbVendorId: 0x2341, usbProductId: 0x0043 }];
const btnDetect = document.querySelector('.usb-btn-detect')
const labelUsb = document.querySelector('.usb-status')

btnDetect.onclick = detectUsb

async function detectUsb(testDetect = true) {

    try {
        port = await navigator.serial.requestPort({ filters })
        if (testDetect) {
            labelUsb.style.color = 'green'
            labelUsb.textContent = 'Arduino Uno detectado!'
        }
    }
    catch (e) {
        console.log(e)
    }
}

async function connectUsb() {

    try {
        port = await navigator.serial.requestPort({ filters })
        await port.open({ baudRate })
    }
    catch (e) {
        console.log(e)
    }

    console.log('USB conectado!')

    encoder = new TextEncoderStream()
    outputDone = encoder.readable.pipeTo(port.writable)
    outputStream = encoder.writable
}

async function disconnectUsb() {

    if (outputStream) {
        try {
            await outputStream.getWriter().close()
            await outputDone
        }
        catch (e) {
            console.log(e)
        }
        outputStream = null
        outputDone = null
    }

    try {
        await port.close()
    }
    catch (e) {
        console.log(e)
    }
    port = null
    console.log('USB desconectado!')
}

function writeToStream(...lines) {

    const writer = outputStream.getWriter()
    lines.forEach(line => {
        writer.write(line + '\n')
    })
    writer.releaseLock()
}