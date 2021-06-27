const fs = require('fs')
const bluebird = require('bluebird')

//Switch statement to get index for the array
function getYear(year) {
    switch(year) {
        case 2019:
            return 1
        case 2018: 
            return 2
        case 2017:
            return 3
        case 2016:
            return 4
    }
}

readFilePromise = bluebird.promisify(fs.readFile)
readIndicatorCSVFilePromise = bluebird.promisify(readIndicatorCSVFile)
readPriceCSVFilePromise = bluebird.promisify(readPriceCSVFile)
readCorrelationCSVFilePromise = bluebird.promisify(readCorrelationCSVFile)

//Passes an array of indicator values for that year
function readIndicatorCSVFile(fileURL, mimeType, win, year, callBack) {
    readCSVFile(fileURL, mimeType).then((contents) => {
        array = handleFundamentalArray(processCSVData(contents), year)
        callBack(win, array, 'indicatorData')
    }).catch((error) => {
        console.log("Error reading file", error)
    })
}

//Passes an array with an object with two keys, date as key and then price
function readPriceCSVFile(fileURL, mimeType, win, year, callBack) {
    readCSVFile(fileURL, mimeType, callBack, win, year).then((contents) => {
        array = handlePriceArray(processCSVData(contents), year)
        callBack(win, array, 'priceData')
    }).catch((error) => {
        console.log("Error reading file", error)
    })
}

//Passes a javascript object with indicator names as keys and correlation value as value
function readCorrelationCSVFile(fileURL, mimeType, win, callBack) {
    readCSVFile(fileURL, mimeType).then((contents) => {
        dataObject = handleCorrelationArray(processCSVData(contents))
        callBack(win, dataObject, 'correlationData') 
    })
}

//Read a local indicator CSV file and decode buffer to UTF-8
function readCSVFile(fileURL, mimeType) {
    const pathToFile = fileURL.replace("file:\\\\", '')
    return readFilePromise(pathToFile, mimeType)
}


//Assuming CSV data has linebreaks between each set of records
function processCSVData(allText) {
    var allTextLines = allText.split(/\r\n|\n/)
    var headers = allTextLines[0].split(',')
    var lines = []
    var datalines = []

    for (var i = 1; i < allTextLines.length; i++) {
        var data = allTextLines[i].split(',')
        if (data.length == headers.length) {
            var arr1 = []
            var arr2 = []
            for (var j = 0; j < headers.length; j++) {
                arr1.push(headers[j] + ":" + data[j])
                arr2.push(data[j])
            }
            lines.push(arr1)
            datalines.push(arr2)
        }
    }

    //Arr contains three subarrays: Headers + data, headers, data
    var array = []
    lines = lines.reverse()
    datalines = datalines.reverse()
    array.push(lines)
    array.push(headers)
    array.push(datalines)
    return array
}

function handleFundamentalArray(arr, year) {
    return arr[2][getYear(year)]
}

function handlePriceArray(arr, year) {
    array = []
    datalines = arr[2]
    for (var i = 0; i < datalines.length; i++) {
        date = datalines[i][0]
        year1 = date.split('-')[0]
        if (year1 == year) {
            array.push(datePrice = {
                date: date,
                price: datalines[i][5] 
            })
        }
    }
    array = array.reverse()
    return array
}

function handleCorrelationArray(arr) {
    headers = arr[1]
    data = arr[2]
    //console.log(data[0][1])
    let dataObject = {
    } 

    for (let i = 0; i < headers.length; i++) {
        var str = headers[i]
        if (str == "roe__return_on_equity") {
            let str1 = "ReturnOnEquity"
            headers[i] = str1
        } else if (str == "roa__return_on_assets") {
            let str1 = "ReturnOnAssets"
            headers[i] = str1 
        } else if (str == "roi__return_on_investment") {
            let str1 = "ReturnOnInvestment"
            headers[i] = str1
        } else if (str == "receiveable_turnover") {
            let str1 = "ReceivableTurnover"
            headers[i] = str1
        } else {
            let str1 = toCamelCaps(str)
            headers[i] = str1
        }
    }
    for (let i = 1; i < headers.length; i++) {
        dataObject[headers[i]] = data[0][i]
        console.log(headers[i]) 
        console.log(data[0][i])
        console.log(dataObject[headers[i]])
    }
    return dataObject
}

function toCamelCaps(str) {
    str1 = str.replace(/_([a-z])/g, function (g) { return g[1].toUpperCase(); })
    return str1.charAt(0).toUpperCase() + str1.slice(1)
}


//Export the functions
module.exports.readIndicatorCSVFile = readIndicatorCSVFilePromise
module.exports.readPriceCSVFile = readPriceCSVFilePromise
module.exports.readCorrelationCSVFile = readCorrelationCSVFilePromise