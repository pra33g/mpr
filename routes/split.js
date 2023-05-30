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
    if (data.name === ''){
        sendSse({'message':'filename not supplied'})
        return httpCode.BAD_REQUEST
    }
    let fname = data.name
    let strippedName = fname.slice(0, -4)
    let totalParts = data.split_info.length
    log('totalparts',totalParts)
    let partNames = []
    for (let i = 1; i <= totalParts; i++){
        let pname = `${strippedName}-part-${i}.pdf`
        partNames.push(pname)
    }
    for (let i = 0; i < totalParts; i++){
        sp = data.split_info[i].sp
        ep = data.split_info[i].ep
        log(sp, ep, partNames[i])
        splitFile(sp, ep, fname, partNames[i])
    }
    let js = JSON.stringify({'message':'created-parts' ,'partnames':partNames})
    sendSse(js)

    return httpCode.ACCEPTED
    
}
function splitFile(sp, ep, input_fname, output_fname){
    if (process.platform == 'win32'){
        log('windows')
        let command = `split.bat `
        log(command)
        let run = require('child_process').execSync(
            command,
            {
                cwd: __dirname,
                stdio: 'inherit'
            }
        )
        return true;
    } else if (process.platform == 'linux') {
        log('other/linux')
        let command = `./split.sh ${sp} ${ep} ${input_fname} ${output_fname}`
        log(command)
        let run = require('child_process').execSync(
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