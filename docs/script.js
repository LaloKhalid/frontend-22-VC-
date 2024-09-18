import { initializeApp } from "https://www.gstatic.com/firebasejs/9.16.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
  runTransaction,
  remove,
  push,
  onChildAdded,
  onChildRemoved,
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js"; // <---

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {
  databaseURL:
    "https://demo1-3c759-default-rtdb.europe-west1.firebasedatabase.app/", // <----
  apiKey: "AIzaSyDkRmoWLJ0eEXZKYEeUNwRF8V6X0oHwBi0",
  authDomain: "demo1-3c759.firebaseapp.com",
  projectId: "demo1-3c759",
  storageBucket: "demo1-3c759.appspot.com",
  messagingSenderId: "632318648569",
  appId: "1:632318648569:web:60f9813437fa829e598228",
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const db = getDatabase(app); // <-----

console.log(db);

const nameField = document.getElementById("nameField");
//sparar author
let nameInput = "";
document.getElementById("btn").addEventListener("click", () => {
  nameInput = nameField.value;
  if (nameInput.length > 0) {
    btn.innerText = "Your name:";
    btn.disabled = true;
  }
});

//tömmer fältet när man vill ändra author
nameField.addEventListener("click", () => {
  nameField.value = "";
  btn.innerText = "submit name";
  btn.disabled = false;
});

//så man kan klicka enter istället för trycka på knappen
function clickBtn() {
  btn.click();
  nameField.blur();
}

nameField.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    clickBtn();
  }
});

// Function to increment the like counter
function likeMessage(messageId) {
  const likesRef = ref(db, `/${messageId}/likes`);
  
  // Use transaction to safely increment likes
  runTransaction(likesRef, (currentLikes) => {
    return (currentLikes || 0) + 1; // Increment likes by 1
  }).catch((error) => {
    console.log("Error updating likes:", error);
  });
}

// Function to increment the dislike counter
function dislikeMessage(messageId) {
  const dislikesRef = ref(db, `/${messageId}/dislikes`);
  
  // Use transaction to safely increment dislikes
  runTransaction(dislikesRef, (currentDislikes) => {
    return (currentDislikes || 0) + 1; // Increment dislikes by 1
  }).catch((error) => {
    console.log("Error updating dislikes:", error);
  });
}



//document.getElementById("btn").addEventListener(
  
document.getElementById("content").addEventListener("click", (event) => {
  // Check if the click was on a Like or Dislike button, and handle it separately
  if (event.target && event.target.matches("button[id^='like-btn-']")) {
    const messageId = event.target.id.split("-")[2]; // Extract message ID from button ID
    likeMessage(messageId);
    return; 
  }

  if (event.target && event.target.matches("button[id^='dislike-btn-']")) {
    const messageId = event.target.id.split("-")[2]; // Extract message ID from button ID
    dislikeMessage(messageId);
    return; 
  }

  if (btn.disabled === true) {
    var promptMessage = prompt("Write you message:", "message");
    if (promptMessage == null) return;
    const chosenColor = document.getElementById("post-it-color").value;

    var e = event;
    console.log(e);
    var x = Math.round((event.clientX / window.innerWidth) * 100);
    var y = Math.round((event.clientY / window.innerHeight) * 100);

    console.log(window.innerWidth, window.innerHeight);
    console.log(x, y);

    push(ref(db, "/"), {
      username: "Alrik",
      dateOfCretion: new Date().toString("yyyy-MM-dd hh:mm:ss"),
      message: document.getElementById("uppercaseCheckbox").checked
        ? promptMessage.toUpperCase()
        : promptMessage,
      author: nameInput,
      color: chosenColor,
      likes: 0, 
      dislikes: 0, 
      x: x,
      y: y,
      attributes: {
        italic: document.getElementById("italicCheckbox").checked,
        uppercase: document.getElementById("uppercaseCheckbox").checked,
      },
    });
  } else {
    alert(
      "Warning! Your post have no author. Please submit a name in the field and confirm."
    );
    nameField.style.backgroundColor = "red";
    setTimeout(() => {
      nameField.style.backgroundColor = null;
    }, 500);
    setTimeout(() => {
      btn.style.backgroundColor = "red";
    }, 1000);
    setTimeout(() => {
      btn.style.backgroundColor = null;
    }, 1500);
  }
});

function writeUserData() {
  let inputName = document.getElementById("inName").value;
  console.log(inputName);
  set(ref(db, inputName), {
    message: "hello",
    dateOfCretion: new Date(),
  });
}
//writeUserData()

/* onValue(
  ref(db, 'Alrik'),
  (snapshot) => {
    const data = snapshot.val();
    //alert(data.message)
    //document.body.innerHTML= data.message;
  },
  { onlyOnce: true }
); */



