const socket = io("http://100.115.92.203:3000")

const form = document.querySelector("form");
const input = document.querySelector(".textbox");

//form submit function
form.onsubmit = function(e) {
  e.preventDefault();
  const message = input.value;

  const data = {}

  //checking if there is any text to send
  if(message.replace(/ /g, "") != "") {
    data.message = message;

  }

  //checking if there is any image to send
  if(imgPreviewer.src.slice(0,4) == "data") {
    data.img = imgPreviewer.src;

  }

  //sending data
  if(message.replace(/ /g, "") != "" || imgPreviewer.src != "") {
    socket.emit("send-message", data);
    appendMsg({ name: "You", message: data.message, img: data.img })
    input.value = "";

    removeImgPreview();

  }
}

//uploading file
const fileBtn = document.querySelector(".fileBtn");
fileBtn.onclick = fileBtn.value = null;
fileBtn.onchange = fileChosen;

//processing uploaded file
function fileChosen() {
  const reader = new FileReader();
  const file = fileBtn.files[0];

  reader.onload = function() {
   //previewing image
   previewImg(reader.result);
 };

 if (fileBtn) {
   reader.readAsDataURL(file);
 }
}

//previewing selected image
const imgPreviewer = document.querySelector(".imgPreviewer");
const imgPreviewWrapper = document.querySelector(".imgPreviewWrapper");

function previewImg(src) {
  imgPreviewer.src = src;
  imgPreviewWrapper.style.display = "block";

}

//removing image preview
const romoveImgBtn = document.querySelector(".removeImgBtn");
romoveImgBtn.onclick = removeImgPreview;

function removeImgPreview() {
  imgPreviewer.src = "";
  imgPreviewWrapper.style.display = "none";

}




//appending messages
const messagesWrapper = document.querySelector(".messagesWrapper");

function appendMsg({ name, message, img } = {}) {
  const div = document.createElement("div");

  //not using image if image src is not a valid one
  if(img && img.slice(0,4) != "data") img = null;

  //doing nothing if there is no message and no image
  if(!img && !message) return;

  //adding the user's name
  if(name) {
    const bold = document.createElement("b");
    bold.innerText = name;

    div.append(bold);

  }

  //adding image viewer if there is an image
  if(img) {
    const imgViewer = document.createElement("img");
    imgViewer.className = "imgViewer";

    imgViewer.src = img;

    div.append(imgViewer);
  }

  //adding text if there is any
  if(message) {
    const span = document.createElement("span");
    span.innerText = message;
    div.append(span);

  }

  //changing the style of chat bubble if it's not a user generated message
  if(!name) div.className = "infoBox";

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
