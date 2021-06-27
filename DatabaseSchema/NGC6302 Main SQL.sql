--
-- Database: `Orbital`
--

-- --------------------------------------------------------
-- ###########################################################

-- Public

-- ###########################################################

-- MASTER DATA 

CREATE TABLE "public"."Master Data"
(
 Master     regnamespace NOT NULL,
 "Date"       date NOT NULL,
 Company    regclass NOT NULL,
 ScoreTable regclass NOT NULL,
 FAModel    regclass NOT NULL,
 CONSTRAINT "PK_all users" PRIMARY KEY ( Master ),
 CONSTRAINT FK_251 FOREIGN KEY ( ScoreTable ) REFERENCES "public".ScoreTable ( ScoreTable ),
 CONSTRAINT FK_277 FOREIGN KEY ( Company ) REFERENCES Financials.CompanyReg ( Company ),
 CONSTRAINT FK_280 FOREIGN KEY ( "Date" ) REFERENCES "public"."Date" ( "Date" ),
 CONSTRAINT FK_363 FOREIGN KEY ( FAModel ) REFERENCES "Machine Learning"."Fundamental Analysis Model" ( FAModel )
);

CREATE INDEX fkIdx_252 ON "public"."Master Data"
(
 ScoreTable
);

CREATE INDEX fkIdx_278 ON "public"."Master Data"
(
 Company
);

CREATE INDEX fkIdx_281 ON "public"."Master Data"
(
 "Date"
);

CREATE INDEX fkIdx_364 ON "public"."Master Data"
(
 FAModel
);

-- SCORE TABLE

CREATE TABLE "public".ScoreTable
(
 UserId     uuid NOT NULL,
 ScoreTable regclass NOT NULL,
 Score      integer NOT NULL,
 CONSTRAINT PK_scoretable PRIMARY KEY ( ScoreTable ),
 CONSTRAINT FK_239 FOREIGN KEY ( UserId, Score ) REFERENCES "private"."User" ( UserId, Score )
);

CREATE INDEX fkIdx_240 ON "public".ScoreTable
(
 UserId,
 Score
);

-- LAST LOGIN

CREATE TABLE "public"."Last Login"
(
 LastLogin date NOT NULL,
 UserInput json NOT NULL,
 "Date"      date NOT NULL,
 CONSTRAINT PK_OrderItem PRIMARY KEY ( LastLogin ),
 CONSTRAINT FK_OrderItem_OrderId_Order FOREIGN KEY ( UserInput ) REFERENCES "private".History ( UserInput ),
 CONSTRAINT FK_398 FOREIGN KEY ( "Date" ) REFERENCES "public"."Date" ( "Date" )
);

CREATE INDEX FK_OrderItem_OrderId_Order ON "public"."Last Login"
(
 UserInput
);

CREATE INDEX fkIdx_399 ON "public"."Last Login"
(
 "Date"
);

COMMENT ON TABLE "public"."Last Login" IS 'Information about
like Price, Quantity';

-- DATE 

CREATE TABLE "public"."Date"
(
 "Date"  date NOT NULL,
 Year  integer NOT NULL,
 Month integer NOT NULL,
 Day   integer NOT NULL,
 CONSTRAINT PK_date PRIMARY KEY ( "Date" )
);

-- COMPANY 
CREATE TABLE "public".Company
(
 CompanyID   integer NOT NULL GENERATED ALWAYS AS IDENTITY,
 Ticker      varchar(10) NOT NULL,
 IsDefunct   bit NOT NULL,
 CompanyName varchar(40) NOT NULL,
 CONSTRAINT PK_Supplier PRIMARY KEY ( CompanyID, Ticker, IsDefunct ),
 CONSTRAINT AK1_Supplier_CompanyName UNIQUE ( CompanyName )
);

COMMENT ON TABLE "public".Company IS 'Basic information 
about Supplier';
-- ###########################################################

-- PRIVATE 

-- ###########################################################
-- USER

