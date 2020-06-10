const socket = io("http://100.115.92.203:3000")

const form = document.querySelector("form");
const input = document.querySelector(".textbox");


//form submit function
//SENDING MESSAGE
form.onsubmit = function(e) {
  e.preventDefault();
  const message = input.value;

  const data = {}
  data.file = {}

  //checking if there is any text to send
  if(message.replace(/ /g, "") != "") {
    data.message = message;

  } else {
    data.message = null;

  }

  //checking if there is any image to send
  const fileType = filePreviewWrapper.fileType;
  data.file.type = fileType;

  if(fileType == "image") {
    data.file.src = imgPreviewer.src;

  }else if (fileType == "video") {
    data.file.src = vidPreviewer.src;

  } else {
    data.file = null;

  }
  filePreviewWrapper.fileType = null;


  //sending data
  if(data.message || data.file) {
    socket.emit("send-message", data);
    appendMsg({ name: "You", message: data.message, file: data.file })
    input.value = "";

    removeAttachment();

  }
  //end of sending form function
}




//appending messages
const messagesWrapper = document.querySelector(".messagesWrapper");

function appendMsg({ name, message, file } = {}) {
  const div = document.createElement("div");


  //doing nothing if there is no message and no image
  if(!file && !message) return;

  //adding the user's name
  if(name) {
    const bold = document.createElement("b");
    bold.innerText = name;

    div.append(bold);

  }

  //adding file viewer if there is a file
  if(file) {

    if(file.type != "image" && file.type != "video") return;

    if(file.type == "image") var tag = "img";
    else if(file.type == "video") var tag = "video";

    const fileViewer = document.createElement(tag);

    //in case it's a video
    fileViewer.controls = true;

    fileViewer.className = "fileViewer";

    fileViewer.src = file.src;

    div.append(fileViewer);
  }

  //adding text if there is any
  if(message) {
    const span = document.createElement("span");
    span.innerText = message;
    div.append(span);

  }

  //changing the style of chat bubble if it's not a user generated message
  if(!name) { div.className = "infoBox"; }

  messagesWrapper.append(div);
  //end of appendMsg function
}

//recieving messages
socket.on("chat-message", data =>{
  appendMsg(data)

});

//displaying when a user connects
socket.on("user-connected", name => {
  appendMsg({ message: name })

});

//giving the user a name
const userName = prompt("Enter a name") || "Guest";
appendMsg({ message: "You connected!" });

socket.emit("new-user", userName);





//attachmentBtn
const attachmentBtn = document.querySelector(".attachmentBtn");
const exitAttachmentOptions = document.querySelector(".exitAttachmentOptions");

attachmentBtn.addEventListener("click", toggleAttachmentOptions);
exitAttachmentOptions.onclick = toggleAttachmentOptions;

function toggleAttachmentOptions() {
   document.querySelector(".attachmentOptions").classList.toggle("showAttachmentOptions")
}

//uploading file

//images

const fileBtn = document.querySelector(".fileBtn");
fileBtn.onchange = fileChosen;


//processing uploaded file
function fileChosen() {
  const reader = new FileReader();
  const file = fileBtn.files[0];
  const fileType = file.type.slice(0,5);

  reader.onload = function() {

   //previewing file
   previewFile(reader.result, fileType);
 };

 if (fileBtn) {
   reader.readAsDataURL(file);
 }
}


//previewing selected image
const imgPreviewer = document.querySelector(".imgPreviewer");
const vidPreviewer = document.querySelector(".vidPreviewer");
const filePreviewWrapper = document.querySelector(".filePreviewWrapper");

function previewFile(src, type) {
  fileBtn.value = "";

  if(type != "image" && type != "video") return;

  if(type == "image") {
    imgPreviewer.src = src;
    imgPreviewer.style.display = "block";

  } else if(type == "video") {
    vidPreviewer.src = src;
    vidPreviewer.style.display = "block";

  }

  filePreviewWrapper.style.display = "block";
  filePreviewWrapper.fileType = type;

}

//removing image preview
const removeFileBtn = document.querySelector(".removeFileBtn");
removeFileBtn.onclick = removeAttachment;

function removeAttachment() {
  imgPreviewer.src = "";
  vidPreviewer.src = "";

  document.querySelector(".filePreviewWrapper, .imgPreviewer, .vidPreviewer").style.display = "none";
  filePreviewWrapper.type = null;
}
