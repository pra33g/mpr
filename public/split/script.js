/*
    SSE INIT
*/
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

/*
    UPLOAD FILE
*/
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
let pages = NaN
let pdfname = ""
function successUpload(res){
    pages = res.pages
    pdfname = res.name
    log(pages, pdfname)
}
function showMessage(text){
    info.innerText = text
}
/**
 * SPLIT INFO
 * ---------------------ABBV---------------------
 * SP - Start Page
 * EP - End Page
 * ----------------ENFORCED RULES----------------
 * N can't exceed total number of pages
 * Initial Load:
 *  SP_1 is always 1
 *  EP_1 is max_pages
 * Creating new nodes (total N nodes)
 *  EP_N always >= SP_N
 *  EP_N is always max_pages in PDF
 *  SP_N is always equal to [EP_(N-1)]+1
 *  EP_N is governed by: SP_N <= EP_N <= max_pages - n where n is (distance from last node)
 *  Middle nodes' SP and EP values blank initially, but SP values calculated of Nth node if (N-1)th node's EP value available
 *  SP of middle nodes disabled always, and autofilled
 *  EP for any middle node can't be max_pages
 * Removing Nth node:
 * set EP_(N-1) = EP_N 
 *  
 */

function add(elemParent){
    // elem is the elem below which new node is added
    // get total elems in container
    log(elemParent)
    let totalNodes = document.getElementById('si-container').childElementCount
    let nextId = totalNodes + 1
    html = `
    <div class="si-node" id="si-node-${nextId}">
        <input type="number" disabled="true" value="" class="si-sp" id="si-sp-${nextId}">
        <input type="number" class="si-ep" id="si-ep-${nextId}">
        <button onclick="addSupervisor(this.parentElement)" class="si-add" id="si-add-${nextId}">+++</button>
        <button class="si-rem" id="si-rem-${nextId}">---</button>
        <br><br>
    </div>
    `
    elemParent.insertAdjacentHTML('afterend', html)
    //reset ids
    let allNodes = document.getElementsByClassName('si-node')
    for (let i = 1; i <= allNodes.length; i++){
        allNodes[i - 1].id = `si-node-${i}`
    }
}
// unsupervisedMode -> true -> number of partitions not limited
// unsupervisedMode -> false -> number of partitions are limited
let unsupervisedMode = true
function addSupervisor(elemParent){
    let totalNodes = document.getElementById('si-container').childElementCount
    // remove this line
    pages = 5
    // remove this line
    if (unsupervisedMode || totalNodes < pages){
        add(elemParent)
    }
}


// 
