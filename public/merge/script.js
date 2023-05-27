const log = console.log.bind(console);

document.getElementById("add-button").addEventListener('click', function(event){
    event.preventDefault()
    const container = document.getElementById("form-container")
    const div = document.querySelectorAll("[id^=form_merge_]")
    let nextId = div.length + 1

    let text = `
    <form class="mergeform" data-addedSubmitEventListener="false" id="form_merge_${nextId}" action="/upload" enctype="multipart/form-data" method="POST" class="signupForm">
    <input type="file" id="merge_upload_${nextId}" class="inputFields" accept="application/pdf" name="pdfbm_upload"><br><br />                        
    <input type="submit" id="upload_button_${nextId}" value="Upload" class="hidden">            
    </form>    
    `
    container.insertAdjacentHTML('beforeend', text)
})

let totalFilesToUpload = 0;
let totalFilesUploaded = 0;
let uploadedFilenames = [];
function multiUploadHandler(){
    log(totalFilesUploaded," of ", totalFilesToUpload, ' files uploaded.')
    if (totalFilesToUpload == totalFilesUploaded){
        //post to /merge
        postFileNamesToMerge()

    } else {
        log('All files not uploaded.')
    }
}

function postFileNamesToMerge(){
    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/merge")
    xhr.responseType = 'json'
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    reqJSON = {"filenames":uploadedFilenames}
    // let filenamesStringified = JSON.stringify(uploadedFilenames)
    xhr.send(JSON.stringify(reqJSON))
    xhr.onreadystatechange = () => {
        if (xhr.readyState == XMLHttpRequest.DONE){
            log(xhr.response)
        }
    }
}

document.getElementById('submitButton').addEventListener('click', e => {
    forms = document.getElementsByClassName('mergeform')
    btn = document.querySelectorAll("[id^=upload_button_]");
    inputs = document.querySelectorAll("[id^=merge_upload_]")

    for (let form of forms){
        if (form.dataset.addedsubmiteventlistener === 'false'){
            // log('added to ', form)
            form.addEventListener('submit', e => {
                e.preventDefault();
                let formData = new FormData(form);
                let xhr = new XMLHttpRequest();
                xhr.upload.addEventListener("progress", progressHandler);
                xhr.open("POST", "/upload");
                xhr.responseType = 'json';
    
                xhr.send(formData);
                xhr.upload.addEventListener("load", successUpload);
    
                //get response from server in json and log it
                xhr.onreadystatechange = ()=>{
                    if(xhr.readyState == XMLHttpRequest.DONE){
                        log(xhr.response)
                        completeUpload(xhr.response);
                    }
                };
            })
            form.dataset.addedsubmiteventlistener = 'true'
        }
    }
    totalFilesToUpload = btn.length;
    totalFilesUploaded = 0;

    //set the filenames array according the ordering of input elements
    uploadedFilenames = [];
    for(let i = 0; i < inputs.length; i++){
        let name = inputs[i].value
        //match a / or \ and letters before it * times
        name = name.replace(/.*[\/\\]/, '');
        uploadedFilenames.push(changeNameToTransmit(name))
    }
    for (let i = 0; i < btn.length; i++){
        btn[i].click()
    }
})
function progressHandler(event){
    let totalSize = event.total;
    let loadedSize = event.loaded;

    loadedInfo = `Uploaded: ${(loadedSize/(1024*1024)).toFixed(1)}MB of ${(totalSize/(1024*1024)).toFixed(1)}MB(${(loadedSize/totalSize * 100).toFixed(1)}%)`
}
function successUpload(event){
    allBytesUploaded = "DONE";
    log("DONE")
    

}
function completeUpload(data){

    if(data.http == 201){
        let upFileName = data.name;
        // log(totalFilesUploaded)
        totalFilesUploaded+=1;
        // log(totalFilesUploaded)

        // log('created file')
        multiUploadHandler();
        
        
    }
    else {
        // showPageCount(data.message);
        // log('not created')
    }
}

function changeNameToTransmit(name){
    name = name.replaceAll(' ','-');
    if (name.length > 25){
        name = name
            .substring(0, 21)
            .concat(".pdf");
    }
    return name
}

const source = new EventSource('/sse');
source.addEventListener("message", message => {
    let got = JSON.parse(message.data);
    console.log("Got ", got);
    document.getElementById('info-sse').innerText=got.message;
    
    if (got.message == "merging-completed"){
        //  displayMessage.innerText = "Downloading file, Please wait.\nRefresh page to start again.";
        
        convertedName = "merged.pdf";
        downloadPDF(convertedName);
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
});

function downloadPDF(file){
    let xhr = new XMLHttpRequest();


    xhr.open("GET", `/download?name=${file}`);
    xhr.send();
    xhr.responseType = "blob";
    xhr.onload = function(e) {
        if (this.status == 200) {
            // Create a new Blob object using the 
            //response data of the onload object
            var blob = new Blob([this.response], {type: 'image/pdf'});
            //Create a link element, hide it, direct 
            //it towards the blob, and then 'click' it programatically
            let a = document.createElement("a");
            a.style = "display: none";
            document.body.appendChild(a);
            //Create a DOMString representing the blob 
            //and point the link element towards it
            let url = window.URL.createObjectURL(blob);
            a.href = url;
            a.download = 'myFile.pdf';
            //programatically click the link to trigger the download
            a.click();
            //release the reference to the file by revoking the Object URL
            window.URL.revokeObjectURL(url);
        }else{
            //deal with error
        }
    }
}