CREATE TABLE "private"."User"
(
 UserId               uuid NOT NULL,
 Score                integer NOT NULL,
 UserName             varchar(50) NOT NULL,
 Password             varchar(20) NOT NULL,
 EmailAddress         varchar(254) NOT NULL,
 Name                 varchar(75) NOT NULL,
 Age                  integer NOT NULL,
 InstitutionalAccount boolean NOT NULL,
 CONSTRAINT PK_Customer PRIMARY KEY ( UserId, Score ),
 CONSTRAINT AK1_Customer_CustomerName UNIQUE ( UserName )
);

COMMENT ON TABLE "private"."User" IS 'Basic information 
about Customer';

-- SCORE DETERMINANT

CREATE TABLE "private"."Score Determinant"
(
 ScoreFluctuation int4range NOT NULL,
 ScoreTable       regclass NOT NULL,
 FAScore          decimal NOT NULL,
 CONSTRAINT PK_scoredeterminant PRIMARY KEY ( ScoreFluctuation ),
 CONSTRAINT FK_383 FOREIGN KEY ( FAScore ) REFERENCES Fundamental."Score Calculations" ( FAScore ),
 CONSTRAINT FK_401 FOREIGN KEY ( ScoreTable ) REFERENCES "public".ScoreTable ( ScoreTable )
);

CREATE INDEX fkIdx_384 ON "private"."Score Determinant"
(
 FAScore
);

CREATE INDEX fkIdx_402 ON "private"."Score Determinant"
(
 ScoreTable
);

-- HISTORY

CREATE TABLE "private".History
(
 UserInput        json NOT NULL,
 UserID           uuid NOT NULL,
 "Date"             date NOT NULL,
 LastLogin        date NOT NULL,
 Score            integer NOT NULL,
 FAScore          decimal NOT NULL,
 ScoreFluctuation int4range NOT NULL,
 CONSTRAINT PK_Order PRIMARY KEY ( UserInput ),
 CONSTRAINT FK_Order_CustomerId_Customer FOREIGN KEY ( UserID, Score ) REFERENCES "private"."User" ( UserId, Score ),
 CONSTRAINT FK_151 FOREIGN KEY ( "Date" ) REFERENCES "public"."Date" ( "Date" ),
 CONSTRAINT FK_388 FOREIGN KEY ( ScoreFluctuation ) REFERENCES "private"."Score Determinant" ( ScoreFluctuation ),
 CONSTRAINT FK_391 FOREIGN KEY ( FAScore ) REFERENCES Fundamental."Score Calculations" ( FAScore ),
 CONSTRAINT FK_395 FOREIGN KEY ( LastLogin ) REFERENCES "public"."Last Login" ( LastLogin )
);

CREATE INDEX FK_Order_CustomerId_Customer ON "private".History
(
 UserID,
 Score
);

CREATE INDEX fkIdx_152 ON "private".History
(
 "Date"
);

CREATE INDEX fkIdx_389 ON "private".History
(
 ScoreFluctuation
);

CREATE INDEX fkIdx_392 ON "private".History
(
 FAScore
);

CREATE INDEX fkIdx_396 ON "private".History
(
 LastLogin
);

COMMENT ON TABLE "private".History IS 'Order information
like Date, Amount';

-- ###########################################################

-- MACHINE LEARNING

-- ###########################################################

-- FUNDAMENTAL ANALYSIS MODEL

CREATE TABLE "Machine Learning"."Fundamental Analysis Model"
(
 FAModel       regclass NOT NULL,
 FinancialData jsonb NOT NULL,
 ModelID       uuid NOT NULL,
 ModelName     varchar(20) NOT NULL,
 ModelFormula  geometric NOT NULL,
 DataSpreads   jsonb NOT NULL,
 BacktestData  jsonb NOT NULL,
 CONSTRAINT PK_model PRIMARY KEY ( FAModel ),
 CONSTRAINT FK_378 FOREIGN KEY ( FinancialData ) REFERENCES Financials."Financial Data" ( FinancialData )
);

