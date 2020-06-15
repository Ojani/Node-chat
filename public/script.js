if(window.location.hostname == "localhost") {
  var socket = io.connect("http://localhost:"+location.port);

} else {
  var socket = io.connect(window.location.hostname);

}

const form = document.querySelector(".textboxForm");
const input = document.querySelector(".textbox");


//user list
const userList = {
  users: { },

  add(name, id, currentUser) {
    this.users[id] = name;
    addToList(name, id, currentUser);
  },

  remove(id) {
    delete this.users[id];
    removeFromList(id);
  }

}

function addToList(name, id, currentUser) {
  const div = document.createElement("div");
  const p = document.createElement("p");

  div.id = id;
  div.className = "userBox";
  p.innerText = name;
  div.append(p);

  //changing div style if it is the one of the current users
  if(currentUser) div.classList.add("myUserBox");

  document.querySelector(".usersList").append(div);
}

function removeFromList(id) {
  document.querySelector(`#${id}`).remove();
}


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

  //checking if there is any image or video to send
  const fileType = filePreviewWrapper.fileType;

  data.file.type = fileType;

  if(fileType == "image") {
    data.file.src = imgPreviewer.src;

  } else if (fileType == "video") {
    data.file.src = vidPreviewer.src;

  } else if(docPreviewer.src) {
    data.file.src = docPreviewer.src;
    data.file.extension = docPreviewer.extension;

    data.file.type = "appli";

  } else {
    data.file = null;

  }



  //sending data
  if(data.message || data.file) {
    socket.emit("send-message", data, roomName);
    appendMsg({ name: "You", message: data.message, file: data.file, sent: true });

    input.value = "";

  }
  removeAttachment();
  //end of sending form function
}




//appending messages
const messagesWrapper = document.querySelector(".messagesWrapper");

function appendMsg({ name, message, file, info, sent } = {}) {
  const div = document.createElement("div");

  //doing nothing if there is no message and no image
  if(!file && !message) return;

  //adding the user's name
  if(name) {
    const bold = document.createElement("b");
    bold.innerText = name;

    div.append(bold);

  }


  //adding file viewer if there is an image or video
  const validTypes = ["image", "video" ,"appli"];

  if(file) {
    if(!validTypes.includes(file.type)) return;

    if(!file.extension) {

      if(file.type == "image") var tag = "img";
      else if(file.type == "video") var tag = "video";

      const fileViewer = document.createElement(tag);

      //in case it's a video
      fileViewer.controls = true;

      fileViewer.className = "fileViewer";

      fileViewer.src = file.src;

      div.append(fileViewer);
    }
  }

  //adding a document viewer if available
  if(file && file.extension) {
    const fileViewer = document.createElement("span");
    const i = document.createElement("i");
    const br = document.createElement("br");
    const b = document.createElement("b");

    fileViewer.className = "docPreviewer";
    fileViewer.style.display = "block";

    fileViewer.innerHTML = `
    <i class="fas fa-file-alt"></i>
    <br>
    <b>${file.extension}</b>`;

    fileViewer.onclick = () => viewDocument(file.src);

    div.append(fileViewer);

  }


  //adding text if there is any
  if(message) {
    const span = document.createElement("span");
    span.innerText = message;
    div.append(span);

  }

  //changing the style of chat bubble if it's not a user generated message
  if(info) div.className = "infoBox";
  //changing style if it is the current user's messages
  if(sent) div.className = "myMsg";

  //scrolling to bottom
  var scroll = false
  if(messagesWrapper.scrollTop > messagesWrapper.scrollHeight-window.innerHeight*1.5) scroll = true;

  messagesWrapper.append(div);

  if(scroll) scrollToBottom();

  //end of appendMsg function
}

//recieving messages
socket.on("chat-message", data =>{
  appendMsg(data)

});

//displaying when a user connects
socket.on("user-connected", (name, id) => {
  appendMsg({ message: `${name} connected!`, info:true });
  userList.add(name, id);
});

//giving the user a name
const userName = prompt("Enter a name.\nor default to guest") || "Guest"+(Math.floor(Math.random()*89999)+10000);
appendMsg({ message: "You connected!", info: true });

