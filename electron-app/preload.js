const { Chart } = require('chart.js')
const { ipcRenderer} = require('electron')
const httpHandler = require('./httpHandler.js')
const weatherHandler = require('./weatherHandler.js')
const idHandler = require('./idHandler.js')

/*TODO:
    Edit database to store the stockticker and sentiments inside session and also datatables
    Either rewrite queries to order by DATE then TIME OR configure datatables to sort properly
    Implement authentication
*/

var stockTicker = null

//Id values for database
var userId = idHandler.getMachineId()

//Generate the three fundamental indicators to assess
function generateFundamentalScenario(dataObject) {

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
            if (!(dataObject[string] === undefined || dataObject[string] === '')) {
                array.push(string)
            }
        }
    }
    return array
}

//Display the radio buttons corresponding to the indicators that the scenario generator produced
function displayFundamentalScenario(array) {
    for (let i = 0; i < array.length; i++) {
        let indicatorName = array[i];
        let element = document.getElementById(indicatorName);
        element.style.display = "initial"
    }
}

function hideFundamentalScenario(array) {
    for (let i = 0; i < array.length; i++) {
        let indicatorName = array[i];
        let element = document.getElementById(indicatorName);
        element.style.display = "none"
    }
}

//Set up the submit button for fundamental user input and the callback to processs data and to send data to nodejs backend
function setupSubmitButton(array, callBack) {
    let submitButton = document.getElementById("submitButton")
    submitButton.onclick = async(e) => {
        let indicatorArray = Array.from(array)
        let dataObject = {
            'stockTicker': stockTicker,
            'indicators' : indicatorArray
        }
        for (let i = 0; i < array.length; i++) {
            indicatorName = array[i]
            elements = document.getElementsByName(indicatorName)
            for (let j = 0; j < elements.length; j++) {
                radioButton = elements[j]
                if (radioButton.checked) {
                    //Make a Javascript object with key value pair, with indicator name as key and strength as value
                    dataObject[indicatorName] = radioButton.nextElementSibling.innerText 
                }
            }
        }

        let pricePrediction = document.getElementsByName("PricePrediction")
        for (let i = 0; i < pricePrediction.length; i++) {
            radioButton = pricePrediction[i]
            if (radioButton.checked) {
                dataObject['pricePrediction'] = radioButton.nextElementSibling.innerText
            }
        }

        let sentimentAnalysis = document.getElementsByName("SentimentAnalysis")
        for (let i = 0; i < sentimentAnalysis.length; i++) {
            radioButton = sentimentAnalysis[i]
            if (radioButton.checked) {
                dataObject['SentimentAnalysis'] = radioButton.nextElementSibling.innerText
            }
        }

        //Pass the compiled dataObject containing user inputs to the callBack for processing
        let compiledDataObject = callBack(dataObject)
        let feedbackDataObject = generateFeedback(compiledDataObject)
        hideFundamentalScenario(indicatorArray)
        displayFeedBack(feedbackDataObject)

        //If logged in, send session data to Node.js backend
        //if (loggedIn == true) {
            httpHandler.postSessionData(userId, feedbackDataObject).then(res => {
                window.$ = window.jquery = require('./node_modules/jquery')
                window.dt = require('./node_modules/datatables.net')()
                dataTable.row.add({
                    "date": res.data.date,
                    "time": res.data.time,
                    "stock_ticker": res.data.stockTicker,
                    "indicator1": res.data.indicator1,
                    "indicator2": res.data.indicator2,
                    "indicator3": res.data.indicator3,
                    "indicator1_value": res.data.indicator1Value,
                    "indicator2_value": res.data.indicator2Value,
                    "indicator3_value": res.data.indicator3Value,
                    "sentiment_analysis_value": res.data.sentimentAnalysisEvalValue,
                    "indicator1_eval_value": res.data.indicator1EvalValue,
                    "indicator2_eval_value": res.data.indicator2EvalValue,
                    "indicator3_eval_value": res.data.indicator3EvalValue,
                    "sentiment_analysis_eval_value": res.data.sentimentAnalysisEvalValue
                }).draw()
            })
        //}
    }
}

//Function to store correlation dataObject, while waiting for the user dataObject
function storeDataObjects(correlationDataObject) {
    return (userDataObject) => {
        compiledDataObject = {
            'correlationDataObject': correlationDataObject,
            'userDataObject' : userDataObject
        }
        return compiledDataObject
    }
}

