const { Chart } = require('chart.js')
const { ipcRenderer, ipcMain } = require('electron')
const httpHandler = require('./httpHandler.js')

/*TODO:
    Set up feedback (Priority)
    Set up dashboard and login page
    Implement testing
*/

var stockTicker = null;

//Generate the three fundamental indicators to assess
function generateFundamentalScenario(dataObject, callBack) {

    let array = []
    let max = 20
    let min = 1
    while (array.length < 3) {
        let num = Math.floor(Math.random() * (max - min)) + min
        let string
        switch (num) {
            case 1:
                string = "CurrentRatio"
                break
            case 2:
                string = "LongTermDebtToCapital"
                break
            case 3:
                string = "DebtToEquityRatio"
                break
            case 4:
                string = "GrossMargin"
                break
            case 5:
                string = "OperatingMargin"
                break
            case 6:
                string = "EbitMargin"
                break
            case 7:
                string = "EbitdaMargin"
                break
            case 8:
                string = "PretaxProfitMargin"
                break
            case 9:
                string = "NetProfitMargin"
                break
            case 10:
                string = "AssetTurnover"
                break
            case 11:
                string = "InventoryTurnoverRatio"
                break
            case 12:
                string = "ReceivableTurnover"
                break
            case 13:
                string = "DaysSalesInReceivables"
                break
            case 14:
                string = "ReturnOnEquity"
                break
            case 15:
                string = "ReturnOnTangibleEquity"
                break
            case 16:
                string = "ReturnOnAssets"
                break
            case 17:
                string = "ReturnOnInvestment"
                break
            case 18:
                string = "BookValuePerShare"
                break
            case 19:
                string = "OperatingCashFlowPerShare"
                break
            case 20:
                string = "FreeCashFlowPerShare"
                break
        }
        if (array.indexOf(string) === -1) {
            if (!(dataObject[string] === undefined || dataObject[string] === null)) {
                console.log("Chosen Indicator: " + string)
                console.log("Chosen Indicator Value: " + dataObject[string])
                array.push(string)
            }
        }
    }
    callBack(array)
    array1 = array
}

//Display the radio buttons corresponding to the indicators that the scenario generator produced
function displayFundamentalScenario(array) {
    for (let i = 0; i < array.length; i++) {
        indicatorName = array[i];
        element = document.getElementById(indicatorName);
        element.style.display = "initial"
    }
}

//Replace the text in the HTML with the data
const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
}

//Display local CSV data
function displayLocalData(arr) {
    for (let x = 0; x < arr.length; x++) {
        replaceText(`fdata${x}`, arr[x])
    }
}

//Write data from http requests to table
function writeDataToTable(arr, string) {
    let array = []
    for (let x = 0; x < arr.length; x++) {
        array.push(x.toString())
    }

    for (const type of array) 
    replaceText(string + `${type}`, arr[parseInt(type)])
}

//If http request produces an error, write error message to table
function writeErrorToTable(length, string, message) {
    for (let x = 0; x < length; x++) {
        replaceText(string + `${x.toString()}`, message)
    }
}

//Chart variable
var myChart = null

// Chart JS Price Graph
function displayPriceChart(array) {
    if (myChart != null) {
        myChart.destroy()
    }
    let ctx = document.getElementById('myChart').getContext('2d')
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                data: array
            }]
        },
        options: {
            parsing: {
                xAxisKey: 'date',
                yAxisKey: 'price'
            },
            scales: {
                xAxis: {
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.5)'
                    }
                },
                yAxis: {
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.5)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            borderColor: 'rgba(255, 255, 255, 0.5)',
            pointBackgroundColor: 'rgba(255, 178, 10, 0.5)',
            pointRadius: '2',
        }
    })
}

//When recieving a message on this channel display local indicator csv data
ipcRenderer.on('indicatorData', (event, message) => {
    displayLocalData(message)
})

//When receiving a message on this channel display local price csv data
ipcRenderer.on('priceData', (event, message) => {
    displayPriceChart(message)
})

//When receiving a message on this channel, generate fundamental scenario
ipcRenderer.on('correlationData', (event, message) => {
    generateFundamentalScenario(message, displayFundamentalScenario)
})

//Set up collapsible button for the tables
window.addEventListener('DOMContentLoaded', () => {
    let coll = document.getElementsByClassName("collapsible")
    for (let i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", () => {
            var content = coll[i].nextElementSibling
            if (content.style.display === "table") {
                content.style.display = "none"
            } else {
                content.style.display = "table"
            }
        })
    }
})