socket.emit("new-user", userName, roomName);
userList.add(userName, 0, true);





//attachmentBtn
/*const attachmentBtn = document.querySelector(".attachmentBtn");
const exitAttachmentOptions = document.querySelector(".exitAttachmentOptions");

attachmentBtn.addEventListener("click", toggleAttachmentOptions);
exitAttachmentOptions.onclick = toggleAttachmentOptions;

function toggleAttachmentOptions() {
   document.querySelector(".attachmentOptions").classList.toggle("showAttachmentOptions")
}*/

//uploading file

//images

const fileBtn = document.querySelector(".fileBtn");
fileBtn.onchange = fileChosen;


//processing uploaded file
function fileChosen() {

  const reader = new FileReader();
  const file = fileBtn.files[0];
  var fileType = file.type.slice(0,5);
  const extension = file.name.split(".").pop();

  //handling txt files as documents
  if(fileType == "text/") fileType = "appli";

  reader.onload = function() {

   //previewing file
   previewFile(reader.result, fileType, extension);
 };

 if (fileBtn) {
   reader.readAsDataURL(file);
 }
}


//previewing selected image
const filePreviewWrapper = document.querySelector(".filePreviewWrapper");
const imgPreviewer = document.querySelector(".imgPreviewer");
const vidPreviewer = document.querySelector(".vidPreviewer");
const docPreviewer = document.querySelector(".docPreviewer");
const docExtension =  document.querySelector(".docPreviewer b");

function previewFile(src, type, extension) {
  fileBtn.value = "";

  if(type != "image" && type != "video" && type != "appli") return;

  //removing any file that's already there if any
  removeAttachment();

  if(type == "image") {
    imgPreviewer.src = src;
    imgPreviewer.style.display = "block";

  } else if(type == "video") {
    vidPreviewer.src = src;
    vidPreviewer.style.display = "block";

  } else if(type == "appli") {
    docPreviewer.src = src;
    docPreviewer.extension = extension;
    docPreviewer.style.display = "block";
    docExtension.innerText = extension;

  }

  filePreviewWrapper.style.display = "block";
  filePreviewWrapper.fileType = type;

}

//previewing documents
const docViewer = document.querySelector(".docViewer");
const exitDocBtn = document.querySelector(".exitDocBtn");
const docIframe = document.querySelector(".docViewer iframe");
const previewBtn = document.querySelector(".docPreviewer");

previewBtn.onclick = () => viewDocument(previewBtn.src);

function viewDocument(src) {
  docViewer.style.display = "block";
  docIframe.src = src;

}

//closing document previews
exitDocBtn.onclick = closeDocument;
function closeDocument() {
  docViewer.style.display = "none";
  docIframe.src = "";

}


//removing image preview
const removeFileBtn = document.querySelector(".removeFileBtn");
removeFileBtn.onclick = removeAttachment;

function removeAttachment() {
  imgPreviewer.src = "";
  vidPreviewer.src = "";
  docPreviewer.src = "";

  filePreviewWrapper.fileType = null;
  docPreviewer.extension = null;

  filePreviewWrapper.style.display = "none";
  imgPreviewer.style.display = "none";
  vidPreviewer.style.display = "none";
  docPreviewer.style.display = "none";

}


//when a user diconnects
socket.on("user-disconnected", (name, id) => {
  appendMsg({ message: `${name} disconnected`, info: true });
  userList.remove(id);

});





//Sowing navWrapper
const navWrapper = document.querySelector(".navWrapper");
const burgerBtn = document.querySelector(".burgerMenu");

burgerBtn.onclick = () => {
  navWrapper.classList.toggle("show");
  burgerBtn.classList.toggle("turn2x");

}

//chat scrolling
const scrollBtn = document.querySelector(".scrollToBottom");
scrollBtn.onclick = scrollToBottom;

function scrollToBottom() {
  messagesWrapper.scrollTop = messagesWrapper.scrollHeight;

}

//showing scroll button when useer scrolls up;
messagesWrapper.onscroll = () => {
  if(messagesWrapper.scrollTop < messagesWrapper.scrollHeight-window.innerHeight*1.5) {
    scrollBtn.classList.add("show");
  }else {
    scrollBtn.classList.remove("show");
  }

}
