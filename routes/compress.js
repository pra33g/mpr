const { route } = require('./upload.js');

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
    let compression = data.compression
    let strippedName = fname.slice(0, -4)
    let new_name = `${strippedName}-compressed.pdf` //name of new file to be generated
    if (process.platform == 'win32'){
        let command = `gs_create_shortcut.bat` //this script creates a shortcut to gs in current dir
        log(command)
        let run = require('child_process').execSync(
            command,
            {
                cwd: __dirname,
                stdio: 'inherit'
            }
        )
    }
    if (compressFile(fname, new_name, compression)){
        let js = {'message':'compressed-file' ,'name':new_name}
        sendSse(js)
    }

    return httpCode.ACCEPTED
    
}

function compressFile(input_fname, output_fname, compression){
    ratio = 50
    if (compression == 'min'){
        ratio = 300
    }
    if (compression == 'min'){
        ratio = 72
    }



    if (process.platform == 'win32'){
        log('windows')
        let command = `compress.bat ${input_fname} ${output_fname} ${ratio}`
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
        let command = `./compress.sh  ${input_fname} ${output_fname} ${ratio}`
        log(command)
        let run = require('child_process').execSync(
            command,
            {
                cwd: __dirname,
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