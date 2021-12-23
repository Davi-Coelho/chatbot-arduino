// CHATBOT VARIABLES
const client = new tmi.client()
const commands = []

// CHANNEL VARIABLES
let channel = ''
const channelName = document.querySelector('.channel-name')
const channelBtnConnect = document.querySelector('.channel-btn-connect')
const btnAddCommand = document.querySelector('.btn-add-command')
const tableBody = document.querySelector('.table-body')

// USB VARIABLES
let port = null
let reader = null
let encoder = null
let inputDone = null
let outputDone = null
let inputStream = null
let outputStream = null
const baudRate = 9600
const filters = [{ usbVendorId: 0x2341, usbProductId: 0x0043 }];
const labelUsb = document.querySelector('.usb-status')
const btnDetect = document.querySelector('.usb-btn-detect')

// CHATBOT FUNCTIONS
client.on('connected', onConnectedHandler)
client.on('message', onMessageHandler)
client.connect()

function onMessageHandler(target, context, msg, self) {

    if (self) {
        return
    }

    const firstWord = msg.split(' ')[0]
    const command = commands.filter(el => el.command === firstWord)[0]

    if (command) {
        if (context.badges.hasOwnProperty('broadcaster') || context.mod) {    
            console.log('mod: executar todo comando')
        }
        else if (context.subscriber) {
            if (command.permission === '0' || command.permission === '1') {
                console.log('sub: executar comando')
            }
        }
        else {
            if (command.permission === '0') {
                console.log('any: executar comando')
            }
        }
    }

    console.log('context: ', context)
    console.log('msg: ', msg)
}

function onConnectedHandler(address, port) {

    console.log(`* Conectado em ${address}:${port}`)
}

// CHANNEL FUNCTIONS
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
        await detectUsb()
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

    const commandCell = commandRow.insertCell(0)
    const permissionCell = commandRow.insertCell(1)
    const typeCell = commandRow.insertCell(2)
    const actionCell = commandRow.insertCell(3)

    const commandInput = document.createElement('input')
    const permissionSelect = document.createElement('select')
    const typeSelect = document.createElement('select')

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

    saveButton.onclick = () => saveCommand(commandRow, commandInput, permissionSelect, typeSelect, saveButton, editButton)
    editButton.onclick = () => editCommand(commandInput, permissionSelect, typeSelect, saveButton, editButton)
    removeButton.onclick = () => removeCommand(commandRow)

    commandInput.classList.add('input-box')
    permissionSelect.classList.add('select-box')
    typeSelect.classList.add('select-box')

    saveButton.classList.add('btn-row-command')
    editButton.classList.add('btn-row-command')
    removeButton.classList.add('btn-row-command')

    permissionSelect.innerHTML = `<option value="0">Any User</option>
                                  <option value="1">Subscriber</option>
                                  <option value="2">Moderator</option>`
    
    typeSelect.innerHTML = `<option value="2">ON/OFF  (1)</option>
                            <option value="3">ON/OFF  (2)</option>
                            <option value="4">Light   (1)</option>
                            <option value="5">Light   (2)</option>
                            <option value="6">Trigger (1)</option>
                            <option value="7">Trigger (2)</option>`

    saveButton.innerHTML = `<i class="fas fa-save" title="Salvar"></i>`
    editButton.innerHTML = `<i class="fas fa-edit" title="Editar"></i>`
    removeButton.innerHTML = `<i class="fas fa-trash-alt" title="Remover"></i>`

    commandCell.appendChild(commandInput)
    permissionCell.appendChild(permissionSelect)
    typeCell.appendChild(typeSelect)

    actionCell.appendChild(saveButton)
    actionCell.appendChild(editButton)
    actionCell.appendChild(removeButton)

    btnAddCommand.disabled = true
}

function saveCommand(row, commandInput, permissionSelect, typeSelect, saveButton, editButton) {

    const rowIndex = row.rowIndex - 1
    const command = commandInput.value
    const permission = permissionSelect.value
    const type = typeSelect.value
    const hasCommand = commands.filter(el => el.command === command)[0]
    
    if (!hasCommand || commands[rowIndex]) { 

        if (commands[rowIndex]) {            
            commands[rowIndex].command = command
            commands[rowIndex].permission = permission
            commands[rowIndex].type = type
        }
        else {
            commands.push({ command, permission, type })
        }

        commandInput.disabled = true
        permissionSelect.disabled = true
        typeSelect.disabled = true
        saveButton.disabled = true
        editButton.disabled = false
        btnAddCommand.disabled = false
    }
    else {
        alert('Nome de comando já usado!')
    }

}

function editCommand(commandInput, permissionSelect, typeSelect, saveButton, editButton) {

    commandInput.disabled = false
    permissionSelect.disabled = false
    typeSelect.disabled = false
    saveButton.disabled = false
    editButton.disabled = true
}

function removeCommand(row) {

    const rowIndex = row.rowIndex - 1

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

// USB FUNCTIONS
btnDetect.onclick = detectUsb

async function detectUsb(testDetect = true) {

    try {
        port = await navigator.serial.requestPort({ filters })
        labelUsb.style.color = 'green'
        labelUsb.textContent = 'Arduino Uno detectado!'
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