const log = console.log.bind(console);

document.getElementById("add-button").addEventListener('click', function(event){
    event.preventDefault()
    const container = document.getElementById("form-container")
    const div = document.querySelectorAll("[id^=form_merge_]")
    let nextId = div.length + 1

    let text = `
    <form class="mergeform" data-addedSubmitEventListener="false" id="form_merge_${nextId}" action="/merge" enctype="multipart/form-data" method="POST" class="signupForm">
    <input type="file" id="merge_upload_${nextId}" class="inputFields" accept="application/pdf" name="pdfbm_upload" multiple="multiple"><br><br />                        
    <input type="submit" id="upload_button_${nextId}" value="Upload" class="">            
    </form>    
    `
    container.insertAdjacentHTML('beforeend', text)
})

document.getElementById('submitButton').addEventListener('click', e => {
    forms = document.getElementsByClassName('mergeform')
    btn = document.querySelectorAll("[id^=upload_button_]");
    for (let form of forms){
        if (form.dataset.addedsubmiteventlistener === 'false'){
            log('added to ', form)
            form.addEventListener('submit', e => {
                // e.preventDefault()
                e.preventDefault();
                // log("added to")
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
                        completeUpload(xhr.response);
                        log(xhr.response)
                    }
                };
            })
            form.dataset.addedsubmiteventlistener = 'true'
        }
    }
    for (let i = 0; i < btn.length; i++){
        // btn[i].click()
    }
})
function sendFormData(e){}
// $('.mergeform').submit(
//     // $('#form_merge_1').submit(
//     function( e ) {
//         log(this)
//         e.preventDefault();
//         let formData = new FormData(this);
//         let xhr = new XMLHttpRequest();
//         xhr.upload.addEventListener("progress", progressHandler);
//         xhr.open("POST", "/upload");
//         xhr.responseType = 'json';

//         xhr.send(formData);
//         xhr.upload.addEventListener("load", successUpload);

//         //get response from server in json and log it
//         xhr.onreadystatechange = ()=>{
//             if(xhr.readyState == XMLHttpRequest.DONE){
//                 completeUpload(xhr.response);
//                 log(xhr.response)
//             }
//         };
//     } 
// );
function progressHandler(event){
    // let totalSize = event.total;
    // let loadedSize = event.loaded;

    // let pUploadedBytesInfo = document.getElementById("pMessage");
    // pUploadedBytesInfo.innerHTML = `Uploaded: ${(loadedSize/(1024*1024)).toFixed(1)}MB of ${(totalSize/(1024*1024)).toFixed(1)}MB(${(loadedSize/totalSize * 100).toFixed(1)}%)`; 
}
function successUpload(event){
    // let pUploadedBytesInfo = document.getElementById("pUploadedBytesInfo");
    // pUploadedBytesInfo += "DONE";

}
function completeUpload(data){

    // if(data.http == 201){
    //     upFileName = data.name;
    //     showPageCount(data.pages);
    //     previewPdf(data.name);
    //     bmInputContainer.style.display = "block";
    //     document.getElementById("bmno_1").querySelector("#new").click();
    //     document.getElementById("bmno_1").querySelector("#del").click();
    //     addBmButton.style.display = "block";

    //     document.getElementById("form_bookmark").style.display = "none";

        
    // }
    // else {
    //     // showPageCount(data.message);
    //     previewPdf(undefined);
    //     bmInputContainer.style.display = "none";
    //     addBmButton.style.display = "none";
    // }
}