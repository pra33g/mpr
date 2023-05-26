const log = console.log.bind(console);

document.getElementById("add-button").addEventListener('click', function(event){
    event.preventDefault()
    const container = document.getElementById("form-container")
    const div = document.querySelectorAll("[id^=form_merge_]")
    let nextId = div.length + 1

    let text = `
    <form class="mergeform" data-addedSubmitEventListener="false" id="form_merge_${nextId}" action="/upload" enctype="multipart/form-data" method="POST" class="signupForm">
    <input type="file" id="merge_upload_${nextId}" class="inputFields" accept="application/pdf" name="pdfbm_upload" multiple="multiple"><br><br />                        
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

        uploadedFilenames.push(upFileName)
        // log('created file')
        multiUploadHandler();
        
        
    }
    else {
        // showPageCount(data.message);
        // log('not created')
    }
}

const source = new EventSource('/sse');
source.addEventListener("message", message => {
    let got = JSON.parse(message.data);
    console.log("Got ", got);
    
    if (got.message == "conversion-done"){
        //  displayMessage.innerText = "Downloading file, Please wait.\nRefresh page to start again.";
        
        convertedName = got.name;
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