CREATE INDEX fkIdx_379 ON "Machine Learning"."Fundamental Analysis Model"
(
 FinancialData
);

-- ###########################################################

-- FUNDAMENTAL

-- ###########################################################

-- SCORE CALCULATIONS 

CREATE TABLE Fundamental."Score Calculations"
(
 FAScore    decimal NOT NULL,
 FAModel    regclass NOT NULL,
 ScoreTable regclass NOT NULL,
 UserInput  json NOT NULL,
 CONSTRAINT "PK_machine learning" PRIMARY KEY ( FAScore ),
 CONSTRAINT FK_195 FOREIGN KEY ( UserInput ) REFERENCES "private".History ( UserInput ),
 CONSTRAINT FK_206 FOREIGN KEY ( FAModel ) REFERENCES "Machine Learning"."Fundamental Analysis Model" ( FAModel ),
 CONSTRAINT FK_248 FOREIGN KEY ( ScoreTable ) REFERENCES "public".ScoreTable ( ScoreTable )
);

CREATE INDEX fkIdx_196 ON Fundamental."Score Calculations"
(
 UserInput
);

CREATE INDEX fkIdx_207 ON Fundamental."Score Calculations"
(
 FAModel
);

CREATE INDEX fkIdx_249 ON Fundamental."Score Calculations"
(
 ScoreTable
);

-- FUNDAMENTAL INDICATORS 

CREATE TABLE Fundamental."Fundamental Indicators"
(
 "Fundamental Indicators"    regdictionary NOT NULL,
 "Date"                      date NOT NULL,
 Cashflow                  regdictionary NOT NULL,
 Company                   regclass NOT NULL,
 IncomeStatement           regdictionary NOT NULL,
 "Balance Sheet"             regdictionary NOT NULL,
 LongTermDebtToCapital     decimal NOT NULL,
 DebtToEquityRatio         decimal NOT NULL,
 GrossMargin               decimal NOT NULL,
 EbitMargin                decimal NOT NULL,
 OperatingMargin           decimal NOT NULL,
 EbitdaMargin              decimal NOT NULL,
 NetProfitMargin           decimal NOT NULL,
 ReceiveableTurnover       decimal NOT NULL,
 InventoryTurnoverRatio    decimal NOT NULL,
 AssetTurnover             decimal NOT NULL,
 FreeCashFlowPerShare      decimal NOT NULL,
 ReturnOnAssets            decimal NOT NULL,
 ReturnOnInvestment        decimal NOT NULL,
 DaysSalesInReceivables    decimal NOT NULL,
 BookValuePerShare         decimal NOT NULL,
 ReturnOnEquity            decimal NOT NULL,
 CurrentRatio              decimal NOT NULL,
 ReturnOnTangibleEquity    decimal NOT NULL,
 OperatingCashFlowPerShare decimal NOT NULL,
 PretaxProfitMargin        decimal NOT NULL,
 CONSTRAINT "PK_fundamental indicators" PRIMARY KEY ( "Fundamental Indicators", "Date", Cashflow, Company, IncomeStatement, "Balance Sheet" ),
 CONSTRAINT FK_514 FOREIGN KEY ( Cashflow, Company, "Date" ) REFERENCES Financials.CashFlow ( Cashflow, Company, "Date" ),
 CONSTRAINT FK_519 FOREIGN KEY ( IncomeStatement, "Date", Company ) REFERENCES Financials."Income Statement" ( IncomeStatement, "Date", Company ),
 CONSTRAINT FK_522 FOREIGN KEY ( "Balance Sheet", Company, "Date" ) REFERENCES Financials."Balance Sheet" ( "Balance Sheet", Company, "Date" )
);

CREATE INDEX fkIdx_515 ON Fundamental."Fundamental Indicators"
(
 Cashflow,
 Company,
 "Date"
);

CREATE INDEX fkIdx_520 ON Fundamental."Fundamental Indicators"
(
 Company,
 "Date",
 IncomeStatement
);

CREATE INDEX fkIdx_523 ON Fundamental."Fundamental Indicators"
(
 Company,
 "Date",
 "Balance Sheet"
);

