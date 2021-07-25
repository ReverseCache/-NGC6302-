const assert = require('assert').strict
const path = require('path')
const csvHandler = require('../csvHandler.js')
const httpHandler = require('../httpHandler.js')

describe('csvHandler tests', function() {
    describe('getYear test', function() {
        it("should return the enumeration for the year", function() {
            assert.equal(csvHandler.getYear(2019), 1)
            assert.equal(csvHandler.getYear(2018), 2)
            assert.equal(csvHandler.getYear(2017), 3)
            assert.equal(csvHandler.getYear(2016), 4)
        })
    })

    describe('readCSVFile test', function() {
        it("should return the contents of the csv file", function() {
            return csvHandler.readCSVFile(path.join(__dirname, 
                '../assets/localdata/Correlation/IBM Correlation Coefficient Data.csv'),'utf-8').then(contents => {
                    assert.equal(contents, ",current_ratio,longterm_debt_to_capital,debt_to_equity_ratio,gross_margin,operating_margin,ebit_margin,ebitda_margin,pretax_profit_margin,net_profit_margin,asset_turnover,inventory_turnover_ratio,receiveable_turnover,days_sales_in_receivables,roe__return_on_equity,return_on_tangible_equity,roa__return_on_assets,roi__return_on_investment,book_value_per_share,operating_cash_flow_per_share,free_cash_flow_per_share\r\n" +
                    "correlation,-0.11082765875349829,0.6296369760275748,0.481063939154269,0.8691543670724637,0.4203783552018233,0.4203783552018233,0.5850292794263835,0.25008996951762913,0.40359873845259175,-0.45513834465454295,0.544510972511194,-0.062279427809027475,0.06822439967886681,0.30853661006554933,-0.13653332100262128,0.14394679777232078,0.08310500274977027,0.20636767463008968,-0.5271880425444216,-0.5551911750309787\r\n")
                })
        })
    })

    describe('processCSVData test', function() {
        it("should return an array with three subarrays: Headers + data, headers, data", function() {
            return csvHandler.readCSVFile(path.join(__dirname, 
                '../assets/localdata/Correlation/IBM Correlation Coefficient Data.csv'),'utf-8').then(contents => {
                    let testarray = []
                    let headersanddata = [1]
                    let headers = []
                    headers.push("free_cash_flow_per_share")
                    headers.push("operating_cash_flow_per_share")
                    headers.push("book_value_per_share")
                    headers.push("roi__return_on_investment")
                    headers.push("roa__return_on_assets")
                    headers.push("return_on_tangible_equity")
                    headers.push("roe__return_on_equity")
                    headers.push("days_sales_in_receivables")
                    headers.push("receiveable_turnover")
                    headers.push("inventory_turnover_ratio")
                    headers.push("asset_turnover")
                    headers.push("net_profit_margin")
                    headers.push("pretax_profit_margin")
                    headers.push("ebitda_margin")
                    headers.push("ebit_margin")
                    headers.push("operating_margin")
                    headers.push("gross_margin")
                    headers.push("debt_to_equity_ratio")
                    headers.push("longterm_debt_to_capital")
                    headers.push("current_ratio")
                    headers.push("")
                    let data = []
                    data.push('-0.5551911750309787')
                    data.push('-0.5271880425444216')
                    data.push('0.20636767463008968')
                    data.push('0.08310500274977027')
                    data.push('0.14394679777232078')
                    data.push('-0.13653332100262128')
                    data.push('0.30853661006554933')
                    data.push('0.06822439967886681')
                    data.push('-0.062279427809027475')
                    data.push('0.544510972511194')
                    data.push('-0.45513834465454295')
                    data.push('0.40359873845259175')
                    data.push('0.25008996951762913')
                    data.push('0.5850292794263835')
                    data.push('0.4203783552018233')
                    data.push('0.4203783552018233')
                    data.push('0.8691543670724637')
                    data.push('0.481063939154269')
                    data.push('0.6296369760275748')
                    data.push('-0.11082765875349829')
                    data.push("correlation")
                    testarray.push(headersanddata)
                    testarray.push(headers)
                    testarray.push(data)
                    let array = csvHandler.processCSVData(contents)
                    assert.deepEqual(array[1].reverse(), testarray[1])
                    assert.deepEqual(array[2][0].reverse(), testarray[2])
                })
        })
    })

    describe('handleCorrelationArray test', function() {
        it("returns the JS object for the stock containing an array of indicators, and key-value pairs, for year 2019", function() {
            return csvHandler.readCSVFile(path.join(__dirname, 
                '../assets/localdata/Correlation/IBM Correlation Coefficient Data.csv'),'utf-8').then(contents => {
                    dataObject = csvHandler.handleCorrelationArray(csvHandler.processCSVData(contents), 2019)
                    assert.equal(dataObject['FreeCashFlowPerShare'], '-0.5551911750309787')
                    assert.equal(dataObject['OperatingCashFlowPerShare'], '-0.5271880425444216')
                    assert.equal(dataObject['BookValuePerShare'], '0.20636767463008968')
                    assert.equal(dataObject['ReturnOnInvestment'], '0.08310500274977027')
                    assert.equal(dataObject['ReturnOnAssets'], '0.14394679777232078')
                    assert.equal(dataObject['ReturnOnTangibleEquity'], '-0.13653332100262128')
                    assert.equal(dataObject['ReturnOnEquity'], '0.30853661006554933')
                    assert.equal(dataObject['DaysSalesInReceivables'], '0.06822439967886681')
                    assert.equal(dataObject['ReceivableTurnover'], '-0.062279427809027475')
                    assert.equal(dataObject['InventoryTurnoverRatio'], '0.544510972511194')
                    assert.equal(dataObject['AssetTurnover'], '-0.45513834465454295')
                    assert.equal(dataObject['NetProfitMargin'], '0.40359873845259175')
                    assert.equal(dataObject['PretaxProfitMargin'], '0.25008996951762913')
                    assert.equal(dataObject['EbitdaMargin'], '0.5850292794263835')
                    assert.equal(dataObject['EbitMargin'], '0.4203783552018233')
                    assert.equal(dataObject['OperatingMargin'], '0.4203783552018233')
                    assert.equal(dataObject['GrossMargin'], '0.8691543670724637')
                    assert.equal(dataObject['DebtToEquityRatio'], '0.481063939154269')
                    assert.equal(dataObject['LongtermDebtToCapital'], '0.6296369760275748')
                    assert.equal(dataObject['CurrentRatio'], '-0.11082765875349829')
                })
        })
    })

    describe('handleIndicatorArray test', function() {
        it("returns an array for the stock which contains indicator data for year 2019", function() {
            return csvHandler.readCSVFile(path.join(__dirname, 
                '../assets/localdata/Ratio/IBM Ratio Data From Macro.csv'),'utf-8').then(contents => {
                    array = csvHandler.handleFundamentalArray(csvHandler.processCSVData(contents), 2019)
                    testarray = []
                    testarray.push('2019-12-31')
                    testarray.push('1.0191')
                    testarray.push('0.7205')
                    testarray.push('2.9973')
                    testarray.push('47.2967')
                    testarray.push('12.8275')
                    testarray.push('12.8275')
                    testarray.push('20.6813')
                    testarray.push('13.1774')
                    testarray.push('12.2247')
                    testarray.push('0.5069')
                    testarray.push('25.113')
                    testarray.push('8.0336')
                    testarray.push('45.434')
                    testarray.push('44.965')
                    testarray.push('17.9807')
                    testarray.push('6.1997')
                    testarray.push('12.5654')
                    testarray.push('23.6555')
                    testarray.push('0.0963')
                    testarray.push('1.3791')
                    assert.deepEqual(array, testarray)
            })
        })
    })

    describe('handlePriceArray test', function() {
        it("returns an array containing JS objects with key-value pairs, date and price", function() {
            return csvHandler.readCSVFile(path.join(__dirname, 
                '../assets/localdata/Price/IBM Price Data.csv'),'utf-8').then(contents => {
                    array = csvHandler.handlePriceArray(csvHandler.processCSVData(contents), 2019)
                    assert.equal(array[0].date, '2019-01-02')
                    assert.equal(array[0].price, '101.94241333007812')
                    assert.equal(array[1].date, '2019-01-03')
                    assert.equal(array[1].price, '99.90727996826172')
            })
        })
    })

    describe('readCorrelationCSVFile test', function() {
        it("should readCSVFile -> processCSVData -> handleCorrelationArray then callBack without error", function(done) {
            csvHandler.readCorrelationCSVFile(path.join(__dirname, 
                '../assets/localdata/Correlation/IBM Correlation Coefficient Data.csv'), 'utf-8').then(done())
        })
    })

    describe('readIndicatorCSVFile test', function() {
        it("should readCSVFile -> processCSVData -> handleIndicatorArray then call callBack without error", function(done) {
            csvHandler.readIndicatorCSVFile(path.join(__dirname, 
                '../assets/localdata/Ratio/IBM Ratio Data From Macro.csv'), 'utf-8', null, 2019, done)
        })
    })

    describe('handlePriceCSVFile test', function () {
        it("should readCSVFile -> processCSVData -> handlePriceArray then call callBack without error", function(done) {
            csvHandler.readPriceCSVFile(path.join(__dirname, 
                '../assets/localdata/Price/IBM Price Data.csv'), 'utf-8', null, 2019, done)
        })
    })
 
    describe('toCamelCaps test', function() {
      it("should convert a string seperated by _ to CamelCaps", function() {
          assert.equal(csvHandler.toCamelCaps("to_camel_caps"), "ToCamelCaps")
      })  
    })
})

