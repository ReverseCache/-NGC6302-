const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const csvHandler = require('./csvHandler.js')

//Temp array to store windows
var winarray = []

//Communicates to renderer over a channel
function sendDataToRenderer(win, data, channel) {
    win.webContents.send(channel, data)
}

function createAppWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile('index.html')

    //Add window to the windows array
    winarray.push(win)
    return win
}

app.whenReady().then(() => {
    //showAuthWindow()
    createAppWindow()
    app.on('activate', () => {
        if(BrowserWindow.getAllWindows().length == 0) {
            createAppWindow()
        }
    })
    console.log(`App ready`)
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

//Process indicator CSV data upon receiving message from training mode window
ipcMain.on('indicatorData', (event, message) => {
    csvHandler.readIndicatorCSVFile(__dirname + '/assets/localdata/Ratio/' + message[0] + ' Ratio Data From Macro.csv', 
        'utf-8', 
        winarray[0],
        message[1],
        sendDataToRenderer)
})

//Process price CSV data upon receiving message from training mode window
ipcMain.on('priceData', (event, message) => {
    csvHandler.readPriceCSVFile(__dirname + '/assets/localdata/Price/' + message[0] + ' Price Data.csv',
    'utf-8', 
    winarray[0],
    message[1],
    sendDataToRenderer)
})

//Process correlation CSV data upon receiving message from training mode window
ipcMain.on('correlationData', (event, message) => {
    csvHandler.readCorrelationCSVFile(__dirname + '/assets/localdata/Correlation/' + message + ' Correlation Coefficient Data.csv',
    'utf-8',
    winarray[0],
    sendDataToRenderer)
})

console.log("")