onChildAdded(ref(db, "/"), (data) => {
  let d = data.val();
  const italicClass = d.attributes && d.attributes.italic ? " italic" : "";
  const messageId = data.key;
const messageHTML = `<strong>${d.author}:</strong> ${d.message}`;

if (d.message.length < 5) {
  document
    .getElementById("content")
    .insertAdjacentHTML(
      "beforeend",
      `<p class="bubble${italicClass}" id="${data.key}" style="left:${d.x}vw; top:${d.y}vh; color:${d.color}">
        ${messageHTML}
        <br/>
          <button id="like-btn-${messageId}" class="emoji-btn">👍</button>
           <span id="like-count-${messageId}">${d.likes || 0}</span>
           <button id="dislike-btn-${messageId}" class="emoji-btn">👎</button>
           <span id="dislike-count-${messageId}">${d.dislikes || 0}</span>
      </p>`
    );
} else {
  document
    .getElementById("content")
    .insertAdjacentHTML(
      "beforeend",
      `<p class="bubble speech${italicClass}" id="${data.key}" style="left:${d.x}vw; top:${d.y}vh; color:${d.color}">
        ${messageHTML}
        <br/>
        
        <button id="like-btn-${messageId}" class="emoji-btn">👍</button>
        <span><span id="like-count-${data.key}">${d.likes || 0}</span></span> 
        
        <button id="dislike-btn-${messageId}" class="emoji-btn">👎</button>
        <span><span id="dislike-count-${data.key}">${d.dislikes || 0}</span></span> 
      </p>`
    );
}


  // Add event listener for the "Like" button
  document.getElementById(`like-btn-${messageId}`).addEventListener("click", (event) => {
    event.stopPropagation(); 
    likeMessage(messageId);
  });
// Add event listener for the "Dislike" button
document.getElementById(`dislike-btn-${messageId}`).addEventListener("click", (event) => {
  event.stopPropagation(); 
  dislikeMessage(messageId);
});

  // Update like and dislike counters when changed in Firebase
  onValue(ref(db, `/${messageId}/likes`), (snapshot) => {
    document.getElementById(`like-count-${messageId}`).textContent = snapshot.val() || 0;
  });

  onValue(ref(db, `/${messageId}/dislikes`), (snapshot) => {
    document.getElementById(`dislike-count-${messageId}`).textContent = snapshot.val() || 0;
  });

  document
    .getElementById(data.key)
    .addEventListener("contextmenu", (event) => event.preventDefault());

  let bubbleID = document.querySelector(`#${data.key}`);

  document.getElementById(data.key).addEventListener("mouseup", (event) => {
    if (event.button == 2) {
      alert("Delete message?");
      bubbleID.remove();
      remove(ref(db, bubbleID.id));
    }
  });

  /*document.getElementById(
    "content"
  ).innerHTML += `<p class="bubble speech" style="left:${d.x}vw; top:${d.y}vh">${d.message}</p>`;*/
  console.log(d);
});

onChildRemoved(ref(db, "/"), (data) => {
  console.log(document.querySelector(`#${data.key}`).remove());
  console.log(document.getElementById(data.key).remove());
});

/*
remove(ref(db , 'henrik') ).then(() => {
    console.log("alrik removed");
});*/

//db.ref("-Users/-KUanJA9egwmPsJCxXpv").update({ displayName: "New trainer" });

//update( ref( db, alrik), () =>{ message: "New trainer" } );

//document.getElementById('btn').addEventListener('click', get);

/*
 *
 *   REST API GUIDE FÖR FIREBASE NEDAN |
 *                                     V
 */

// Alriks databas
const BASE_URL =
  "https://demo1-3c759-default-rtdb.europe-west1.firebasedatabase.app/.json";

/* PUT , läggaer till skriver över */
async function putMessage() {
  let messageObject = {
    text: "Hello world put",
    time: new Date(),
  };
  console.log(JSON.stringify(messageObject));
  const requestOptions = {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messageObject),
  };

  let response = await fetch(BASE_URL, requestOptions);
  let data = await response.json();
  console.log(data);
}

/* PATCH , skriver/uppdaterar men skriver ej över */
async function patchMessage() {
  let messageObject = { text: "Hello world put", time: new Date() };

  const requestOptions = {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messageObject),
  };

  let response = await fetch(BASE_URL, requestOptions);
  let data = await response.json();
  console.log(data);
}
async function patchMessage2() {
  let messageObject = { firstName: "Alrik", lastName: "HE" };

  const requestOptions = {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messageObject),
  };

  let response = await fetch(
    "https://demo1-3c759-default-rtdb.europe-west1.firebasedatabase.app/-NoCf2s5SInOIFR3X0VX/.json",
    requestOptions
  );
  let data = await response.json();
  console.log(data);
}

/* POST */
async function postMessage() {
  let messageObject = { text: "Hello world", time: new Date() };

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(messageObject),
  };

  let response = await fetch(BASE_URL, requestOptions);
  let data = await response.json();
  console.log(data);
}

/* GET */
async function getMessages() {
  let response = await fetch(BASE_URL);
  let data = await response.json();
  console.log(data);
}

/* DELETE */
async function deleteMessage() {
  const requestOptions = {
    method: "DELETE",
  };
  let response = await fetch(BASE_URL, requestOptions);
  let data = await response.json();
  console.log(data);
}

// Function to check if the browser is in fullscreen mode
function checkFullscreen() {
  console.log("checking if fullscreen");
  if (
    window.innerHeight == screen.height &&
    window.innerWidth == screen.width
  ) {
    // In fullscreen
    document.body.className = "fullscreen";
  } else {
    // Not in fullscreen
    document.body.className = "";
  }
}

// Check fullscreen status every 10 seconds
// setInterval(checkFullscreen, 10000);


window.addEventListener('resize', checkFullscreen, true);