-- INCOME STATEMENT 

CREATE TABLE Financials."Income Statement"
(
 IncomeStatement                regdictionary NOT NULL,
 Company                        regclass NOT NULL,
 TotalRevenue                   bigint NOT NULL,
 CostOfRevenue                  bigint NOT NULL,
 GrossProfit                    bigint NOT NULL,
 OperatingIncomeOrLoss          bigint NOT NULL,
 InterestExpense                bigint NOT NULL,
 TotalOtherIncome/ExpensesNet   bigint NOT NULL,
 IncomeBeforeTax                bigint NOT NULL,
 IncomeTaxExpense               bigint NOT NULL,
 IncomeFromContinuingOperations bigint NOT NULL,
 NetIncome                      bigint NOT NULL,
 BasicEPS                       int NOT NULL,
 DilutedEPS                     int NOT NULL,
 BasicAverageShares             int NOT NULL,
 DilutedAverageShares           int NOT NULL,
 EBITDA                         bigint NOT NULL,
 "Date"                           date NOT NULL,
 CONSTRAINT PK_cashflow PRIMARY KEY ( IncomeStatement, "Date", Company ),
 CONSTRAINT FK_292 FOREIGN KEY ( Company ) REFERENCES Financials.CompanyReg ( Company ),
 CONSTRAINT FK_316 FOREIGN KEY ( "Date" ) REFERENCES "public"."Date" ( "Date" )
);

CREATE INDEX fkIdx_293 ON Financials."Income Statement"
(
 Company
);

CREATE INDEX fkIdx_317 ON Financials."Income Statement"
(
 "Date"
);

-- FINANCIAL DATA 

CREATE TABLE Financials."Financial Data"
(
 FinancialData          jsonb NOT NULL,
 "Date"                   date NOT NULL,
 Company                regclass NOT NULL,
 Cashflow               regdictionary NOT NULL,
 "Balance Sheet"          regdictionary NOT NULL,
 IncomeStatement        regdictionary NOT NULL,
 "Fundamental Indicators" regdictionary NOT NULL,
 CONSTRAINT PK_Product PRIMARY KEY ( FinancialData ),
 CONSTRAINT FK_190 FOREIGN KEY ( "Date" ) REFERENCES "public"."Date" ( "Date" ),
 CONSTRAINT FK_336 FOREIGN KEY ( IncomeStatement, "Date", Company ) REFERENCES Financials."Income Statement" ( IncomeStatement, "Date", Company ),
 CONSTRAINT FK_339 FOREIGN KEY ( "Balance Sheet", Company, "Date" ) REFERENCES Financials."Balance Sheet" ( "Balance Sheet", Company, "Date" ),
 CONSTRAINT FK_345 FOREIGN KEY ( Cashflow, Company, "Date" ) REFERENCES Financials.CashFlow ( Cashflow, Company, "Date" ),
 CONSTRAINT FK_473 FOREIGN KEY ( "Fundamental Indicators", "Date", Cashflow, Company, IncomeStatement, "Balance Sheet" ) REFERENCES Fundamental."Fundamental Indicators" ( "Fundamental Indicators", "Date", Cashflow, Company, IncomeStatement, "Balance Sheet" )
);

CREATE INDEX fkIdx_191 ON Financials."Financial Data"
(
 "Date"
);

CREATE INDEX fkIdx_337 ON Financials."Financial Data"
(
 "Date",
 Company,
 IncomeStatement
);

CREATE INDEX fkIdx_340 ON Financials."Financial Data"
(
 "Date",
 Company,
 "Balance Sheet"
);

CREATE INDEX fkIdx_346 ON Financials."Financial Data"
(
 "Date",
 Company,
 Cashflow
);

CREATE INDEX fkIdx_475 ON Financials."Financial Data"
(
 "Date",
 Company,
 IncomeStatement,
 "Balance Sheet",
 Cashflow,
 "Fundamental Indicators"
);

