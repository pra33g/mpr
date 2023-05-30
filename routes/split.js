const app = require('express').Router()
const sendSse = require('./sse.js').sendSse
const httpCode = require('http-status-codes').StatusCodes
const httpReason = require('http-status-codes').getReasonPhrase
const log = console.log.bind(console);
app.get('/', (req, res)=>{
    log(req.body)
})
app.post('/', (req, res)=>{
    let code = Number(handleData(req.body))
    res.sendStatus(code)
})

function handleData(data){
    log(data.name, "HI")
    if (data.name === ''){
        sendSse({'message':'filename not supplied'})
        return httpCode.BAD_REQUEST
    }
    let totalParts = data.split_info.length
    log(totalParts)
    for (let d of data.split_info){
        log(d.sp, d.ep)
    }
    return httpCode.ACCEPTED
    
}
function splitFile(sp, ep, filename){
    if (process.platform == 'win32'){
        log('windows')
        let command = `split.bat `
        log(command)
        require('child_process').execSync(
            command,
            {
                cwd: __dirname,
                stdio: 'inherit'
            }
        )
        return true;
    } else if (process.platform == 'linux') {
        log('other/linux')
        let command = `./split.sh ${sp} ${ep}`
        require('child_process').execSync(
            command,
            {
                cwd: __dirname+"/upload/",
                stdio: 'inherit'
            }
        )        
        return true;
    } else {
        sse.sendSse('Unsupported server OS')
        return false
    }
}
module.exports = app