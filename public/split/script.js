const source = new EventSource('/sse')
source.addEventListener('message', message => {
    let got = JSON.parse(message.data)
    log("Got:", got)
    if (got.message == "saved-file"){
        // document.getElementById('upload-phase').classList.add('hidden')
        log('HIDE UPLOAD FORM and remove this message')
    } 
    if(got.message == "processing-file"){
        // displayMessage.innerText = "Server is processing file, please wait.";
        
    }
    if(got.message == "pages"){
        // displayMessage.innerText = `Pages: ${pages}`;
        log('pages')
    }
    if(got.message == "Format unacceptable"){
        // displayMessage.innerText = `Format unacceptable`;

    }
})
const info = document.getElementById('info')
let log = console.log.bind(console)
let sb = document.getElementById('submit_button')
let suf = document.getElementById('split-upload-form')
suf.addEventListener('submit', e => {
    e.preventDefault()
    let xhr = new XMLHttpRequest()
    xhr.upload.addEventListener('progress',function (event){
        log(event.total, event.loaded)
    })
    xhr.open("POST", "/upload")
    xhr.responseType = 'json'
    xhr.send(new FormData(suf))
    xhr.onreadystatechange = () => {
        if(xhr.readyState == XMLHttpRequest.DONE){
            log(xhr.response)
            successUpload(xhr.response);
        }
    }
})

function successUpload(res){
    let pages = res.pages
    let name = res.name
    log(pages, name)
}