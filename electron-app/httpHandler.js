const axios = require('axios')
const bluebird = require('bluebird')
const dateHandler = require('./dateHandler.js')

/* TODO:
    Note: Right now we are using free API Alpha Vantage Key
*/

function getYear(year) {
    switch(year) {
        case 2020:
            return 0
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

//Promisify httpHandler functions
getBalanceDataPromise = bluebird.promisify(getBalanceData, {multiArgs: true})
getIncomeDataPromise = bluebird.promisify(getIncomeData, {multiArgs: true})
getCashDataPromise = bluebird.promisify(getCashData, {multiArgs: true})

//Getting all the data from Alpha Vantage and return in an array
//Send IBM Balance Sheet HTTP GET Request to Alpha Vantage
function getBalanceData(ticker, year, callBack) {
    axios.get(`https://www.alphavantage.co/query?function=BALANCE_SHEET&symbol=${ticker}&apikey=ALPHA_VANTAGE_API`).then((res) => {

        var index = getYear(year)

        if (res.data.annualReports == undefined) {
            callBack(error = { 
                message: "Error: API Limit Reached",
                arraySize: 37,
                string: 'data'
            }, null, null)
            return
        }

        //Extracting the data from the JSON objects
        var data0 = res.data.annualReports[index].fiscalDateEnding
        var data1 = res.data.annualReports[index].reportedCurrency
        var data2 = res.data.annualReports[index].totalAssets
        var data3 = res.data.annualReports[index].totalCurrentAssets
        var data4 = res.data.annualReports[index].cashAndCashEquivalentsAtCarryingValue
        var data5 = res.data.annualReports[index].cashAndShortTermInvestments
        var data6 = res.data.annualReports[index].inventory
        var data7 = res.data.annualReports[index].currentNetReceivables
        var data8 = res.data.annualReports[index].totalNonCurrentAssets
        var data9 = res.data.annualReports[index].propertyPlantEquipment
        var data10 = res.data.annualReports[index].accumulatedDepreciationAmortizationPPE
        var data11 = res.data.annualReports[index].intangibleAssets
        var data12 = res.data.annualReports[index].intangibleAssetsExcludingGoodwill
        var data13 = res.data.annualReports[index].goodwill
        var data14 = res.data.annualReports[index].longTermInvestments
        var data15 = res.data.annualReports[index].shortTermInvestments
        var data16 = res.data.annualReports[index].otherCurrentAssets
        var data17 = res.data.annualReports[index].otherNonCurrrentAssets
        var data18 = res.data.annualReports[index].totalLiabilities
        var data19 = res.data.annualReports[index].totalCurrentLiabilities
        var data20 = res.data.annualReports[index].currentAccountsPayable
        var data21 = res.data.annualReports[index].deferredRevenue
        var data22 = res.data.annualReports[index].currentDebt
        var data23 = res.data.annualReports[index].shortTermDebt
        var data24 = res.data.annualReports[index].totalNonCurrentLiabilities
        var data25 = res.data.annualReports[index].capitalLeaseObligations
        var data26 = res.data.annualReports[index].longTermDebt
        var data27 = res.data.annualReports[index].currentLongTermDebt
        var data28 = res.data.annualReports[index].longTermDebtNoncurrent
        var data29 = res.data.annualReports[index].shortLongTermDebtTotal
        var data30 = res.data.annualReports[index].otherCurrentLiabilities
        var data31 = res.data.annualReports[index].otherNonCurrentLiabilities
        var data32 = res.data.annualReports[index].totalShareholderEquity
        var data33 = res.data.annualReports[index].treasuryStock
        var data34 = res.data.annualReports[index].retainedEarnings
        var data35 = res.data.annualReports[index].commonStock
        var data36 = res.data.annualReports[index].commonStockSharesOutstanding
        
        array = []
        for (let x = 0; x < 37; x++) {
            array.push(eval(`data${x}`))
        }

        callBack(null, array, 'data')

    }).catch((error) => {
        if (error.response) {
            console.log(error.response.data)
            console.log(error.response.status)
            console.log(error.response.headers) 
        } else if (error.request) {
            console.log(error.request)
        } else {
            console.log('Error', error.message)
        }
        
    })
}

//Send IBM Income Statement HTTP GET Request to Alpha Vantage
function getIncomeData(ticker, year, callBack) {
    axios.get(`https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${ticker}&apikey=JINHJW1NEJGW5K8G`).then((res) => {
        
        var index = getYear(year)

        if (res.data.annualReports == undefined) {
            callBack(error = { 
                message: "Error: API Limit Reached",
                arraySize: 26,
                string: 'idata'
            }, null, null)
            return
        }


        //Extracting the data from the JSON Objects
        var data0 = res.data.annualReports[index].fiscalDateEnding
        var data1 = res.data.annualReports[index].reportedCurrency
        var data2 = res.data.annualReports[index].grossProfit
        var data3 = res.data.annualReports[index].totalRevenue
        var data4 = res.data.annualReports[index].costOfRevenue
        var data5 = res.data.annualReports[index].costofGoodsAndServicesSold
        var data6 = res.data.annualReports[index].operatingIncome
        var data7 = res.data.annualReports[index].sellingGeneralAndAdministrative
        var data8 = res.data.annualReports[index].researchAndDevelopment
        var data9 = res.data.annualReports[index].operatingExpenses
        var data10 = res.data.annualReports[index].investmentIncomeNet
        var data11 = res.data.annualReports[index].netInterestIncome
        var data12 = res.data.annualReports[index].interestIncome
        var data13 = res.data.annualReports[index].interestExpense
        var data14 = res.data.annualReports[index].nonInterestIncome
        var data15 = res.data.annualReports[index].otherNonOperatingIncome
        var data16 = res.data.annualReports[index].depreciation
        var data17 = res.data.annualReports[index].depreciationAndAmortization
        var data18 = res.data.annualReports[index].incomeBeforeTax
        var data19 = res.data.annualReports[index].incomeTaxExpense
        var data20 = res.data.annualReports[index].interestAndDebtExpense
        var data21 = res.data.annualReports[index].netIncomeFromContinuingOperations
        var data22 = res.data.annualReports[index].comprehensiveIncomeNetOfTax
        var data23 = res.data.annualReports[index].ebit
        var data24 = res.data.annualReports[index].ebitda
        var data25 = res.data.annualReports[index].netIncome
                
        array = []
        for (let x = 0; x < 26; x++) {
            array.push(eval(`data${x}`))
        }

        callBack(null, array, 'idata')
    }).catch((error) => {
        if (error.response) {
            console.log(error.response.data)
            console.log(error.response.status)
            console.log(error.response.headers) 
        } else if (error.request) {
            console.log(error.request)
        } else {
            console.log('Error', error.message)
        }
        
    })
}

//Send IBM Cash Flow HTTP GET Request to Alpha Vantage
function getCashData(ticker, year, callBack) {
    axios.get(`https://www.alphavantage.co/query?function=CASH_FLOW&symbol=${ticker}&apikey=JINHJW1NEJGW5K8G`).then((res) => {

        var index = getYear(year)

        if (res.data.annualReports == undefined) {
            callBack(error = { 
                message: "Error: API Limit Reached",
                arraySize: 27,
                string: 'cdata'
            }, null, null)
            return
        }

        //Extracting the data from the JSON objects
        var data0 = res.data.annualReports[index].fiscalDateEnding
        var data1 = res.data.annualReports[index].reportedCurrency
        var data2 = res.data.annualReports[index].operatingCashflow
        var data3 = res.data.annualReports[index].paymentsForOperatingActivities
        var data4 = res.data.annualReports[index].proceedsFromOperatingActivities
        var data5 = res.data.annualReports[index].changeInOperatingLiabilities
        var data6 = res.data.annualReports[index].changeInOperatingAssets
        var data7 = res.data.annualReports[index].depreciationDepletionAndAmortization
        var data8 = res.data.annualReports[index].capitalExpenditures
        var data9 = res.data.annualReports[index].changeInReceivables
        var data10 = res.data.annualReports[index].changeInInventory
        var data11 = res.data.annualReports[index].profitLoss
        var data12 = res.data.annualReports[index].cashflowFromInvestment
        var data13 = res.data.annualReports[index].cashflowFromFinancing
        var data14 = res.data.annualReports[index].proceedsFromRepaymentsOfShortTermDebt
        var data15 = res.data.annualReports[index].paymentsForRepurchaseOfCommonStock
        var data16 = res.data.annualReports[index].paymentsForRepurchaseOfEquity
        var data17 = res.data.annualReports[index].paymentsForRepurchaseOfPreferredStock
        var data18 = res.data.annualReports[index].dividendPayout
        var data19 = res.data.annualReports[index].dividendPayoutCommonStock
        var data20 = res.data.annualReports[index].dividendPayoutPreferredStock
        var data21 = res.data.annualReports[index].proceedsFromIssuanceOfCommonStock
        var data22 = res.data.annualReports[index].proceedsFromIssuanceOfLongTermDebtAndCapitalSecuritiesNet
        var data23 = res.data.annualReports[index].proceedsFromIssuanceOfPreferredStock
        var data24 = res.data.annualReports[index].proceedsFromRepurchaseOfEquity
        var data25 = res.data.annualReports[index].proceedsFromSaleOfTreasuryStock
        var data26 = res.data.annualReports[index].changeInCashAndCashEquivalents
        var data27 = res.data.annualReports[index].changeInExchangeRate
        var data28 = res.data.annualReports[index].netIncome
        
        array = []
        for (let x = 0; x < 29; x++) {
            array.push(eval(`data${x}`))
        }
        callBack(null, array, 'cdata')
    }).catch((error) => {
        if (error.response) {
            console.log(error.response.data)
            console.log(error.response.status)
            console.log(error.response.headers) 
        } else if (error.request) {
            console.log(error.request)
        } else {
            console.log('Error', error.message)
        }       
    })
}

//Get user data from the Heroku Node.js backend
function getUserData(userId) {
    axios.get(`https://orbital-electron.herokuapp.com/users/${userId}`).then(res => {
        console.log(res.data[0])
        console.log(res.data[0].user_id)
        console.log(res.data[0].name)
    }).catch(error => {
        if (error.response) {
            console.log(error.response.data)
            console.log(error.response.status)
            console.log(error.response.headers)
        } else if (error.request) {
            console.log(error.request)
        } else {
            console.log('Error', error.message)
        }
    })
}

//Post user data to the Heroku Node.js backend
function postUserData(userId, name) {
    axios.post(`https://orbital-electron.herokuapp.com/users/${userId}/names/${name}`, {
        "userId": userId,
        "name": name
    }).then(res => {
        console.log(res)
    }).catch(error => {
        if (error.response) {
            console.log(error.response.data)
            console.log(error.response.status)
            console.log(error.response.headers)
        } else if (error.request) {
            console.log(error.request)
        } else {
            console.log('Error', error.message)
        }
    })
}

//Get session data from the Heroku Node.js backend
function getSessionData(sessionId) {
    axios.get(`https://orbital-electron.herokuapp.com/sessions/${sessionId}`).then(res => {
        console.log(res.data)
        console.log(res.data[0].session_id)
        console.log(res.data[0].user_id)
        console.log(res.data[0].date)
        console.log(res.data[0].time)
        console.log(res.data[0].indicator1)
        console.log(res.data[0].indicator2)
        console.log(res.data[0].indicator3)
        console.log(res.data[0].indicator1_value)
        console.log(res.data[0].indicator2_value)
        console.log(res.data[0].indicator3_value)
        console.log(res.data[0].indicator1_eval_value)
        console.log(res.data[0].indicator2_eval_value)
        console.log(res.data[0].indicator3_eval_value)
    }).catch(error => {
        if (error.response) {
            console.log(error.response.data)
            console.log(error.response.status)
            console.log(error.response.headers)
        } else if (error.request) {
            console.log(error.request)
        } else {
            console.log('Error', error.message)
        }
    })
}

//Need to create date and time handlers
function postSessionData(userId, dataObject) {
    let sessionId = userId + dateHandler.getDate() + dateHandler.getTime()
    let indicator1 = dataObject['indicators'][0]
    let indicator2 = dataObject['indicators'][1]
    let indicator3 = dataObject['indicators'][2]
    return axios.post(`https://orbital-electron.herokuapp.com/sessions/${sessionId}`, {
        "sessionId" : sessionId,
        "userId": userId, 
        "date" : dateHandler.getDate(), 
        "time" : dateHandler.getTime(),
        "stockTicker": dataObject['stockTicker'],
        "indicator1": dataObject['indicators'][0],
        "indicator2": dataObject['indicators'][1],
        "indicator3": dataObject['indicators'][2],
        "indicator1Value": dataObject[indicator1]['indicatorStrength'],
        "indicator2Value": dataObject[indicator2]['indicatorStrength'],
        "indicator3Value": dataObject[indicator3]['indicatorStrength'],
        "indicator1EvalValue": dataObject[indicator1]['indicatorCorrelationStrength'],
        "indicator2EvalValue": dataObject[indicator2]['indicatorCorrelationStrength'],
        "indicator3EvalValue": dataObject[indicator3]['indicatorCorrelationStrength'],
        "sentimentAnalysisValue": dataObject['SentimentAnalysis']['sentimentAnalysisStrength'],
        "sentimentAnalysisEvalValue": dataObject['SentimentAnalysis']['sentimentAnalysisEvalStrength']
    }).then(res => {
        return new Promise((resolve, reject) => {
            res.data.date = res.data.date.split("T")[0]
            res.data.indicator1 = toCamelCaseSpaces(res.data.indicator1)
            res.data.indicator2 = toCamelCaseSpaces(res.data.indicator2)
            res.data.indicator3 = toCamelCaseSpaces(res.data.indicator3)
            resolve(res)
        })
    }).catch(error => {
        if (error.response) {
            console.log(error.response.data)
            console.log(error.response.status)
            console.log(error.response.headers)
        } else if (error.request) {
            console.log(error.request)
        } else {
            console.log('Error', error.message)
        }
    }) 
}

//Get session history data from the Heroku Node.js backend
function getSessionHistoryData(userId) {
    return axios.get(`https://orbital-electron.herokuapp.com/session-histories/users/'${userId}'`).then(res => {
        for(let i = 0; i < res.data.length; i++) {
            res.data[i].date = res.data[i].date.split("T")[0]
            res.data[i].indicator1 = toCamelCaseSpaces(res.data[i].indicator1)
            res.data[i].indicator2 = toCamelCaseSpaces(res.data[i].indicator2)
            res.data[i].indicator3 = toCamelCaseSpaces(res.data[i].indicator3)
        }
        return new Promise((resolve, reject) => {
            resolve(res)
        })
    }).catch(error => {
        if (error.response) {
            console.log(error.response.data)
            console.log(error.response.status)
            console.log(error.response.headers)
        } else if (error.request) {
            console.log(error.request)
        } else {
            console.log('Error', error.message)
        }
    })
}

function toCamelCaseSpaces(string) {
    // insert a space before all caps
    return string.replace(/([A-Z])/g, ' $1')
    // uppercase the first character
    .replace(/^./, function(str) { 
        return str.toUpperCase().slice(1);
    })
}

module.exports.getBalanceData = getBalanceDataPromise
module.exports.getIncomeData= getIncomeDataPromise
module.exports.getCashData = getCashDataPromise
module.exports.getUserData = getUserData
module.exports.postUserData = postUserData
module.exports.getSessionData = getSessionData
module.exports.postSessionData = postSessionData
module.exports.getSessionHistoryData = getSessionHistoryData
module.exports.getYear = getYear
