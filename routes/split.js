const app = require('express').Router()
const sendSse = require('./sse.js').sendSse
const httpCode = require('http-status-codes').StatusCodes
const httpReason = require('http-status-codes').getReasonPhrase
const log = console.log.bind(console);
app.get('/', (req, res)=>{
    log(req.body)
})
app.post('/', (req, res)=>{
    log(req.body)

    res.sendStatus(httpCode.ACCEPTED)
})
module.exports = app