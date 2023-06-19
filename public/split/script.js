
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
    if(got.message == "created-parts"){
        // displayMessage.innerText = "Server is processing file, please wait.";
        log(got.partnames)
        showMessage('Created parts. Downloading')
        downloadParts(got.partnames)
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
let suf = document.getElementById('split-upload-form')
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
//
pages = 5
//
let pdfname = ""
function successUpload(res){
    pages = res.pages
    pdfname = res.name
    log(pages, pdfname)
    showMessage(`PDF with ${pages} pages uploaded.`)
    totalNodes = document.getElementById('si-container').childElementCount
    sendBtn.innerText = `Click to split ${pdfname} into ${totalNodes} part(s)`
    hideUploadPanel()
    showSplitInfoPanel()

}
function hideSplitInfoPanel(){
    document.getElementById('split-info-dl-phase').classList.add('hidden')
}
function showSplitInfoPanel(){
    document.getElementById('split-info-dl-phase').classList.remove('hidden')
}
function hideUploadPanel(){
    let up = document.getElementById('upload-phase')
    let cl = up.classList
    let rm = cl.add('hidden')
    log(cl, rm)
}
function showUploadPanel(){
    document.getElementById('upload-phase').classList.remove('hidden')
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
    let totalNodes = document.getElementById('si-container').childElementCount
    let nextId = totalNodes + 1
    html = `
    <div class="si-node" id="si-node-${nextId}">
        <input onblur="inputSupervisor_sp(this)" type="number" disabled="true" value="" class="si-sp" id="si-sp-${nextId}">
        <input onblur="inputSupervisor(this)" type="number" class="si-ep" id="si-ep-${nextId}">
        <button onclick="addSupervisor(this.parentElement, this)" class="si-add" id="si-add-${nextId}">Add</button>
        <button onclick="removeNode(this)" class="si-rem" id="si-rem-${nextId}">Del</button>
        <br><br>
    </div>
    `
    elemParent.insertAdjacentHTML('afterend', html)
    //reset ids
    let allNodes = document.getElementsByClassName('si-node')
    for (let i = 1; i <= allNodes.length; i++){
        allNodes[i - 1].id = `si-node-${i}`
        let node = document.getElementById(`si-node-${i}`)
        node.getElementsByClassName('si-ep')[0].id = `si-ep-${i}`
        node.getElementsByClassName('si-sp')[0].id = `si-sp-${i}`
        node.getElementsByClassName('si-add')[0].id = `si-add-${i}`
        node.getElementsByClassName('si-rem')[0].id = `si-rem-${i}`
    }
    setSP()
    sendBtn.innerText = `Split ${pdfname} into ${allNodes.length} part(s)`

}
// unsupervisedMode -> true -> number of partitions not limited
// unsupervisedMode -> false -> number of partitions are limited
let checked = document.getElementById('mode-selector').checked
let unsupervisedMode = !checked
setSP()
function addSupervisor(elemParent, elem){
    let ep_val = elemParent.getElementsByClassName('si-ep')[0].value
    if(ep_val.length == 0){
        ep_val = 1
    }
    log(ep_val)
    let totalNodes = document.getElementById('si-container').childElementCount
    if (unsupervisedMode || ep_val < pages && totalNodes < pages){
        add(elemParent)
        //get current node's ep value
    } 
    if (totalNodes == pages || ep_val >= pages){
        showMessage(`Number of partitions can not exceed total page count ${pages}`)
    }
    // get current nodes ep value
    // if ep value exceeds pages
    calcSP(elemParent.getElementsByClassName(`si-ep`)[0])
    // inputSupervisor(elem)
}
function inputSupervisor(elem){
    let totalNodes = document.getElementById('si-container').childElementCount
    
    node_ep = elem
    node_sp = elem.parentElement.getElementsByClassName('si-sp')[0]
    no = node_sp.id.match(/si-sp-\d+/)[0].match(/\d$/)[0]

    let sp =  node_sp.value
    let ep = Number((node_ep.value))
    
    if (ep <= 0){
        showMessage('Invalid value for page number')
        node_ep.value = sp
    }
    if (ep > pages){
        node_ep.value = pages
        showMessage(`End page value can not exceed max pages count (${pages})`)
    }
    if (ep > 0 && ep <= pages) {
        showMessage(`Part:${sp}-${ep}`)
    }
    if (!unsupervisedMode){
        let max = pages - (totalNodes - no)
        if (ep > max){
            node_ep.value = max
            showMessage(`Value for this page can't exceed ${max}`)
        }
    }
    
    calcSP(elem)
}
function inputSupervisor_sp(elem){
    let val = Number(elem.value)
    if (val <= 0){
        showMessage('Invalid value for page number')
        elem.value = 1
    }
    if (val > pages){
        showMessage(`Can not exceed max page number count - ${pages}`)
        elem.value = 1
    }
}
function calcSP(elem){
    if (unsupervisedMode){
        return
    }
    node_ep = elem
    node_sp = elem.parentElement.getElementsByClassName('si-sp')[0]
    no = Number(node_sp.id.match(/si-sp-\d+/)[0].match(/\d$/)[0])
    nextNodeNo = no + 1
    // log(nextNodeNo)
    let totalNodes = document.getElementById('si-container').childElementCount
    if (nextNodeNo <= totalNodes){
        next_sp = elem.parentElement.parentElement.querySelectorAll(`#si-sp-${nextNodeNo}`)[0]
        next_ep = elem.parentElement.parentElement.querySelectorAll(`#si-ep-${nextNodeNo}`)[0]
        next_val = Number(elem.value) + 1
        if (next_val > pages){
            next_val = pages
        }
        next_sp.value = next_val
        // next_sp.value = Number(elem.value) + 2
        // next_ep.value = Number(elem.value) + 1
    }
}
document.getElementById('mode-selector').onclick = (ev) => {
    elem = ev.currentTarget
    unsupervisedMode = !elem.checked
    showMessage(`Supervised mode ${elem.checked ? "on" : "off" }`)
    switchSP(!elem.checked)
    nodeListLengthEnforcer(ev)
}
//check if no of nodes doesn't exceed no of pages in supervised mode
function nodeListLengthEnforcer(ev) {
    elem = ev.currentTarget
    let sup = elem.checked
    if (sup){
        let cont = document.getElementById('si-container')
        let totalNodes = cont.childElementCount
        let extra = (totalNodes - pages)
        for (let i = 0; i < extra; i++){
            let arr = cont.getElementsByClassName('si-node')
            let len = arr.length 
            let lc = (arr[len-(i+1)])
            cont.removeChild(lc)
        }
    }
}
function switchSP(bool){
    let spnodes = document.getElementsByClassName('si-sp')
    for (let spn of spnodes){
        spn.disabled = !bool
    }
    if(!unsupervisedMode){
        let cont = document.getElementById('si-container')
        let totalNodes = cont.childElementCount
        for (let i = 1; i <= totalNodes; i++){
            let ep = document.getElementById(`si-ep-${i}`)
            inputSupervisor(ep)
        }
        
    }
}
function setSP(){
    let spnodes = document.getElementsByClassName('si-sp')
    for (let spn of spnodes){
        spn.disabled = !unsupervisedMode
    }
}
function removeNode(elem){
    let id = elem.id
    let cont = elem.parentElement.parentElement
    cont.removeChild(elem.parentElement)
    let allNodes = document.getElementsByClassName('si-node')
    for (let i = 1; i <= allNodes.length; i++){
        allNodes[i - 1].id = `si-node-${i}`
        let node = document.getElementById(`si-node-${i}`)
        node.getElementsByClassName('si-ep')[0].id = `si-ep-${i}`
        node.getElementsByClassName('si-sp')[0].id = `si-sp-${i}`
        node.getElementsByClassName('si-add')[0].id = `si-add-${i}`
        node.getElementsByClassName('si-rem')[0].id = `si-rem-${i}`
    }
    sendBtn.innerText = `Split ${pdfname} into ${allNodes.length} part(s)`

}
/**
 * Check splitting data before sending
 */

function checkInput(){
    let cont = document.getElementById('si-container')
    let totalNodes = cont.childElementCount
    let flag = true
    for (let i = 1; i <= totalNodes; i++){
        let sp = document.getElementById(`si-sp-${i}`).value
        let ep = document.getElementById(`si-ep-${i}`).value
        log(sp, ep)
        sp=Number(sp)
        ep=Number(ep)
        if (sp <= 0 || ep <= 0){
            showMessage(`Page number invalid (Part ${i})`)
            flag = false
        }
        if (sp > ep){
            showMessage(`Start page can't exceed end page (Part ${i})`)
            flag = false

        }
        if (sp > pages || ep > pages){
            showMessage(`Start page can't exceed end page (Part ${i})`)
            flag = false
            
        }
    }
    return flag
}
/**
 * send split data
*/
function sendData(){
    let correct = checkInput()
    if (correct == true){
        showMessage('Server is processing file...')
        let cont = document.getElementById('si-container')
        let totalNodes = cont.childElementCount
        let data = {'split_info':[]}
        data.name = pdfname
        for (let i = 1; i <= totalNodes; i++){

            let sp = document.getElementById(`si-sp-${i}`)
            let ep = document.getElementById(`si-ep-${i}`)
            data.split_info.push({'sp':Number(sp.value), 'ep': Number(ep.value)})
        }
        console.log(data)
        fetch('/split', {
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
}  


function downloadParts(partNames){
    for(let f of partNames){
        log('dl', f)
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
}
/**
 * Reset
 */

function resetPage(){
    suf.reset();
    window.location.reload()
}