describe('httpHandler tests', function() {
    describe('getYear test', function() {
        it("should return the enumeration for the year", function() {
            assert.equal(httpHandler.getYear(2020), 0)
            assert.equal(httpHandler.getYear(2019), 1)
            assert.equal(httpHandler.getYear(2018), 2)
            assert.equal(httpHandler.getYear(2017), 3)
            assert.equal(httpHandler.getYear(2016), 4)
        })
    })

    describe('getBalanceData test', function() {
        it("should return an array containing balance data for year 2019", function() {
            return httpHandler.getBalanceData('IBM', 2019).spread((array, string) => {
                assert.equal(string, 'data')
                assert.equal(array[0], "2019-12-31")
                assert.equal(array[1], "USD")
                assert.equal(array[2], "152186000000")
                assert.equal(array[3], "38420000000")
                assert.equal(array[4], "8172000000")
                assert.equal(array[5], "8868000000")
                assert.equal(array[6], "1619000000")
                assert.equal(array[7], "23795000000")
                assert.equal(array[8], "112878000000")
                assert.equal(array[9], "10010000000")
                assert.equal(array[10], "22018000000")
                assert.equal(array[11], "73457000000")
                assert.equal(array[12], "15235000000")
                assert.equal(array[13], "58222000000")
                assert.equal(array[14], "184000000")
                assert.equal(array[15], "696000000")
                assert.equal(array[16], "3997000000")
                assert.equal(array[17], "321000000")
                assert.equal(array[18], "131202000000")
                assert.equal(array[19], "37701000000")
                assert.equal(array[20], "4896000000")
                assert.equal(array[21], "15877000000")
                assert.equal(array[22], "16319000000")
                assert.equal(array[23], "8797000000")
                assert.equal(array[24], "100877000000")
                assert.equal(array[25], "5259000000")
                assert.equal(array[26], "65953000000")
                assert.equal(array[27], "7522000000")
                assert.equal(array[28], "54102000000")
                assert.equal(array[29], "132187000000")
                assert.equal(array[30], "13406000000")
                assert.equal(array[31], "14526000000")
                assert.equal(array[32], "20841000000")
                assert.equal(array[33], "169413000000")
                assert.equal(array[34], "162954000000")
                assert.equal(array[35], "55895000000")
                assert.equal(array[36], "887110455")
            })
        })
    })

    describe('getIncomeData test', function() {
        it("should return an array containing income data for year 2019", function() {
            return httpHandler.getIncomeData('IBM', 2019).spread((array, string) => {
                assert.equal(string, 'idata')
                assert.equal(array[0], "2019-12-31")
                assert.equal(array[1], "USD")
                assert.equal(array[2], "36488000000")
                assert.equal(array[3], "77147000000")
                assert.equal(array[4], "40659000000")
                assert.equal(array[5], "591000000")
                assert.equal(array[6], "9004000000")
                assert.equal(array[7], "20604000000")
                assert.equal(array[8], "5989000000")
                assert.equal(array[9], "27484000000")
                assert.equal(array[10], "None")
                assert.equal(array[11], "-1344000000")
                assert.equal(array[12], "349000000")
                assert.equal(array[13], "1344000000")
                assert.equal(array[14], "None")
                assert.equal(array[15], "968000000")
                assert.equal(array[16], "4209000000")
                assert.equal(array[17], "1850000000")
                assert.equal(array[18], "10162000000")
                assert.equal(array[19], "731000000")
                assert.equal(array[20], "1344000000")
                assert.equal(array[21], "9435000000")
                assert.equal(array[22], "10324000000")
                assert.equal(array[23], "11506000000")
                assert.equal(array[24], "13356000000")
                assert.equal(array[25], "9431000000")
            })
        })
    })
})