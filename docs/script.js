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
} from "https://www.gstatic.com/firebasejs/9.16.0/firebase-database.js";

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
let nameInput = "";

// Event listener for the submit button
document.getElementById("btn").addEventListener("click", () => {
  nameInput = nameField.value;
  if (nameInput.length > 0) {
    document.getElementById("btn").innerText = "Your name: " + nameInput;
    document.getElementById("btn").disabled = true;  // Disable button after submission
  }
});

// When user clicks the input field, reset the button and input field
nameField.addEventListener("click", () => {
  nameField.value = "";  // Clear the input field
  document.getElementById("btn").innerText = "Submit Name";  // Reset the button text
  document.getElementById("btn").disabled = false;  // Re-enable the button
});

// Allow the user to submit by pressing Enter in the text input
nameField.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    document.getElementById("btn").click();  // Trigger the button click programmatically
    nameField.blur();  // Remove focus from input field
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

// Function to determine if text should be black or white based on background color
function getTextColor(bgColor) {
  const r = parseInt(bgColor.substr(1, 2), 16);
  const g = parseInt(bgColor.substr(3, 2), 16);
  const b = parseInt(bgColor.substr(5, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? 'black' : 'white';
}

document.getElementById("content").addEventListener("click", (event) => {
  const btn = document.getElementById("btn"); // Correcting reference to btn
  if (btn.disabled === true) { // Ensure the button is disabled (name has been submitted)
    if (nameInput.length > 0) {  // Check that the name has been set
      var promptMessage = prompt("Write your message:", "message");
      if (promptMessage == null) return; // If user cancels the prompt, exit.

      const chosenColor = document.getElementById("post-it-color").value;
      var x = Math.round((event.clientX / window.innerWidth) * 100 - 3);
      var y = Math.round((event.clientY / window.innerHeight) * 100 - 5);

      push(ref(db, "/"), {
        username: "Alrik",
        dateOfCreation: new Date().toString(),
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
          bold: document.getElementById("boldCheckbox").checked,
        },
      });
    } else {
      alert("You need to submit a name first.");
    }
  } else {
    alert("Warning! Your post has no author. Please submit a name in the field and confirm.");
    nameField.style.backgroundColor = "red";
    setTimeout(() => {
      nameField.style.backgroundColor = null;
    }, 500);
  }
});

// Handle deleting all notes
document.getElementById('delete-all-btn').addEventListener('click', () => {
  if (!confirm("Are you sure?")) return; // David Rhodin
  remove(ref(db, "/"));
});

// Firebase child added event
onChildAdded(ref(db, "/"), (data) => {
  let d = data.val();
  const italicClass = d.attributes?.italic ? " italic" : "";
  const boldClass = d.attributes?.bold ? " bold" : "";
  const combinedClasses = `${italicClass}${boldClass}`;
  const messageId = data.key;
  const messageHTML = `<strong>${d.author}:</strong> ${d.message}`;
  const textColor = getTextColor(d.color); // Auto text color based on background color

  // 💧 Step 1: Insert message into the bubble
  document.getElementById("content").insertAdjacentHTML(
    "beforeend",
    `<div class="bubble-wrapper" id="wrap-${data.key}" style="left:${d.x}vw; top:${d.y}vh;">
      <div class="bubble-effect" id="effect-${data.key}">
        <div id="msg-${data.key}" style="color:${textColor};">${messageHTML}</div>
      </div>
    </div>`
  );

  // 💥 Step 2: After 600ms – Replace with the actual bubble and activate functionality
  setTimeout(() => {
    const wrapper = document.getElementById(`wrap-${data.key}`);
    const msgContent = document.getElementById(`msg-${data.key}`)?.innerHTML;

    if (wrapper && msgContent) {
      wrapper.innerHTML = `
        <div class="splash-explosion"></div>
        <p class="bubble${combinedClasses}" id="${data.key}" style="background-color:${d.color}; color:${textColor}; --bubble-color:${d.color};">
          ${msgContent}
          <br/>
          <button id="like-btn-${messageId}" class="emoji-btn">👍</button>
          <span id="like-count-${messageId}">${d.likes || 0}</span>
          <button id="dislike-btn-${messageId}" class="emoji-btn">👎</button>
          <span id="dislike-count-${messageId}">${d.dislikes || 0}</span>
        </p>
      `;

      // 💨 Remove splash effect after animation
      setTimeout(() => {
        wrapper.querySelector(".splash-explosion")?.remove();
      }, 600);

      // 👍 Like button
      document.getElementById(`like-btn-${messageId}`)?.addEventListener("click", (event) => {
        event.stopPropagation();
        likeMessage(messageId);
      });

      // 👎 Dislike button
      document.getElementById(`dislike-btn-${messageId}`)?.addEventListener("click", (event) => {
        event.stopPropagation();
        dislikeMessage(messageId);
      });

      // 🔄 Live update
      onValue(ref(db, `/${messageId}/likes`), (snapshot) => {
        document.getElementById(`like-count-${messageId}`).textContent = snapshot.val() || 0;
      });

      onValue(ref(db, `/${messageId}/dislikes`), (snapshot) => {
        document.getElementById(`dislike-count-${messageId}`).textContent = snapshot.val() || 0;
      });

      // 🚫 Disable right-click
      const bubble = document.getElementById(data.key);
      bubble.addEventListener("contextmenu", (event) => event.preventDefault());

      // 🧼 Remove message on right-click
      bubble.addEventListener("mouseup", (event) => {
        if (event.button === 2) {
          alert("Delete message?");
          bubble.remove();
          remove(ref(db, bubble.id));
        }
      });
    }
  }, 600);
});

// Firebase child removed event
onChildRemoved(ref(db, "/"), (data) => {
  document.getElementById(data.key)?.remove();
});


document.getElementById("insertSmileyBtn").addEventListener("click", function() {
  const contentDiv = document.getElementById("content");
  
  // Create a new paragraph element with the smiley emoji
  const smileyParagraph = document.createElement("p");
  smileyParagraph.classList.add("bubble"); // Optional, add a class for styling
  
  // Add a smiley emoji (you can change this emoji to others)
  smileyParagraph.textContent = "😊"; // You can change this emoji to others
  
  // Append the new paragraph to the content div
  contentDiv.appendChild(smileyParagraph);
});

// Random Color Generator Function
document.getElementById("randomColorBtn").addEventListener("click", function() {
  const contentDiv = document.getElementById("content");
  
  // Generate a random hex color
  const randomColor = "#" + Math.floor(Math.random() * 16777215).toString(16);
  
  // Set the random color as the background color of the content div
  contentDiv.style.backgroundColor = randomColor;
});