//Processes the compiled userDataObject and correlationDataObject to generate feedback values
function generateFeedback(compiledDataObject) {
    let userDataObject = compiledDataObject['userDataObject']
    let correlationDataObject = compiledDataObject['correlationDataObject']
    let pricePrediction = userDataObject['pricePrediction']

    let feedbackDataObject = {
        'stockTicker': stockTicker,
        'indicators': Array.from(userDataObject['indicators'])
    }

    for (let i = 0; i < userDataObject['indicators'].length; i++) {
        let indicatorName = userDataObject['indicators'][i]
        let indicatorStrength = userDataObject[indicatorName]
        let indicatorCorrelationValue = correlationDataObject[indicatorName]

        let indicatorCorrelationStrength = null
        if (indicatorCorrelationValue <= 0) {
            indicatorCorrelationStrength = 'Weak'
        } else if (indicatorCorrelationValue < 0.5 && indicatorCorrelationValue > 0) {
            indicatorCorrelationStrength = 'Medium'
        } else {
            indicatorCorrelationStrength = 'Strong'
        }

        if (indicatorCorrelationStrength == indicatorStrength) {
            feedbackDataObject[indicatorName] = {
                'feedback': "Good! Your evaluation of this fundamental indicator matches our stock evaluator!",
                'indicatorCorrelationStrength': indicatorCorrelationStrength,
                'indicatorStrength': indicatorStrength
            }
        } else {
            feedbackDataObject[indicatorName] = {
                'feedback': "Unfortunately, your evaluation of this fundamental indicator does not match our stock evaluator.",
                'indicatorCorrelationStrength' : indicatorCorrelationStrength,
                'indicatorStrength': indicatorStrength
            }
        }
    }

    let sentimentAnalysisStrength = userDataObject['SentimentAnalysis']
    let sentimentAnalysisEvalValue = correlationDataObject['SentimentAnalysis']

    let sentimentAnalysisEvalStrength = null
    if (sentimentAnalysisEvalValue <= 0.2 && sentimentAnalysisEvalValue >= -0.2) {
        sentimentAnalysisEvalStrength = 'Neutral' 
    } else if (sentimentAnalysisEvalValue > 0.2) {
        sentimentAnalysisEvalStrength = 'Positive'
    } else {
        sentimentAnalysisEvalStrength = 'Negative'
    }

    if (sentimentAnalysisEvalStrength == sentimentAnalysisStrength) {
        feedbackDataObject['SentimentAnalysis'] = {
            'feedback': "Good! Your evaluation of the sentiments of this stock in articles matches our stock evaluator.",
            'sentimentAnalysisStrength': sentimentAnalysisStrength,
            'sentimentAnalysisEvalStrength': sentimentAnalysisEvalStrength
        }
    } else {
        feedbackDataObject['SentimentAnalysis'] = {
            'feedback': "Unfortunately, your evaluation of the sentiments of this stock in articles does not match our stock evaluator.",
            'sentimentAnalysisStrength': sentimentAnalysisStrength,
            'sentimentAnalysisEvalStrength': sentimentAnalysisEvalStrength
        }
    }

    return feedbackDataObject
}

//Displays the feedback section and hides all other sections in training section, then dynamically modify the DOM
function displayFeedBack(feedbackDataObject) {
    let infobody = document.getElementById("infobody")
    let infocontent = document.getElementById("infocontent")
    let infofeedback = document.getElementById("infofeedback")
    infobody.style.display = "none"
    infocontent.style.display = "none"
    infofeedback.style.display = "initial"

    for (let i = 0; i < feedbackDataObject['indicators'].length; i++) {
        let indicatorName = feedbackDataObject['indicators'][i]

        //Show user's evalution combined with our feedback on it
        let header = document.getElementById("userinput" + i.toString() + "header")
        header.innerText = indicatorName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, function(str){ return str.toUpperCase(); })
        let indicatorStrength = feedbackDataObject[indicatorName]['indicatorStrength']

        let elements = document.getElementsByName("userinput" + i.toString())
        for (let j = 0; j < elements.length; j++) {
            let radioButton = elements[j]
            let label = radioButton.nextElementSibling
            if (indicatorStrength == label.innerText) {
                radioButton.checked = true
            } else {
                radioButton.disabled = true
                label.disabled = true
            }
        }

        let feedback = feedbackDataObject[indicatorName]['feedback']
        let p = document.getElementById("userinput" + i.toString() + "feedback")
        p.innerText = feedback

        //Show stock evaluator's evaluation
        header = document.getElementById("input" + i.toString() + "header")
        header.innerText = indicatorName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, function(str){ return str.toUpperCase(); })

        let indicatorCorrelationStrength = feedbackDataObject[indicatorName]['indicatorCorrelationStrength']

        elements = document.getElementsByName("input" + i.toString())
        for (let j = 0; j < elements.length; j++) {
            let radioButton = elements[j]
            let label = radioButton.nextElementSibling
            if (indicatorCorrelationStrength == label.innerText) {
                radioButton.checked = true
            } else {
                radioButton.disabled = true
                label.disabled = true
            }
        }
    }

    let sentimentAnalysisStrength = feedbackDataObject['SentimentAnalysis']['sentimentAnalysisStrength']
    let sentimentAnalysisEvalStrength = feedbackDataObject['SentimentAnalysis']['sentimentAnalysisEvalStrength']
    let userelements = document.getElementsByName("userinput3")
    let elements = document.getElementsByName("input3")
    for (let i = 0; i < userelements.length; i++) {
        let radioButton = userelements[i]
        let label = radioButton.nextElementSibling
        if (sentimentAnalysisStrength == label.innerText) {
            radioButton.checked = true
        } else {
            radioButton.disabled = true
            label.disabled = true
        }
        radioButton = elements[i]
        label = radioButton.nextElementSibling
        if (sentimentAnalysisEvalStrength == label.innerText) {
            radioButton.checked = true
            label.disabled = true
        }
    }

    let feedback = feedbackDataObject['SentimentAnalysis']['feedback']
        let p = document.getElementById("userinput3feedback")
        p.innerText = feedback
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

