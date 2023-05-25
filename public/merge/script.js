const log = console.log.bind(console);

document.getElementById("add-button").addEventListener('click', function(event){
    event.preventDefault()
    const form = document.getElementById("merge_upload_container")
    const div = document.querySelectorAll("[id^=merge_upload]")
    let nextId = div.length

    let text = `<input type="file" id="merge_upload${nextId}" class="inputFields" accept="application/pdf" name="pdf_upload${nextId}" multiple="multiple"><br><br />`
    form.insertAdjacentHTML('beforeend', text)
})

document.getElementById('submitButton').addEventListener('click', e => {
    btn = document.querySelectorAll("[id^=upload_button_]");
    for (let i = 0; i < btn.length; i++){
        btn[i].click()
    }
    document.getElementById('upload_button_1').click()    
})
$('.mergeform').submit(
    // $('#form_merge_1').submit(
    function( e ) {
        log(this)
        e.preventDefault();
        let formData = new FormData(this);
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
                console.log(xhr.response)
            }
        };
    } 
);

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
