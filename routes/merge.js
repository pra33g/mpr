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
    sse.sendSse({"message":"merging-files"})
    //merge files
    let code = mergeFiles(req.body['filenames'])
    if (code == true){
        sse.sendSse({"message":"merging-completed"})
        res.json(httpObject(httpCode.CREATED))
    } else {
        res.json(httpObject(httpCode.INTERNAL_SERVER_ERROR))
    }
})

function mergeFiles(filenames){
    if (process.platform == 'win32'){
        log('windows')
        let command = `merge.bat ${filenames.join(" ")}`
        log(command)
        require('child_process').execSync(
            command,
            {
                cwd: __dirname,
                stdio: 'inherit'
            }
        )
        return true;
    } else {
        log('other/linux')
        return false;
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