//Chart JS Price Graph
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

//DataTable variable
var dataTable = null;

//Dashboard weather display
function displayWeather() {
    weatherHandler.getWeather().then(weatherObject => {
        replaceText("weather", weatherObject['weather'])
        replaceText("temperature_main", weatherObject['temperature_main'])
        replaceText("temperature_feels", weatherObject['temperature_feels'])
        replaceText("humidity", weatherObject['humidity'])
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
    let array = generateFundamentalScenario(message)
    displayFundamentalScenario(array)
    storeUserDataObject = storeDataObjects(message)
    setupSubmitButton(array, storeUserDataObject)
})

ipcRenderer.on('sentimentalData', (event, message) => {

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
        ipcRenderer.send('glossary', null)
    }
})

//Handle year and stock form submissions, behavior for the getData and back buttons, as well as begin chain to set up fundamental scenario
window.addEventListener('DOMContentLoaded', () => {
    
    let array = []

    //Stock form
    let form = document.getElementById("stockform")
    form.onsubmit = async(e) => {
        e.preventDefault()
        let input = form.children[0]
        let stockname = input.value.toString()
        array[0] = stockname
        beginbutton.disabled = false
    }

    //Year form
    let select = document.getElementById("yearselect")
    select.onchange = async(e) => {
        e.preventDefault()
        let year = parseInt(select.value)
        array[1] = year
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

    //Set up back button to undo 
    let backButton = document.getElementById("backButton")
    backButton.style.margin = "1em 0 4em 0"
    backButton.onclick = async(e) => {
        let infocontent = document.getElementById("infocontent")
        let infobody = document.getElementById("infobody")
        if (infocontent.style.display != "none") {
            console.log("backButton press hide infocontent")
            infocontent.style.display = "none"
        } else {
            console.log("backButton press hide infobody")
            infobody.style.display = "none"
            let form = document.getElementById("stockform")
            form.style.display = "block"
            let beginButton = document.getElementById("beginButton")
            beginButton.style.margin = "1em 0 4em 0"
            beginButton.style.display = "block"
        }
    }

    //Set up finishButton for feedback portion => implement resetting of all variables
    let finishButton = document.getElementById("finishButton")
    finishButton.onclick = async(e) => {
        let infofeedback = document.getElementById("infofeedback")
        infofeedback.style.display = "none"
        let form = document.getElementById("stockform")
        form.style.display = "block"
        form.value = ""
        replaceText("stock", "Stock:")
        replaceText("year", "Year:")
        let beginButton = document.getElementById("beginButton")
        beginButton.style.margin = "1em 0 4em 0"
        beginButton.style.display = "block"
    }
})

//Handle Dashboard UI elements
window.addEventListener('DOMContentLoaded', () => {

    //Dashboard weather elements
    displayWeather()

    //Dashboard User History
    httpHandler.getSessionHistoryData(userId).then(function(res) {
        window.$ = window.jquery = require('./node_modules/jquery')
        window.dt = require('./node_modules/datatables.net')()
        dataTable = window.$('#table_id').DataTable({
            "data": res.data,
            "columns": [
                {"data": "date"},
                {"data": "time"},
                {"data": "stock_ticker"},
                {"data": "indicator1"},
                {"data": "indicator2"},
                {"data": "indicator3"},
                {"data": "indicator1_value"},
                {"data": "indicator2_value"},
                {"data": "indicator3_value"},
                {"data": "sentiment_analysis_value"},
                {"data": "indicator1_eval_value"},
                {"data": "indicator2_eval_value"},
                {"data": "indicator3_eval_value"},
                {"data": "sentiment_analysis_eval_value"}
            ],
            "order": [[0, "desc"], [1, "desc"]],
            "nowrap": false,
            "bFilter": true,
            "ordering": true,
            "select": true,
            "compact": true,
            "hover": true,
            "stripe": true,
            "row-border": true,
            "order-column": true,
            "scrollX": true,
            "scrollY": true,
            "language": {
                "lengthMenu": "Show Number of Entries: _MENU_"
            }
        })
    })
})

//Replace the text in the HTML with the data
const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
}