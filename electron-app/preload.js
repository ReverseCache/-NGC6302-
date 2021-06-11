const { Chart, Ticks } = require('chart.js')
const { ipcRenderer } = require('electron')
const httpHandler = require('./httpHandler.js')

/*TODO:
    Build Price Chart for each annum until 2016 (Priority) In progress - Format Chart and destroy it when button is pressed
    Build training mode scenario selector
    Set up user input (Priority)
    Set up dashboard and login page (Priority)
    Implement testing (Priority)
*/

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
    array = []
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

// Chart JS Price Graph
function displayPriceChart(array) {
    var ctx = document.getElementById('myChart').getContext('2d')
    var myChart = new Chart(ctx, {
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

//When recieving a message on this channel get local indicator csv data
ipcRenderer.on('indicatorData', (event, message) => {
    displayLocalData(message)
})

//When receiving a message on this channel get local price csv data
ipcRenderer.on('priceData', (event, message) => {
    console.log(message)
    displayPriceChart(message)
})

//Set up collapsible button for the tables -> need to change to setup for all collapsible buttons
window.addEventListener('DOMContentLoaded', () => {
    var coll = document.getElementsByClassName("collapsible")
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

//Handle year and stock form submissions, and behavior for the get data button
window.addEventListener('DOMContentLoaded', () => {
    
    var array = []

    //Stock form
    var form = document.getElementById("stockform")
    form.onsubmit = async(e) => {
        e.preventDefault()
        var input = form.children[0]
        var stockname = input.value.toString()
        array[0] = stockname
        console.log(array[0])
    }

    //Year form
    var form1 = document.getElementById("yearform")
    form1.onsubmit = async(e) => {
        e.preventDefault()
        var input = form1.children[0]
        var year = parseInt(input.value)
        array[1] = year
        console.log(array[1])
    }

    var button = document.getElementById("getDataButton")
    button.style.margin = "1em 0 4em 0"
    button.onclick = async(e) => {

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

        //Replace the header text with stock ticker and year
        replaceText('stock', 'Stock: ' + array[0])
        replaceText('year', 'Year: ' + array[1])

        //Send a message to IPCMain when button is pressed to retrieve fundamental CSV data
        ipcRenderer.send('indicatorData', array)
        ipcRenderer.send('priceData', array)
    }
})