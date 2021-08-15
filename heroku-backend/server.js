const express = require('express')
const database = require('./database.js')

const PORT = process.env.PORT || 3000

database.connectToDatabase()

const server = express()
server
    .use(express.json())
    .get('/users/:userId', (request, response) => {
        database.getUserInfoQuery(request.params.userId).then(res => {
            response.json(res.rows)
        }).catch(e => console.error(e.stack))
        express.json(request.params.userId)
    })
    .post('/users/:userId/names/:name', (request, response) => {
        database.insertUserInfoQuery(request.params.userId, request.params.name).then(res => {
            response.json(
                {
                    "userId": `${request.params.userId}`,
                    "name": `${request.params.name}`
                }
            )
        }).catch(e => {
            console.error(e.stack)
            response.status(400).json({error: 'Failed to POST resource'})
        })
    })
    .get('/training-histories/users/:userId', (request, response) => {
        database.getTrainingHistoryQuery(request.params.userId).then(res => {
            response.json(res.rows)
        }).catch(e => console.error(e.stack))
    })
    .post('/training-histories/users/:userId/sessions/:sessionId', (request, response) => {
        database.insertTrainingHistoryQuery(request.params.userId, request.params.sessionId).then(res => {
            response.json(res.rows)
        }).catch(e => {
            console.error(e.stack)
            response.status(400).json({error: 'Failed to POST resource'})
        })
    })
    .get('/session-histories/users/:userId', (request, response) => {
        database.getTrainingHistoryQuery2(request.params.userId).then(res => {
            response.json(res.rows)
        }).catch(e => console.error(e.stack))
    })
    .get('/sessions/:sessionId', (request, response) => {
        database.getSessionInfoQuery(request.params.sessionId).then(res => {
            response.json(res.rows)
        }).catch(e => console.error(e.stack))
    })
    .post('/sessions/:sessionId', (request, response) => {
        database.insertSessionInfoQuery(
            request.body.sessionId,
            request.body.userId,
            request.body.date,
            request.body.time,
            request.body.stockTicker,
            request.body.indicator1,
            request.body.indicator2,
            request.body.indicator3,
            request.body.indicator1Value,
            request.body.indicator2Value,
            request.body.indicator3Value,
            request.body.indicator1EvalValue,
            request.body.indicator2EvalValue,
            request.body.indicator3EvalValue,
            request.body.sentimentAnalysisValue,
            request.body.sentimentAnalysisEvalValue).then(() => {
                response.json(request.body)
            }).catch(e => {
                console.error(e.stack)
                response.status(400).json({error: 'Failed to POST resource'})
            })
    })
    .listen(PORT, () => console.log(`Listening on ${PORT}`))