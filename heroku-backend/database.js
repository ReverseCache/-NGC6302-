const { Pool } = require('pg')

// Handle database connections
//Create PostgreSQL connection client
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

//Connect to DB with the client
function openConnection() {
    pool.connect()
    console.log("Database connection opened")
}

//Close Connection to the DB
function closeConnection() {
    pool.end()
    console.log("Database connection closed")
}

//Connect to DB with the client and set the database search path
function connectToDatabase() {
    openConnection()
    setSearchPathQuery().then(() => {
        console.log("Database connected and configured")
    })
}

//Set DB search_path to the custom schema created
function setSearchPathQuery() {
    return pool
        .query(`SET search_path = app_data_schema, public;`)
        .then(
            console.log("QUERY: SET search_path = app_data_schema, public;")
        )
        .catch(e => console.error(e.stack))
}

//Get user information with userId as key
function getUserInfoQuery(userId) {
    return pool
        .query(`SELECT * FROM user_info WHERE user_id=${userId} LIMIT 1;`)
        .then(res => {
            console.log("Query: SELECT * FROM user_info WHERE user_id=${userId} LIMIT 1;")
            for (let row of res.rows) {
                console.log(JSON.stringify(row))
            }
            return new Promise((resolve, reject) => {
                resolve(res)
            })
        })
        .catch(e => console.error(e.stack))
}

//Insert user information into user_info table
function insertUserInfoQuery(userId, name) {
    return pool
        .query(`INSERT INTO user_info(user_id, name) VALUES (${userId}, '${name}');`)
        .then(res => {
            console.log("Query: INSERT INTO user_info(user_id, name) VALUES (${userId}, '${name}');")
            for (let row of res.rows) {
                console.log(JSON.stringify(row))
            }
        })
        .catch(e => {
            console.error(e.stack)
            throw e
        })
}

//Get training history with userId as key
function getTrainingHistoryQuery(userId) {
    return pool
        .query(`SELECT * FROM training_history WHERE user_id=${userId} LIMIT 1;`)
        .then(res => {
            console.log("Query: SELECT * FROM training_history WHERE user_id=${userId} LIMIT 1;")
            for (let row of res.rows) {
                console.log(JSON.stringify(row))
            }
            return new Promise((resolve, reject) => {
                resolve(res)
            })
        })
        .catch(e => {console.error(e.stack)})
}

//Get training history but from the session_info table
function getTrainingHistoryQuery2(userId) {
    return pool
        .query(`SELECT * FROM session_info WHERE user_id=${userId} ORDER BY date DESC`)
        .then(res => {
            console.log("QUERY: SELECT * FROM session_info WHERE user_id=${userId} ORDER BY date DESC")
            for (let row of res.rows) {
                console.log(JSON.stringify(row))
            }
            return new Promise((resolve, reject) => {
                resolve(res)
            })
        })
        .catch(e => {console.error(e.stack)})
}

//Insert session history into session history table
function insertTrainingHistoryQuery(userId, sessionId) {
    return pool
        .query(`UPDATE training_history SET session_history=array_append(session_history, ${sessionId}) WHERE user_id=${userId};`
            + `INSERT INTO training_history(user_id, session_history) VALUES(${userId}, '{${sessionId}}');`)
        .then(res => {
            console.log("UPDATE training_history SET session_history=array_append(session_history, ${sessionId}) WHERE user_id=${userId};"
                + "INSERT INTO training_history(user_id, session_history) VALUES(${userId}, '{${sessionId}');")
            for (let row of res.rows) {
                console.log(JSON.stringify(row))
            }
        })
        .catch(e => {
            console.error(e.stack)
            throw e
        })
}

//Get session information with sessionId as key
function getSessionInfoQuery(sessionId) {
    return pool
        .query(`SELECT * from session_info WHERE session_id=${sessionId} LIMIT 1;`)
        .then(res => {
            console.log("SELECT * from session_info WHERE session_id=${sessionId} LIMIT 1;")
            for (let row of res.rows) {
                console.log(JSON.stringify(row))
            }
            return new Promise((resolve, reject) => {
                resolve(res)
            })
        })
        .catch(e => console.error(e.stack))
}

//Insert session information into session_info table
function insertSessionInfoQuery(
    sessionId,
    userId,
    date,
    time,
    stockTicker,
    indicator1, 
    indicator2, 
    indicator3, 
    indicator1Value, 
    indicator2Value, 
    indicator3Value,
    indicator1EvalValue,
    indicator2EvalValue,
    indicator3EvalValue,
    sentimentAnalysisValue,
    sentimentAnalysisEvalValue) {
        return pool
            .query(`INSERT INTO session_info(session_id, user_id, date, time, stock_ticker, indicator1, indicator2, indicator3, indicator1_value, indicator2_value, indicator3_value, indicator1_eval_value, indicator2_eval_value, indicator3_eval_value, sentiment_analysis_value, sentiment_analysis_eval_value)` +
                `VALUES ('${sessionId}', '${userId}', '${date}', '${time}', '${stockTicker}', '${indicator1}', '${indicator2}', '${indicator3}', '${indicator1Value}', '${indicator2Value}', '${indicator3Value}', '${indicator1EvalValue}', '${indicator2EvalValue}', '${indicator3EvalValue}', '${sentimentAnalysisValue}', '${sentimentAnalysisEvalValue}');`)
            .then(res => {
                console.log("INSERT INTO session_info(session_id, user_id, date, time, indicator1, indicator2, indicator3, indicator1_value, indicator2_value, indicator3_value, indicator1_eval_value, indicator2_eval_value, indicator3_eval_value, sentiment_analysis_value, sentiment_analysis_eval_value)"
                + "VALUES (${sessionId}, ${userId}, '${date}', ${time}, '${stockTicker}', '${indicator1}', '${indicator2}', '${indicator3}', '${indicator1Value}', '${indicator2Value}', '${indicator3Value}', '${indicator1EvalValue}', '${indicator2EvalValue}', '${indicator3EvalValue}', '${sentimentAnalysisValue}', '${sentimentAnalysisEvalValue}');")
                for (let row of res.rows) {
                    console.log(JSON.stringify(row))
                }
            })
            .catch(e => {
                console.error(e.stack)
                throw e
            })
    }

//Make a test query
function sampleQuery() {
    client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
        if (err) throw err
        for (let row of res.rows) {
          console.log(JSON.stringify(row))
        }
    })
}

module.exports.openConnection = openConnection
module.exports.closeConnection = closeConnection
module.exports.connectToDatabase = connectToDatabase
module.exports.getUserInfoQuery = getUserInfoQuery
module.exports.insertUserInfoQuery = insertUserInfoQuery
module.exports.getTrainingHistoryQuery = getTrainingHistoryQuery
module.exports.getTrainingHistoryQuery2 = getTrainingHistoryQuery2
module.exports.insertTrainingHistoryQuery = insertTrainingHistoryQuery
module.exports.getSessionInfoQuery = getSessionInfoQuery
module.exports.insertSessionInfoQuery = insertSessionInfoQuery