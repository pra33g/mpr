const express = require('express')
const sse = require('./sse.js')
const router = express.Router()
const httpCode = require('http-status-codes').StatusCodes
const log = console.log.bind(console)
const httpReason = require('http-status-codes').getReasonPhrase

router.use(express.json())
router.use(express.urlencoded())

router.get("/", (req, res) => {});

router.post("/", (req, res) => {
    // sse.sendSse({"message":"merging-files"})
    log(req.body)
    //merge files
    res.json(httpObject(httpCode.CREATED))
})

function mergeFiles(filenames){
    if (process.platform == 'win32'){
        log('windows')
        // let command = `merge.bat ${...filenames}`
        // require('child_process').execSync(
        //     command
        // )
    } else {
        log('other/linux')
    }
}

function httpObject(code, additionalProp){
    let ret = {"http":code};
    ret["reason"] = httpReason(code);
    for(const prop in additionalProp){
        ret[prop] = additionalProp[prop];
    }
    return ret;
}
module.exports = router