//Handle hiding and showing dashboard, training mode and glossary
window.addEventListener('DOMContentLoaded', () => {
    let dashboard = document.getElementById("dashboard")
    let training = document.getElementById("training")

    //Default setting
    let dbool = true
    let tbool = false
    let gbool = false
    dashboard.style.display = "block"
    
    let dbutton = document.getElementById("dbutton")
    dbutton.onclick = () => {
        if (dbool == false) {
            dbool = true
            tbool = false
            gbool = false
        }
        dashboard.style.display =  "block"
        training.style.display = "none"
    }

    let tbutton = document.getElementById("tbutton")
    tbutton.onclick = () => {
        if(tbool == false) {
            tbool = true
            dbool = false
            gbool = false
        }
        dashboard.style.display = "none"
        training.style.display = "block"
    }

    let gbutton = document.getElementById("gbutton")
    gbutton.onclick = () => {
        if(gbool == false) {
            gbool = true
            dbool = false
            tbool = false  
        }
        dashboard.style.display = "none"
        training.style.display = "none"
    }
})

//Handle year and stock form submissions, behavior for the get data button, as well as the submit button to get user input
window.addEventListener('DOMContentLoaded', () => {
    
    let array = []

    //Stock form
    let form = document.getElementById("stockform")
    form.onsubmit = async(e) => {
        e.preventDefault()
        let input = form.children[0]
        let stockname = input.value.toString()
        array[0] = stockname
        console.log(array[0])
        beginbutton.disabled = false
    }

    //Year form
    let select = document.getElementById("yearselect")
    select.onchange = async(e) => {
        e.preventDefault()
        let year = parseInt(select.value)
        array[1] = year
        console.log(array[1])
    }

    //Set up begin collapsible button
    let beginbutton = document.getElementById("beginButton")
    if(array[0] == null) {
        beginButton.disabled = true
    }
    beginbutton.style.margin = "1em 0 4em 0"
    beginbutton.onclick = async(e) => {
        let infobody = document.getElementById("infobody")
        infobody.style.display = "block"
        form.style.display = "none"
        beginbutton.style.display = "none"

        //Replace the header text with stock ticker
        replaceText('stock', 'Stock: ' + array[0])

        //Update local variable stockname
        stockTicker = array[0]
        
        //Generate Fundamental Indicator Scenarios
        console.log(stockTicker)
        ipcRenderer.send('correlationData', stockTicker)
    }

    //Set up getData button to do callbacks to get data
    let getDataButton = document.getElementById("getDataButton")
    getDataButton.style.margin = "1em 0 4em 0"
    getDataButton.onclick = async(e) => {

        let infocontent = document.getElementById("infocontent")
        infocontent.style.display = "block"

        // Set up the callbacks for promisified functions and write the data to the DOM, for chosen ticker and year
        // Need to do something if the calls are invalid
        httpHandler.getBalanceData(array[0], array[1]).spread((arr, string) => {
            writeDataToTable(arr, string)
        }).catch((err) => {
            console.log(err)
            writeErrorToTable(err.arraySize, err.string, err.message)
        })
        
        httpHandler.getIncomeData(array[0], array[1]).spread((arr, string) => {
            writeDataToTable(arr, string)
        }). catch((err) => {
            console.log(err)
            writeErrorToTable(err.arraySize, err.string, err.message)
        })
        
        httpHandler.getCashData(array[0], array[1]).spread((arr, string) => {
            writeDataToTable(arr, string)
        }).catch((err) => {
            console.log(err)
            writeErrorToTable(err.arraySize, err.string, err.message)
        })

        //Replace the header text with year
        replaceText('stock', 'Stock: ' + array[0])
        replaceText('year', 'Year: ' + array[1])

        //Send a message to IPCMain when button is pressed to retrieve fundamental and price CSV data
        ipcRenderer.send('indicatorData', array)
        ipcRenderer.send('priceData', array)
    }

    //Set up the submit button for fundamental user input, for backend to process
    let submitButton = document.getElementById("submitButton")
    submitButton.onclick = async(e) => {
        let indicatorArray = Array.from(array1)
        let dataObject = {
            'stockTicker': stockTicker,
            'indicators' : indicatorArray
        }
        for (let i = 0; i < array1.length; i++) {
            indicatorName = array1[i]
            elements = document.getElementsByName(indicatorName)
            for (let j = 0; j < elements.length; j++) {
                radioButton = elements[j]
                if (radioButton.checked) {
                    //Make a Javascript object with key value pair, with indicator name as key and strength as value
                    dataObject[indicatorName] = radioButton.nextElementSibling.innerText 
                }
            }
        }

        pricePrediction = document.getElementsByName("PricePrediction")
        for (let i = 0; i < pricePrediction.length; i++) {
            radioButton = pricePrediction[i]
            if (radioButton.checked) {
                dataObject['pricePrediction'] = radioButton.nextElementSibling.innerText
            }
        }   

        //Testing to see if it works => works
        for (let i = 0; i < array1.length; i++) {
            console.log(dataObject[indicatorArray[i]])
            console.log(dataObject['indicators'][i])
        }
        console.log(dataObject['pricePrediction'])
    }
})