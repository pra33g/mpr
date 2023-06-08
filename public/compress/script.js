// <!-- upload file -->
// <!-- run compress script on server -->
// <!-- download -->

// hide download panel
hideDownloadPanel()

/*
    SSE INIT
*/
const source = new EventSource('/sse')
source.addEventListener('message', message => {
    let got = (JSON.parse(message.data))
    log("Got:", got.message)
    showMessage(got.message)
    if (got.message == "saved-file"){
        // document.getElementById('upload-phase').classList.add('hidden')
        log('HIDE UPLOAD FORM and remove this message')
    } 
    if(got.message == "compressed-file"){
        // displayMessage.innerText = "Server is processing file, please wait.";
        log(got.name)

        showMessage('Compressed file. Downloading')
        downloadFile(got.name)
    }
    if(got.message == "pages"){
        // displayMessage.innerText = `Pages: ${pages}`;
        log('pages')
    }
    if(got.message == "Format unacceptable"){
        // displayMessage.innerText = `Format unacceptable`;
        showMessage(`Format unacceptable`)
    }
})

/*
    UPLOAD FILE
*/
const info = document.getElementById('info')
let log = console.log.bind(console)
let sb = document.getElementById('submit_button')
let suf = document.getElementById('compress-upload-form')
let sendBtn = document.getElementById('send-split-data')
suf.addEventListener('submit', e => {
    e.preventDefault()
    let xhr = new XMLHttpRequest()
    xhr.upload.addEventListener('progress',function (event){
        showMessage(`${Number(event.total/ event.loaded * 100).toFixed(0)}%`)
    })
    xhr.open("POST", "/upload")
    xhr.responseType = 'json'
    xhr.send(new FormData(suf))
    xhr.onreadystatechange = () => {
        if(xhr.readyState == XMLHttpRequest.DONE){
            log(xhr.response)
            if (xhr.response.http == 201){
                successUpload(xhr.response);
            } else {
                showMessage(xhr.response.reason)
            }
        }
    }
})
let pages = NaN
let size = 0
//
pages = 5
//
let pdfname = ""
function successUpload(res){
    pages = res.pages
    pdfname = res.name
    size = reportSize(res.size)
    log(pages, pdfname)
    showMessage(`PDF with ${pages} pages and size ${size} uploaded.`)
    hideUploadPanel()
    showDownloadPanel()

}
function reportSize(bytes){
    kb = (bytes / 1024).toFixed(1)
    mb = (kb / 1024).toFixed(1)
    if (kb > 1000){
        return `${mb} MB`
    }
    if (bytes > 1000){
        return (`${kb} KB`)
    }
    else {
        return `${bytes} B`
    }
}
function showMessage(text){
    info.innerText = text
}
function hideUploadPanel(){
    let up = document.getElementById('upload-phase').classList.add('hidden')
}
function showUploadPanel(){
    document.getElementById('upload-phase').classList.remove('hidden')
}
function hideDownloadPanel(){
    document.getElementById('download-phase').classList.add('hidden')
}
function showDownloadPanel(){
    document.getElementById('download-phase').classList.remove('hidden')
}
function resetPage(){
    suf.reset();
    window.location.reload()
}

function downloadFile(f){
    fetch(`/download?name=${f}`)
    .then(res => res.blob())
    .then(data => {
        let a =  document.createElement('a')
        a.href = window.URL.createObjectURL(data);
        a.download = f;
        a.click(); 
        a.remove()
    })
}

/**
 * send split data
*/
function sendData(){
        showMessage('Server is processing file...')
        let data = {}
        data.name = pdfname
        data.size = size
        // data.compression = 
        let compression_opt = document.getElementById('compress-ratio').value
        data.compression = compression_opt
        console.log(data)
        fetch('/compress', {
            method:'POST',
            body:JSON.stringify(data),
            headers:{
                "Content-type": "application/json; charset=UTF-8",
            }
        })
        .then(response=>{
            return response
        })
        .then(response=>console.log(response.text))
}  