COMMENT ON TABLE Financials."Financial Data" IS 'Basic information 
about Product';

-- COMPANY REG

CREATE TABLE Financials.CompanyReg
(
 CompanyID integer NOT NULL,
 Company   regclass NOT NULL,
 Ticker    varchar(10) NOT NULL,
 IsDefunct bit NOT NULL,
 CONSTRAINT PK_companyreg PRIMARY KEY ( Company ),
 CONSTRAINT FK_266 FOREIGN KEY ( CompanyID, Ticker, IsDefunct ) REFERENCES "public".Company ( CompanyID, Ticker, IsDefunct )
);

CREATE INDEX fkIdx_267 ON Financials.CompanyReg
(
 CompanyID,
 Ticker,
 IsDefunct
);

-- CASH FLOW 

CREATE TABLE Financials.CashFlow
(
 Cashflow                         regdictionary NOT NULL,
 Company                          regclass NOT NULL,
 "Date"                             date NOT NULL,
 CashFlowsFromOperatingActivities bigint NOT NULL,
 CashFlowsFromInvestingActivites  bigint NOT NULL,
 CashFlowsFromFinancingActivities bigint NOT NULL,
 NetChangeInCash                  bigint NOT NULL,
 CashAtBeginningOfPPeriod         bigint NOT NULL,
 CashAtEndOfPeriod                bigint NOT NULL,
 FreeCashFlow                     bigint NOT NULL,
 CONSTRAINT PK_income PRIMARY KEY ( Cashflow, Company, "Date" ),
 CONSTRAINT FK_295 FOREIGN KEY ( Company ) REFERENCES Financials.CompanyReg ( Company ),
 CONSTRAINT FK_329 FOREIGN KEY ( "Date" ) REFERENCES "public"."Date" ( "Date" )
);

CREATE INDEX fkIdx_296 ON Financials.CashFlow
(
 Company
);

CREATE INDEX fkIdx_330 ON Financials.CashFlow
(
 "Date"
);

-- BALANCE SHEET 

CREATE TABLE Financials."Balance Sheet"
(
 "Balance Sheet"                         regdictionary NOT NULL,
 Company                               regclass NOT NULL,
 "Date"                                  date NOT NULL,
 Assets                                bigint NOT NULL,
 CurrentDebt                           bigint NOT NULL,
 AccountsPayable                       bigint NOT NULL,
 CommonStock                           bigint NOT NULL,
 RetainedEarnings                      bigint NOT NULL,
 AccumulatedOtherComprehensiveIncome   bigint NOT NULL,
 TotalStockholdersEquity               bigint NOT NULL,
 TotalLiabilitiesAndStockholdersEquity bigint NOT NULL,
 AccruedLiabilities                    bigint NOT NULL,
 DeferredRevenues                      bigint NOT NULL,
 OtherCurrentLiabilities               bigint NOT NULL,
 TotalCurrentLiabilities               bigint NOT NULL,
 Long-termDebt                         bigint NOT NULL,
 DeferredTaxLiabilities                bigint NOT NULL,
 OtherLong-termLiabilities             bigint NOT NULL,
 CONSTRAINT "PK_balance sheet" PRIMARY KEY ( "Balance Sheet", Company, "Date" ),
 CONSTRAINT FK_298 FOREIGN KEY ( Company ) REFERENCES Financials.CompanyReg ( Company ),
 CONSTRAINT FK_319 FOREIGN KEY ( "Date" ) REFERENCES "public"."Date" ( "Date" )
);

CREATE INDEX fkIdx_299 ON Financials."Balance Sheet"
(
 Company
);

CREATE INDEX fkIdx_320 ON Financials."Balance Sheet"
(
 "Date"
);




--
-- Table structure for table `user_details`
--

CREATE TABLE IF NOT EXISTS `user_details` (
  `user_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) DEFAULT NULL,
  `first_name` varchar(50) DEFAULT NULL,
  `last_name` varchar(50) DEFAULT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `password` varchar(50) DEFAULT NULL,
  `status` tinyint(10) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=10001 ;


