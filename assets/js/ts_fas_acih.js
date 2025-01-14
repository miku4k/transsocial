// katniny Firebase Configuration
const firebaseConfig = {
   apiKey: "REPLACE",
   authDomain: "REPLACE",
   databaseURL: "REPLACE",
   projectId: "REPLACE",
   storageBucket: "REPLACE",
   messagingSenderId: "REPLACE",
   appId: "REPLACE",
   measurementId: "REPLACE"
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();
const storageRef = storage.ref();
const timestamp = firebase.database.ServerValue.TIMESTAMP

// Get the current URL. This is going to prevent functions that don't need to run on a page from running.
const currentURL = window.location.href;
const pageURL = new URL(currentURL);
const pathName = pageURL.pathname;
let isOnDesktopApp = null;

// Quote renote ID
let renotingNote = null;

function quoteRenote(id) {
   renotingNote = id;
   createNotePopup();
}

// Read cookies
let cookies = document.cookie;
if (cookies == "cookieAcceptance=true") {
   if (pathName === "/" || pathName === "/index.html" || pathName === "/index") {
      document.getElementById("cookie-notice").style.display = "none";
   }
}

// Implement character limit
const noteText = document.getElementById('noteContent-textarea');
const maxCharacters = 1250;

if (noteText) {
   noteText.addEventListener('input', () => {
      const currentLength = noteText.value.length;

      if (currentLength > maxCharacters) {
         noteText.value = noteText.value.substring(0, maxCharacters);
      }

      document.getElementById("characterLimit_note").textContent = `${currentLength}/1,250`;
   });
}

if (document.getElementById("editNoteContent")) {
   const newNoteContentText = document.getElementById("newTextContent");

   document.getElementById("editNoteContent").addEventListener("input", () => {
      const currentLength = newNoteContentText.value.length;

      if (currentLength > maxCharacters) {
         newNoteContentText.value = newNoteContentText.value.substring(0, maxCharacters);
      }

      document.getElementById("newTextContent-characterLimit").textContent = `${currentLength}/1,250`;
   })
}

if (document.getElementById("displayName-text")) {
   const displayNameText = document.getElementById("displayName-text");
   const maxDisplay = 25;

   displayNameText.addEventListener("input", () => {
      const currentLength = displayNameText.value.length;

      if (currentLength > maxDisplay) {
         displayNameText.value = displayNameText.value.substring(0, maxDisplay);
      }

      document.getElementById("characterLimit_display").textContent = `${currentLength}/25`;
   })
}

if (document.getElementById("username-text")) {
   const usernameText = document.getElementById("username-text");
   const maxUser = 20;

   usernameText.addEventListener("input", () => {
      const currentLength = usernameText.value.length;

      if (currentLength > maxUser) {
         usernameText.value = usernameText.value.substring(0, maxUser);
      }

      document.getElementById("characterLimit_username").textContent = `${currentLength}/20`;
   })
}

if (document.getElementById("pronouns-text")) {
   const pronounsText = document.getElementById("pronouns-text");
   const maxPronouns = 15;

   pronounsText.addEventListener("input", () => {
      const currentLength = pronounsText.value.length;

      if (currentLength > maxPronouns) {
         pronounsText.value = pronounsText.value.substring(0, maxPronouns);
      }

      document.getElementById("characterLimit_pronouns").textContent = `${currentLength}/15`;
   })
}

if (document.getElementById("bioText")) {
   const bioText = document.getElementById("bioText");
   const maxBio = 500;

   bioText.addEventListener("input", () => {
      const currentLength = bioText.value.length;

      if (currentLength > maxBio) {
         bioText.value = bioText.value.substring(0, maxBio);
      }

      document.getElementById("characterLimit_bio").textContent = `${currentLength}/500`;
   })
}

// Constantly check user's suspension status
if (pathName !== "/suspended.html" || pathName !== "/suspended") {
   firebase.auth().onAuthStateChanged((user) => {
      // Firstly, check if the user even exists. If they don't return.
      if (user) {
         const suspensionRef = firebase.database().ref("users/" + user.uid);
         suspensionRef.on("value", (snapshot) => {
            const data = snapshot.val();

            if (data.suspensionStatus === null || data.suspensionStatus === undefined) {
               return false; // That means they aren't suspended/never have been and can use TransSocial as intended.
            } else if (data.suspensionStatus === "allowed") {
               return false; // This means that they have been suspended before but currently aren't. Allow them to continue.
            } else if (data.suspensionStatus === "suspended") {
               if (pathName !== "/suspended" && pathName !== "/suspended.html") {
                  window.location.replace("/suspended"); // They are suspended. Redirect them to let them know.
               }
            }
         })
      } else {
         return false; // User isn't logged in, there is no way for them to be suspended.
      }
   });
};

if (pathName === "/suspended.html" || pathName === "/suspended") {
   firebase.auth().onAuthStateChanged((user) => {
      // Firstly, check if the user even exists. If they don't return.
      if (user) {
         const suspensionRef = firebase.database().ref("users/" + user.uid);
         suspensionRef.on("value", (snapshot) => {
            const data = snapshot.val();
            //console.log(data);

            if (data.suspensionStatus === null || data.suspensionStatus === undefined) {
               window.location.replace("/"); // That means they aren't suspended and can use TransSocial as intended.
            } else if (data.suspensionStatus === "allowed") {
               window.location.replace("/"); // This means that they have been suspended before but currently aren't. Allow them to continue.
            } else if (data.suspensionStatus === "suspended") {
               document.getElementById("reasonForBeingSuspended").textContent = data.suspensionNotes.reason;
               document.getElementById("suspensionExpiration").textContent = data.suspensionNotes.expiration;
            }
         })
      } else {
         window.location.replace("/");
         return false;
      }
   });
}

// Get notifications
let unreadNotifications = null;

firebase.auth().onAuthStateChanged((user) => {
   if (user) {
      firebase.database().ref(`users/${user.uid}/notifications/unread`).on("value", (snapshot) => {
         unreadNotifications = snapshot.val();

         if (pathName === "/notifications" || pathName === "/notifications.html") {
            document.getElementById("notificationsSidebar").innerHTML = `<button class="active"><i class="fa-solid fa-bell"></i> Notifications (${unreadNotifications})</button>`;
         } else {
            document.getElementById("notificationsSidebar").innerHTML = `<button><i class="fa-solid fa-bell"></i> Notifications (${unreadNotifications})</button>`;
         }
      })
   }
})

// Check for updates
// let currentTransSocialVersion = "v0.0.3_indev";
// firebase.database().ref("DONOTMODIFY").on("value", (snapshot) => {
//     if (pathName !== "/update") {
//         let transsocialServerVersion = snapshot.val();

//         if (currentTransSocialVersion !== transsocialServerVersion.transsocial) {
//             window.location.replace("/update");
//         } 
//     }
// })

// TransSocial Update
firebase.auth().onAuthStateChanged((user) => {
   if (user) {
      firebase.database().ref(`users/${user.uid}`).on("value", (snapshot) => {
         const hasDoneIt = snapshot.val();

         if (hasDoneIt.readv0071UpdateLog === undefined || hasDoneIt.readv0071UpdateLog === false) {
            document.getElementById("newestUpdates").showModal();
         } else {
            // don't execute anything else
         }
      })
   } else {
      document.getElementById("newestUpdates").showModal();
   }
})

function closeUploadLog() {
   document.getElementById("newestUpdates").close();

   firebase.auth().onAuthStateChanged((user) => {
      if (user) {
         firebase.database().ref(`users/${user.uid}`).update({
            readv0071UpdateLog: true,
         })
      }
   })
}

// If the user is on the 404 page, change the page URL to be the page they are on.
if (document.getElementById("404page")) {
   document.getElementById("404page").textContent = `We were unable to find ${pathName}. The page does not exist, got moved, or got lost to time.`;

   const pageWithoutSlash = pathName.substring(1);
   document.getElementById("profile404").href = `/u?id=${pageWithoutSlash}`;
}

// If user is on the register page and is not signed in, redirect to katniny.com
if (pathName === "/auth/register" || pathName === "/auth/register.html") {
   firebase.auth().onAuthStateChanged((user) => {
      if (user) {
         window.location.replace("/");
      } else {
         window.location.replace("https://katniny.com/ts/prepare/acc");
      }
   })
}

// Register Function
function register() {
   if (pathName === "/auth/register.html" || pathName === "/auth/register") {
      // Get all the input fields
      email = document.getElementById('email').value;
      password = document.getElementById('password').value;
      errorTxt = document.getElementById('errorTxt');

      // Validate Input Fields
      if (validate_email(email) == false || validate_password(password) == false) {
         // Alert User and don't continue running code
         errorTxt.innerHTML = "Your email or password is invalid. Please try again.";
         errorTxt.style.color = 'red';
         return;
      }

      // If everything is valid, continue with auth
      auth.createUserWithEmailAndPassword(email, password)
         .then(function () {
            // Create user
            const user = auth.currentUser;

            document.getElementById("body").setAttribute("onload", "null");

            //window.location.replace("/auth/name");
         })
         .catch(function (error) {
            // Firstly, create variables for the Error Code and Error Message
            const error_code = error.code;
            const error_message = error.message;
            // Then, alert the user of the error
            errorTxt.innerHTML = error_message;
            errorTxt.style.color = 'red';
         })
   }
}

// Login Function
function login() {
   if (pathName === "/auth/login.html" || pathName === "/auth/login") {
      // Get input fields
      email = document.getElementById('email').value;
      password = document.getElementById('password').value;
      const errorTxt = document.getElementById("errorTxt");

      // Validate Fields
      if (validate_email(email) == false || validate_password(password) == false) {
         errorTxt.textContent("Information provided is incorrect or account does not exist.");
         return;
      }

      auth.signInWithEmailAndPassword(email, password)
         .then(function () {
            // Create user
            const user = auth.currentUser;
            // Create User Data
            const database_ref = database.ref();
            const user_data = {
               last_login: Date.now()
            }
            // Save user data to the database
            database_ref.child('users/' + user.uid).update(user_data);
            // Finally, finally alert user that their account has been created & redirect
            window.location.replace("/auth/katniny");
         })
         .catch(function (error) {
            // Firstly, create variables for the Error Code and Error Message
            const error_code = error.code;
            const error_message = error.message;
            // Then, alert the user of the error
            errorTxt.textContent = error_message;
            errorTxt.style.color = "red";
         })
   }
}

// Sign Out User
function signOut() {
   firebase.auth().signOut().then(() => {
      window.location.replace("/");
   }).catch((error) => {
      alert("There was an unknown error signing out. Please refresh the page and try again.");
   })
}

// Validate Email Address
function validate_email(email) {
   expression = /^[^@]+@\w+(\.\w+)+\w$/
   if (expression.test(email) === true) {
      // Email is valid and can be used.
      return true;
   } else {
      // Email is invalid and cannot be used.
      return false;
   }
}

// Validate Password
function validate_password(password) {
   // Only accepts lengths greater than 6
   if (password < 6) {
      return false;
   } else {
      return true;
   }
}

// Validate Other Fields
function validate_field(field) {
   if (field == null) {
      return false;
   }

   if (field.length <= 0) {
      return false;
   } else {
      return true;
   }
}

// Hide error by default
function hideErrorByDefault() {
   const errorTxt = document.getElementById('errorTxt');
   errorTxt.innerHTML = '';
}

// Only allow user on page if they are signed in/signed out
function signedOutCheck() {
   firebase.auth().onAuthStateChanged((user) => {
      if (user) {
         // ...
      } else {
         window.location.replace("/");
      }
   })
}

function signedInCheck() {
   firebase.auth().onAuthStateChanged((user) => {
      if (user) {
         window.location.replace('/');
      } else {
         return;
      }
   })
}

// Check if the user is no longer part of the "legacy" account system
function isOnUsernames() {
   firebase.auth().onAuthStateChanged((user) => {
      if (user) {
         const uid = user.uid;
         const ref = firebase.database().ref(`users/${uid}/preRegister_Step`);

         ref.once("value")
            .then(function (snapshot) {
               const step = snapshot.exists();

               if (step === false) {
                  return true;
               } else if (step === true) {
                  window.location.replace('/ts/prepare/pfp.html');
               }
            })
      } else {
         // Don't do anything, page will redirect to sign up page by default
         return;
      }
   })
}

function isOnPfps() {
   firebase.auth().onAuthStateChanged((user) => {
      if (user) {
         const uid = user.uid;
         const ref = firebase.database().ref(`users/${uid}/preRegister_Step`);

         ref.once("value")
            .then(function (snapshot) {
               const step = snapshot.val();

               if (step === "pfp") {
                  return true;
               } else if (step !== "pfp") {
                  window.location.replace('/ts/prepare/pronouns.html');
               }
            })
      }
   })
}

function isOnPronouns() {
   firebase.auth().onAuthStateChanged((user) => {
      if (user) {
         const uid = user.uid;
         const ref = firebase.database().ref(`users/${uid}/preRegister_Step`);

         ref.once("value")
            .then(function (snapshot) {
               const step = snapshot.val();

               if (step === "pronouns") {
                  return true;
               } else if (step !== "pronouns") {
                  window.location.replace('/ts/finished/final.html');
               }
            })
      }
   })
}

function isFinished() {
   firebase.auth().onAuthStateChanged((user) => {
      if (user) {
         const uid = user.uid;
         const ref = firebase.database().ref(`users/${uid}/preRegister_Step`);

         ref.once("value")
            .then(function (snapshot) {
               const step = snapshot.val();

               if (step === "finished") {
                  return true;
               } else if (step !== "finished") {
                  window.location.replace('/ts/prepare/acc.html');
               }
            })
      }
   })
}

// Allow users to create a display and username
function usernames() {
   // Make sure to check for username availabilty first as display names can be anything
   // Get the username and display name inputs
   const insertedDisplay = document.getElementById('displayName').value;
   const insertedUsername = document.getElementById('username').value;
   // Read the database for the same username (if applicable)
   const ref = firebase.database().ref("taken-usernames/" + `${insertedUsername.toLowerCase()}`);
   // Get the error text
   const errorTxt = document.getElementById('errorTxt');

   ref.once("value")
      .then(function (snapshot) {
         // Creates a boolean based on a username exists or not
         const exists = snapshot.exists();
         // It exists...
         if (exists === true && insertedUsername !== '') {
            errorTxt.innerHTML = 'Aw, that username is taken! Try another!';
            errorTxt.style.color = 'rgb(255, 73, 73)';
            // It does not exist!
         } else if (exists === false && insertedUsername !== '') {
            // Get current user and assign them to a variable
            const user = firebase.auth().currentUser;
            // Write user data to the database
            firebase.database().ref('users/' + user.uid).set({
               display: insertedDisplay,
               username: insertedUsername,
               email: user.email,
               preRegister_Step: "pfp",
            })
            // Add username to unavailable list
            firebase.database().ref('taken-usernames/' + insertedUsername).set({
               taken: true
            })

            // Redirect user to next step 
            window.location.replace('/ts/prepare/pfp.html')
            // Input value is empty...
         } else if (insertedUsername === '') {
            errorTxt.innerHTML = 'Username cannot be empty.';
            errorTxt.style.color = 'rgb(255, 73, 73)';
            // An error occurred...
         } else {
            errorTxt.innerHTML = "An unknown error occurred.";
         }
      });
}

function usernameCharacters() {
   // Prevent characters "`~!@#$%^&*()-+=\|]}{[;:'",/?"
   event.target.value = event.target.value.replace(/[^a-z 1-9 . _]/g, '');
   // Prevent spaces
   event.target.value = event.target.value.replace(/[ ]/g, '');
}

// Preview Upload PFPs
function previewPfp() {
   const image = document.getElementById('previewImg');
   image.src = URL.createObjectURL(event.target.files[0]);
}

// Allow user to upload profile picture
function uploadPfp() {
   const storageRef = firebase.storage().ref();
   const uploadedImg = document.getElementById('pfpUploader').files[0];
   const reader = new FileReader();
   const error = document.getElementById('errorTxt');

   const metadata = {
      contentType: "image/pfp",
   };

   firebase.auth().onAuthStateChanged((user) => {
      if (user) {
         const uid = user.uid;
         const imgRef = firebase.database().ref("users/" + uid)
         const storageRef = firebase.storage().ref();

         if (uploadedImg) {
            reader.readAsDataURL(uploadedImg);
            const uploadTask = storageRef.child(`images/pfp/${uid}/${uploadedImg.name}`).put(uploadedImg);
            uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
               (snapshot) => {
                  // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                  const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                  errorTxt.style.display = 'block';
                  errorTxt.style.color = 'green';
                  errorTxt.innerHTML = 'Uploading...' + progress + '%';
                  switch (snapshot.state) {
                     case firebase.storage.TaskState.RUNNING: // or 'running'
                        //console.log('Upload is running.');
                        break;
                  }
               },
               (error) => {
                  switch (error.code) {
                     case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                        break;
                     case 'storage/canceled':
                        // User canceled the upload
                        break;

                     // ...

                     case 'storage/unknown':
                        // Unknown error occurred, inspect error.serverResponse
                        break;
                  }
               },
               () => {
                  // Upload completed successfully, now we can get the download URL
                  uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                     firebase.database().ref('users/' + uid).update({
                        pfp: `${uploadedImg.name}`,
                        preRegister_Step: "pronouns",
                     });

                     window.location.replace('/ts/prepare/pronouns.html');
                  });
               }
            );
         } else {
            error.innerHTML = 'No image provided.';
            error.style.display = 'block';
            error.style.color = 'red';
            return false;
         }
      }
   })
}

// Upload pronouns
function pronouns() {
   // Get the pronoun input field
   const insertedPronouns = document.getElementById('pronouns').value;
   // Get the error text
   const errorTxt = document.getElementById('errorTxt');

   // Get current user and assign them to a variable
   const user = firebase.auth().currentUser;
   // Write user data to the database
   firebase.database().ref('users/' + user.uid).update({
      pronouns: insertedPronouns,
      preRegister_Step: "finished",
   });

   window.location.replace('/ts/finished/final.html');
}

// Finished Profile Card
function profileCard() {
   // PFP stuff
   const userPfp = document.getElementById('userPfp');
   // Display Name Stuff
   const userDisplay = document.getElementById('userDisplay');
   // Username Stuff
   const userUsername = document.getElementById('userUsername');
   // Pronouns Stuff
   const userPronouns = document.getElementById('userPronouns');

   firebase.auth().onAuthStateChanged((user) => {
      if (user) {
         const uid = user.uid;

         // Get the users PFP and set it as userPfp.src
         const pfpRef = firebase.database().ref(`users/${uid}/pfp`);

         pfpRef.once("value")
            .then(function (snapshot) {
               const step = snapshot.val();
               const imageRef = storageRef.child(`images/pfp/${uid}/${step}`)

               imageRef.getDownloadURL()
                  .then((url) => {
                     userPfp.src = url;
                  })
            })

         // Display user display name
         const displayRef = firebase.database().ref(`users/${uid}/display`);

         displayRef.once("value")
            .then(function (snapshot) {
               const display = snapshot.val();

               userDisplay.innerHTML = display;
            })


         // Display user username
         const usernameRef = firebase.database().ref(`users/${uid}/username`);

         usernameRef.once("value")
            .then(function (snapshot) {
               const username = snapshot.val();

               userUsername.innerHTML = `@${username}`;
            })

         // Display user pronouns
         const pronounRef = firebase.database().ref(`users/${uid}/pronouns`);

         pronounRef.once("value")
            .then(function (snapshot) {
               const pronouns = snapshot.val();

               userPronouns.innerHTML = pronouns;

               if (pronouns === '') {
                  userDisplay.style.marginTop = "8px";
               }
            })
      }
   })
}

// Get user's pfp
function getUserPfpSidebar() {
   // PFP stuff
   const userPfp = document.getElementById('userPfp-sidebar');

   firebase.auth().onAuthStateChanged((user) => {
      if (user) {
         const uid = user.uid;

         // Get the users PFP and set it as userPfp.src
         const pfpRef = firebase.database().ref(`users/${uid}/pfp`);

         pfpRef.once("value")
            .then(function (snapshot) {
               const step = snapshot.val();
               const imageRef = storageRef.child(`images/pfp/${uid}/${step}`)

               imageRef.getDownloadURL()
                  .then((url) => {
                     userPfp.src = url;
                  })
            })
      }
   })
}

function getUserInfoSidebar() {
   firebase.auth().onAuthStateChanged((user) => {
      if (user) {
         const uid = user.uid;
         const displayNameSidebar = document.getElementById("displayName-sidebar");
         const usernameSidebar = document.getElementById("username-pronouns-sidebar");

         const displayNameRef = firebase.database().ref(`users/${uid}/display`);

         displayNameRef.once("value")
            .then(function (snapshot) {
               const display = snapshot.val();

               displayNameSidebar.textContent = display;
            })

         const usernameRef = firebase.database().ref(`users/${uid}/username`);

         usernameRef.once("value")
            .then(function (snapshot) {
               const username = snapshot.val();

               usernameSidebar.textContent = "@" + username;
            })
      }
   })
}

// Link Button to Account
function linkButtonToAcc() {
   firebase.auth().onAuthStateChanged((user) => {
      if (user) {
         const uid = user.uid;
         const button = document.getElementById('linkToAcc');

         // Username Ref
         const usernameRef = firebase.database().ref(`users/${uid}/username`);

         usernameRef.once("value")
            .then(function (snapshot) {
               const username = snapshot.val();

               button.href = `/u?id=${username}`;
            })
      }
   })
}

// If a user tries to do something that is locked behind being signed in, give them a prompt to do so.
function loginPrompt() {
   const loginModal = document.getElementById("signInPrompt");

   loginModal.showModal();
}

// Hyperlinking
function escapeHtml(str) {
   const div = document.createElement('div');
   div.textContent = str;
   return div.innerHTML;
}

function linkify(text) {
   const urlPattern = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
   const usernamePattern = /@(\w+)/g;

   let linkedText = text.replace(urlPattern, '<a href="$1" target="_blank">$1</a>');
   linkedText = linkedText.replace(usernamePattern, '<a href="/u?id=$1">@$1</a>');

   return linkedText;
}

function sanitizeAndLinkify(text) {
   const escapedText = escapeHtml(text);
   return linkify(escapedText);
}

// Old Code
// function loadNotes() {
//     const notesRef = firebase.database().ref("notes"); 
//     notesRef.once("value").then((snapshot) => {
//         const noteDataWithKeys = [];

//         snapshot.forEach(childSnapshot => {
//             const key = childSnapshot.key;
//             const data = childSnapshot.val();
//             noteDataWithKeys.push({ key, data }); 
//         });

//         // Logging before sorting
//         noteDataWithKeys.forEach(item => {
//             console.log("Before sorting: " + item.data.createdAt); 
//         });

//         noteDataWithKeys.sort((a, b) => a.data.createdAt - b.data.createdAt); 

//         // Logging after sorting
//         noteDataWithKeys.forEach(item => {
//             console.log("After sorting: " + item.data.createdAt); 
//         });

//         noteDataWithKeys.forEach(item => {
//             renderNote(item.data, item.key); 
//         });
//     });
// }

// function loadNotesFromButton(loadInitial = true) {
//     window.location.reload();
// }

// function handleSnapshot(snapshot) {
//     const noteArray = []; // Use an array to maintain order

//     snapshot.forEach(function(childSnapshot) {
//         const noteId = childSnapshot.key; 
//         const noteData = childSnapshot.val();
//         noteArray.push({id: noteId, ...noteData}); 
//     });

//     // Render notes 
//     noteArray.forEach((noteData) => {
//         const noteId = noteData.id;

//         if (!loadedNotesId.includes(noteId)) {
//             renderNote(noteData, noteId);
//             loadedNotesId.push(noteId);
//         }

//         //console.log("noteArray: " + noteArray);
//     });

//     isLoading = false; 
// }

// // check gemini
// function renderNote(noteData, noteId) {
//     const uid = noteData.whoSentIt;
//         database.ref("users/" + uid).once("value", (userSnapshot) => {
//             const userData = userSnapshot.val();

//             const newNoteDiv = document.createElement("div");
//             newNoteDiv.classList.add("note");

//             // Create elements for user info
//             const userImage = document.createElement("img");
//             userImage.classList.add("notePfp");
//             userImage.src = `https://firebasestorage.googleapis.com/v0/b/chat-transsocial-test.appspot.com/o/images%2Fpfp%2F${uid}%2F${userData.pfp}?alt=media`;

//             const displayNameElement = document.createElement("a");
//             displayNameElement.textContent = userData.display;
//             displayNameElement.classList.add("noteDisplay");

//             const usernameElement = document.createElement("a");
//             if (userData.pronouns === "") {
//                 usernameElement.textContent = `@${userData.username}`;
//             } else {
//                 usernameElement.textContent = `@${userData.username} • ${userData.pronouns}`;
//             }
//             usernameElement.classList.add("noteUsername");

//             // Create element for text content
//             const noteElement = document.createElement("p");
//             noteElement.textContent = noteData.text;
//             noteElement.classList.add("noteText"); 
//             if (pathName !== "/note.html" && pathName !== "/note") {
//                 noteElement.setAttribute("onclick", `window.location.href="/note?id=${noteId}"`);
//             }

//             // Other stuff
//             const breakpoint = document.createElement("br");
//             const like = document.createElement("p");
//             const renote = document.createElement("p");
//             const reply = document.createElement("p");
//             const contentWarning = document.createElement("div");

//             // Love Button
//             like.classList.add("likeBtn");

//             // Renote Button
//             renote.classList.add("renoteBtn");

//             // Reply Button
//             reply.classList.add("replyBtn");
//             if (pathName !== "/note.html" && pathName !== "/note") {
//                 reply.setAttribute("onclick", `window.location.href="/note?id=${noteId}"`);
//             } else {
//                 reply.setAttribute("onclick", `replyToNote(this)`);
//             }

//             // Content Warning
//             contentWarning.classList.add("contentWarning");

//             // Check if the note was already liked. This isn't needed to love/unlove a note, but it shows the user that they have.
//             if (noteData.likes === null || noteData.likes === undefined) {
//                 like.innerHTML = `<i class="fa-solid fa-heart"></i> 0`;
//             } else {
//                 firebase.auth().onAuthStateChanged((user) => {
//                     if (user) {
//                         const uid = user.uid;

//                         if (noteData.whoLiked && noteData.whoLiked[uid]) {
//                             like.innerHTML = `<i class="fa-solid fa-heart"></i> ${noteData.likes}`;
//                             if (pathName === "/" || pathName === "/index.html" || pathName === "/index") {
//                                 document.getElementById(`like-${noteData.id}`).classList.add("liked");
//                             } else {
//                                 //document.getElementById(`like-${noteData.id}`).classList.add("liked");
//                             }
//                         } else {
//                             like.innerHTML = `<i class="fa-solid fa-heart"></i> ${noteData.likes}`;
//                         }
//                     } else {
//                         like.innerHTML = `<i class="fa-solid fa-heart"></i> ${noteData.likes}`;
//                     }
//                 })
//             };

//             // Check if the note was already renoted. This isn't needed to renote/unrenote a note, but it shows the user that they have.
//             if (noteData.renotes === null || noteData.renotes === undefined) {
//                 renote.innerHTML = `<i class="fa-solid fa-retweet"></i> 0`;
//             } else {
//                 firebase.auth().onAuthStateChanged((user) => {
//                     if (user) {
//                         const uid = user.uid;

//                         if (noteData.whoRenoted && noteData.whoRenoted[uid]) {
//                             renote.innerHTML = `<i class="fa-solid fa-retweet"></i> ${noteData.renotes}`;
//                             if (pathName === "/index.html" || pathName === "/" || pathName === "/index") {
//                                 document.getElementById(`renote-${noteData.id}`).classList.add("renoted");
//                             }
//                         } else {
//                             renote.innerHTML = `<i class="fa-solid fa-retweet"></i> ${noteData.renotes}`;
//                         }
//                     } else {
//                         renote.innerHTML = `<i class="fa-solid fa-retweet"></i> ${noteData.renotes}`;
//                     }
//                 })
//             };

//             if (noteData.renotes === null || noteData.renotes === undefined) {
//                 renote.innerHTML = `<i class="fa-solid fa-retweet"></i> 0`;
//             } else {
//                 renote.innerHTML = `<i class="fa-solid fa-retweet"></i> ${noteData.renotes}`;
//             };

//             if (noteData.replies === null || noteData.replies === undefined) {
//                 reply.innerHTML = `<i class="fa-solid fa-comment"></i> 0`;
//             } else {
//                 reply.innerHTML = `<i class="fa-solid fa-comment"></i> ${noteData.replies}`;
//             };

//             // Show elements
//             if (noteData.isNsfw === true) {
//                 const warningNsfw = document.createElement("p");
//                 const warningNsfwInfo = document.createElement("p");
//                 const closeWarning = document.createElement("button");

//                 closeWarning.classList.add("closeWarning");

//                 warningNsfw.textContent = "Note may contain NSFW content.";
//                 warningNsfw.classList.add("warning");
//                 warningNsfw.setAttribute("id", `${noteData.id}-warning`);
//                 warningNsfwInfo.textContent = "The creator of the note flagged their note as having NSFW content.";
//                 warningNsfwInfo.classList.add("warningInfo");
//                 warningNsfwInfo.setAttribute("id", `${noteData.id}-warningInfo`);
//                 closeWarning.textContent = "View";
//                 closeWarning.classList.add("closeWarning");
//                 closeWarning.setAttribute("id", `${noteData.id}-closeWarning`);
//                 closeWarning.setAttribute("onclick", "removeNsfw(this.id);");

//                 contentWarning.setAttribute("id", `${noteData.id}-blur`);

//                 newNoteDiv.appendChild(contentWarning);
//                 newNoteDiv.appendChild(warningNsfw);
//                 newNoteDiv.appendChild(warningNsfwInfo);
//                 newNoteDiv.appendChild(closeWarning);

//                 firebase.auth().onAuthStateChanged((user) => {
//                     if (user) {
//                         firebase.database().ref(`users/${user.uid}`).on("value", (snapshot) => {
//                             const preferences = snapshot.val();

//                             if (preferences.showNsfw === undefined) {
//                                 newNoteDiv.style.display = "none";
//                             } else if (preferences.showNsfw === "Hide") {
//                                 newNoteDiv.style.display = "none";
//                             } else if (preferences.showNsfw === "Blur") {
//                                 // Do whatever
//                             } else if (preferences.showNsfw === "Show") {
//                                 document.getElementById(`${noteId}-warning`).remove();
//                                 document.getElementById(`${noteId}-closeWarning`).remove();
//                                 document.getElementById(`${noteId}-warningInfo`).remove(); 
//                                 document.getElementById(`${noteId}-blur`).remove();
//                             }
//                         })
//                     } else {
//                         newNoteDiv.style.display = "none";
//                     }
//                 })
//             } else if (noteData.isSensitive === true) {
//                 const warningSensitive = document.createElement("p");
//                 const warningSensitiveInfo = document.createElement("p");
//                 const closeSensitiveWarning = document.createElement("button");

//                 closeSensitiveWarning.classList.add("closeWarning");
//                 warningSensitive.textContent = "Note may contain sensitive content.";
//                 warningSensitive.classList.add("warning");
//                 warningSensitive.setAttribute("id", `${noteData.id}-warning`);
//                 warningSensitiveInfo.textContent = "The creator of the note flagged their note as having sensitive content.";
//                 warningSensitiveInfo.classList.add("warningInfo");
//                 warningSensitiveInfo.setAttribute("id", `${noteData.id}-warningInfo`);
//                 closeSensitiveWarning.textContent = "View";
//                 closeSensitiveWarning.classList.add("closeWarning");
//                 closeSensitiveWarning.setAttribute("id", `${noteData.id}-closeWarning`);
//                 closeSensitiveWarning.setAttribute("onclick", "removeSensitive(this.id);");

//                 contentWarning.setAttribute("id", `${noteData.id}-blur`);

//                 newNoteDiv.appendChild(contentWarning);
//                 newNoteDiv.appendChild(warningSensitive);
//                 newNoteDiv.appendChild(warningSensitiveInfo);
//                 newNoteDiv.appendChild(closeSensitiveWarning);

//                 firebase.auth().onAuthStateChanged((user) => {
//                     if (user) {
//                         firebase.database().ref(`users/${user.uid}`).on("value", (snapshot) => {
//                             const preferences = snapshot.val();

//                             if (preferences.showSensitive === undefined) {
//                                 // bleh, do whatever. on default "blur".
//                             } else if (preferences.showSensitive === "Hide") {
//                                 newNoteDiv.style.display = "none";
//                             } else if (preferences.showSensitive === "Blur") {
//                                 // Do whatever
//                             } else if (preferences.showSensitive === "Show") {
//                                 document.getElementById(`${noteId}-warning`).remove();
//                                 document.getElementById(`${noteId}-warningInfo`).remove();
//                                 document.getElementById(`${noteId}-closeWarning`).remove(); 
//                                 document.getElementById(`${noteId}-blur`).remove();
//                             }
//                         })
//                     } else {
//                         newNoteDiv.style.display = "none";
//                     }
//                 })
//             } else {
//                 // Literally nothing needs to execute.
//                 // DON'T RETURN!! POSTS THAT AREN'T FLAGGED AS NSFW OR SENSITIVE WILL NOT SHOW UP!
//                 // TransSocial is NOT a porn site. We don't want that.
//             }

//             newNoteDiv.appendChild(userImage);

//             newNoteDiv.appendChild(displayNameElement);
//             displayNameElement.href = `/u?id=${userData.username}`;

//             newNoteDiv.appendChild(breakpoint);

//             newNoteDiv.appendChild(usernameElement);
//             usernameElement.href = `/u?id=${userData.username}`;

//             newNoteDiv.appendChild(noteElement);

//             if (noteData.image !== undefined) {
//                 const uploadedImage = document.createElement("img");
//                 uploadedImage.src = noteData.image;
//                 uploadedImage.classList.add("uploadedImg");
//                 uploadedImage.setAttribute("draggable", "false");
//                 newNoteDiv.appendChild(uploadedImage);
//             }

//             newNoteDiv.appendChild(like);
//             like.setAttribute("id", `like-${noteId}`);

//             newNoteDiv.appendChild(renote);
//             renote.setAttribute("id", `renote-${noteId}`);

//             newNoteDiv.appendChild(reply);

//             newNoteDiv.setAttribute("id", noteId);
//             if (pathName === "/u.html" || pathName === "/u") {
//                 const url = new URL(window.location.href);
//                 const userParam = url.searchParams.get("id");

//                 database.ref(`taken-usernames/${userParam}`).once("value", (snapshot) => {
//                     const profileExists = snapshot.val();

//                     if (profileExists.user !== null) {
//                         if (profileExists.user === noteData.whoSentIt) {
//                             if (!notesDiv.querySelector(`#${noteId}`)) { 
//                                 if (noteData.replyingTo === undefined) {
//                                     notesDiv.appendChild(newNoteDiv); 
//                                 }
//                             }
//                             // addHyperlinks("noteText");
//                             if (pathName === "/" || pathName === "/index.html" || pathName === "/index") {
//                                 document.getElementById("newNotesAvailable").style.display = "none";
//                             }
//                         }
//                     }
//                 }) 
//             } else {
//                 if (!notesDiv.querySelector(`#${noteId}`)) { 
//                     if (pathName === "/note.html" || pathName === "/note") {
//                         const url = new URL(window.location.href);
//                         const noteParam = url.searchParams.get("id");

//                         database.ref(`notes/${noteId}`).once("value", (snapshot) => {
//                             const note = snapshot.val();

//                             if (note.replyingTo === noteParam) {
//                                 notesDiv.appendChild(newNoteDiv);
//                             }
//                         })
//                     } else {
//                         if (noteData.replyingTo === undefined) {
//                             notesDiv.appendChild(newNoteDiv); 
//                             notesDiv.appendChild(newNoteDiv);
//                         }
//                         document.getElementById("newNotesAvailable").style.display = "none";
//                     }  
//                 }
//                 // addHyperlinks("noteText");

//             }
//         })
// }

// loadNotes();

// Note Loading
let notesRef = firebase.database().ref('notes');
const notesDiv = document.getElementById("notes");
const batchSize = null;
let isLoading = false;
let lastVisibleNoteId = null;
let loadedNotesId = [];

if (pathName === "/" || pathName === "/index.html" || pathName === "/index" || pathName === "/u" || pathName === "/u.html" || pathName === "/note" || pathName === "/note.html") {
   // Reload page
   function loadNotesFromButton() {
      window.location.reload();
   }

   // Note Rendering
   function createNoteDiv(noteContent) {
      const noteDiv = document.createElement('div');
      noteDiv.className = 'note';
      noteDiv.setAttribute("id", `${noteContent.id}`);
      return noteDiv;
   }

   // retrieve data from the "notes" node
   notesRef.once('value')
      .then(function (snapshot) {
         const notesArray = [];
         snapshot.forEach(function (childSnapshot) {
            const noteContent = childSnapshot.val();
            notesArray.push(noteContent);
         });

         // sort notes by timestamp, newest first
         notesArray.sort((a, b) => b.createdAt - a.createdAt);

         // create and append divs for each note
         const notesContainer = document.getElementById('notes');
         notesArray.forEach(noteContent => {
            const noteDiv = createNoteDiv(noteContent);
            if (document.getElementById("newNotesAvailable")) {
               document.getElementById("newNotesAvailable").style.display = "none";
            }

            // Check if the note has NSFW/Sensitive content and users preferences
            // Do this immediately or bugs will arise (that I don't feel like fixing)
            if (noteContent.isNsfw === true) {
               firebase.auth().onAuthStateChanged((user) => {
                  if (user) {
                     firebase.database().ref(`users/${user.uid}`).once("value", (snapshot) => {
                        const showNsfw = snapshot.val();

                        if (showNsfw.showNsfw === "Show") {
                           // No need to do anything. It'll do it as is.
                        } else if (showNsfw.showNsfw === "Blur") {
                           // The actual cover
                           const cover = document.createElement("div");
                           cover.classList.add("contentWarning");
                           cover.setAttribute("id", `${noteContent.id}-blur`);

                           // Warning Header
                           const warning = document.createElement("p");
                           warning.setAttribute("id", `${noteContent.id}-warning`);
                           warning.classList.add("warning");
                           warning.textContent = "Note may contain NSFW content.";

                           // Warning Info
                           const warningInfo = document.createElement("p");
                           warningInfo.classList.add("warningInfo");
                           warningInfo.setAttribute("id", `${noteContent.id}-warningInfo`);
                           warningInfo.textContent = "The creator of this note flagged their note as having NSFW content.";

                           // Close Warning Button
                           const closeButton = document.createElement("button");
                           closeButton.classList.add("closeWarning");
                           closeButton.setAttribute("id", `${noteContent.id}-closeWarning`);
                           closeButton.setAttribute("onclick", "removeNsfw(this.id);");
                           closeButton.textContent = "View";

                           // Show all children
                           noteDiv.appendChild(cover);
                           noteDiv.appendChild(warning);
                           noteDiv.appendChild(warningInfo);
                           noteDiv.appendChild(closeButton);
                        } else if (showNsfw.showNsfw === "Hide") {
                           // We remove the note so the user doesn't have to see it
                           noteDiv.remove();
                        }
                     })
                  } else {
                     noteDiv.remove();
                  }
               })
            } else if (noteContent.isSensitive === true) {
               firebase.auth().onAuthStateChanged((user) => {
                  if (user) {
                     firebase.database().ref(`users/${user.uid}`).once("value", (snapshot) => {
                        const showNsfw = snapshot.val();

                        if (showNsfw.showSensitive === "Show") {
                           // No need to do anything. It'll do it as is.
                        } else if (showNsfw.showSensitive === "Blur") {
                           // The actual cover
                           const cover = document.createElement("div");
                           cover.classList.add("contentWarning");
                           cover.setAttribute("id", `${noteContent.id}-blur`);

                           // Warning Header
                           const warning = document.createElement("p");
                           warning.setAttribute("id", `${noteContent.id}-warning`);
                           warning.classList.add("warning");
                           warning.textContent = "Note may contain sensitive content.";

                           // Warning Info
                           const warningInfo = document.createElement("p");
                           warningInfo.classList.add("warningInfo");
                           warningInfo.setAttribute("id", `${noteContent.id}-warningInfo`);
                           warningInfo.textContent = "The creator of this note flagged their note as having sensitive content.";

                           // Close Warning Button
                           const closeButton = document.createElement("button");
                           closeButton.classList.add("closeWarning");
                           closeButton.setAttribute("id", `${noteContent.id}-closeWarning`);
                           closeButton.setAttribute("onclick", "removeNsfw(this.id);");
                           closeButton.textContent = "View";

                           // Show all children
                           noteDiv.appendChild(cover);
                           noteDiv.appendChild(warning);
                           noteDiv.appendChild(warningInfo);
                           noteDiv.appendChild(closeButton);
                        } else if (showNsfw.showSensitive === "Hide") {
                           // We remove the note so the user doesn't have to see it
                           noteDiv.remove();
                        }
                     })
                  } else {
                     noteDiv.remove();
                  }
               })
            } else if (noteContent.isPolitical === true) {
               firebase.auth().onAuthStateChanged((user) => {
                  if (user) {
                     firebase.database().ref(`users/${user.uid}`).once("value", (snapshot) => {
                        const showNsfw = snapshot.val();

                        if (showNsfw.showPolitics === "Show") {
                           // No need to do anything. It'll do it as is.
                        } else if (showNsfw.showPolitics === "Blur") {
                           // The actual cover
                           const cover = document.createElement("div");
                           cover.classList.add("contentWarning");
                           cover.setAttribute("id", `${noteContent.id}-blur`);

                           // Warning Header
                           const warning = document.createElement("p");
                           warning.setAttribute("id", `${noteContent.id}-warning`);
                           warning.classList.add("warning");
                           warning.textContent = "Note may contain political content.";

                           // Warning Info
                           const warningInfo = document.createElement("p");
                           warningInfo.classList.add("warningInfo");
                           warningInfo.setAttribute("id", `${noteContent.id}-warningInfo`);
                           warningInfo.textContent = "This note may contain political content. This note does not reflect TransSocial's opinions. This note may not be political and may be incorrectly flagged.";

                           // Close Warning Button
                           const closeButton = document.createElement("button");
                           closeButton.classList.add("closeWarning");
                           closeButton.setAttribute("id", `${noteContent.id}-closeWarning`);
                           closeButton.setAttribute("onclick", "removeNsfw(this.id);");
                           closeButton.textContent = "View";
                           closeButton.style.marginTop = "25px";

                           // Show all children
                           noteDiv.appendChild(cover);
                           noteDiv.appendChild(warning);
                           noteDiv.appendChild(warningInfo);
                           noteDiv.appendChild(closeButton);
                        } else if (showNsfw.showPolitics === "Hide") {
                           // We remove the note so the user doesn't have to see it
                           noteDiv.remove();
                        }
                     })
                  } else {
                     noteDiv.remove();
                  }
               })
            }

            // Create the user's PFP
            const userPfp = document.createElement("img");
            userPfp.classList.add("notePfp");
            firebase.database().ref("users/" + noteContent.whoSentIt).once("value", (snapshot) => {
               const fetchedUser = snapshot.val();
               userPfp.src = `https://firebasestorage.googleapis.com/v0/b/chat-transsocial-test.appspot.com/o/images%2Fpfp%2F${noteContent.whoSentIt}%2F${fetchedUser.pfp}?alt=media`;
               userPfp.setAttribute("draggable", "false");
               userPfp.setAttribute("loading", "lazy");
            });
            noteDiv.appendChild(userPfp);

            // Create the user's display name
            // Also check for badges (verified, mod, Enchanted, etc.)
            const displayName = document.createElement("a");
            displayName.classList.add("noteDisplay");
            firebase.database().ref("users/" + noteContent.whoSentIt).once("value", (snapshot) => {
               const fetchedUser = snapshot.val();
               displayName.textContent = fetchedUser.display;
               displayName.href = `/u?id=${fetchedUser.username}`;

               if (fetchedUser.isVerified === true) {
                  const badges = document.createElement("span");
                  badges.innerHTML = `<i class="fa-solid fa-circle-check fa-sm"></i>`;
                  badges.classList.add("noteBadges");
                  displayName.appendChild(badges);
               }
            })
            noteDiv.appendChild(displayName);

            // Insert Breakpoint to Seperate Display Name and Username
            const breakpoint = document.createElement("br");
            noteDiv.appendChild(breakpoint);

            // Create the user's username
            const username = document.createElement("a");
            username.classList.add("noteUsername");
            firebase.database().ref("users/" + noteContent.whoSentIt).once("value", (snapshot) => {
               const fetchedUser = snapshot.val();
               if (fetchedUser.pronouns !== undefined) {
                  const displayDate = timeAgo(noteContent.createdAt);

                  username.textContent = `@${fetchedUser.username} • ${fetchedUser.pronouns} • ${displayDate}`;
               } else {
                  const displayDate = timeAgo(noteContent.createdAt);

                  username.textContent = `@${fetchedUser.username} • ${displayDate}`;
               }
               username.href = `/u?id=${fetchedUser.username}`;
            })
            noteDiv.appendChild(username);

            // Create the note's text
            const text = document.createElement("p");
            text.innerHTML = sanitizeAndLinkify(noteContent.text);
            text.classList.add("noteText");
            if (noteContent.replyingTo === undefined) {
               text.setAttribute("onclick", `window.location.href="/note?id=${noteContent.id}"`);
            }
            twemoji.parse(text, {
               folder: 'svg',
               ext: '.svg'
            });
            noteDiv.appendChild(text);

            // If image has image/video, render a video/image
            if (noteContent.image === undefined) {
               // No need to run anything
            } else {
               let imageFileName = noteContent.image;
               let imageExtension = imageFileName.split(".").pop();
               const url = imageExtension;
               const cleanUrl = url.split('?')[0];

               if (cleanUrl === "mp4") {
                  const video = document.createElement("video");
                  video.src = noteContent.image;
                  video.classList.add("uploadedImg");
                  video.controls = true;
                  video.muted = true;
                  video.loop = true;
                  video.setAttribute("loading", "lazy");
                  firebase.auth().onAuthStateChanged((user) => {
                     if (user) {
                        firebase.database().ref(`users/${user.uid}/autoplayVideos`).once("value", (snapshot) => {
                           const evenExists = snapshot.exists();
                           const pref = snapshot.val();

                           if (evenExists === true) {
                              if (pref === "true") {
                                 video.autoplay = true;
                              } else if (pref === false) {
                                 video.autoplay = false;
                              } else {
                                 video.autoplay = true;
                              }
                           } else {
                              video.autoplay = true;
                           }
                        })
                     } else {
                        video.autoplay = true;
                     }
                  })
                  video.setAttribute("alt", `${noteContent.alt}`);
                  noteDiv.appendChild(video);
               } else {
                  const image = document.createElement("img");
                  image.src = noteContent.image;
                  image.draggable = "false";
                  image.classList.add("uploadedImg");
                  image.setAttribute("alt", `${noteContent.alt}`);
                  image.setAttribute("loading", "lazy");
                  noteDiv.appendChild(image);
               }
            }

            // If quoting a note, display the note that the note is quoting
            if (noteContent.quoting) {
               const container = document.createElement("div");
               container.classList.add("quoteContainer");
               container.setAttribute("onclick", `window.location.replace("/note?id=${noteContent.quoting}")`);
               noteDiv.appendChild(container);

               firebase.database().ref(`notes/${noteContent.quoting}`).once("value", (snapshot) => {
                  const quoteData = snapshot.val();

                  firebase.database().ref(`users/${quoteData.whoSentIt}`).once("value", (snapshot) => {
                     const quoteUser = snapshot.val();

                     const quotePfp = document.createElement("img");
                     quotePfp.classList.add("quotePfp");
                     quotePfp.setAttribute("draggable", "false");
                     quotePfp.src = `https://firebasestorage.googleapis.com/v0/b/chat-transsocial-test.appspot.com/o/images%2Fpfp%2F${quoteData.whoSentIt}%2F${quoteUser.pfp}?alt=media`;

                     const quoteContent = document.createElement("div");
                     quoteContent.classList.add("quoteContent");

                     const quoteHeader = document.createElement("div");
                     quoteHeader.classList.add("quoteHeader");

                     const quoteDisplay = document.createElement("span");
                     quoteDisplay.classList.add("quoteDisplay");
                     quoteDisplay.textContent = quoteUser.display;

                     const quoteUsername = document.createElement("span");
                     quoteUsername.classList.add("quoteUsername");
                     if (quoteUser.pronouns !== undefined || quoteUser.pronouns !== "") {
                        quoteUsername.textContent = `@${quoteUser.username} • ${quoteUser.pronouns}`;
                     } else {
                        quoteUsername.textContent = `@${quoteUser.username}`;
                     }

                     const quoteText = document.createElement("span");
                     quoteText.classList.add("quoteText");
                     quoteText.textContent = quoteData.text;

                     container.appendChild(quotePfp);
                     container.appendChild(quoteContent);
                     quoteHeader.appendChild(quoteDisplay);
                     quoteHeader.appendChild(quoteUsername);
                     quoteContent.appendChild(quoteHeader);
                     quoteContent.appendChild(quoteText);
                     twemoji.parse(quoteText, {
                        folder: 'svg',
                        ext: '.svg'
                     });
                  })
               })
            }

            // If flagged, display that.
            if (noteContent.isNsfw === true) {
               const contentWarning = document.createElement("p");
               contentWarning.classList.add("contentWarning-showBelowText");
               contentWarning.innerHTML = `<i class="fa-solid fa-flag"></i> Flagged as NSFW`;

               noteDiv.appendChild(contentWarning);
            } else if (noteContent.isSensitive === true) {
               const contentWarning = document.createElement("p");
               contentWarning.classList.add("contentWarning-showBelowText");
               contentWarning.innerHTML = `<i class="fa-solid fa-flag"></i> Flagged as sensitive`;

               noteDiv.appendChild(contentWarning);
            } else if (noteContent.isPolitical === true) {
               const contentWarning = document.createElement("p");
               contentWarning.classList.add("contentWarning-showBelowText");
               contentWarning.innerHTML = `<i class="fa-solid fa-flag"></i> Flagged as political`;

               noteDiv.appendChild(contentWarning);
            }

            // Add love button
            const loveBtn = document.createElement("p");
            loveBtn.classList.add("likeBtn");
            if (noteContent.likes !== undefined) {
               loveBtn.innerHTML = `<i class="fa-solid fa-heart"></i> ${noteContent.likes}`;

               firebase.auth().onAuthStateChanged((user) => {
                  if (noteContent.whoLiked && noteContent.whoLiked[user.uid]) {
                     loveBtn.classList.add("liked");
                  }
               })
            } else {
               loveBtn.innerHTML = `<i class="fa-solid fa-heart"></i> 0`;
            }
            loveBtn.setAttribute("id", `like-${noteContent.id}`);
            noteDiv.appendChild(loveBtn);

            // Add renote button
            const renoteBtn = document.createElement("p");
            renoteBtn.classList.add("renoteBtn");
            if (noteContent.renotes !== undefined) {
               renoteBtn.innerHTML = `<i class="fa-solid fa-retweet"></i> ${noteContent.renotes}`;

               firebase.auth().onAuthStateChanged((user) => {
                  if (noteContent.whoRenoted && noteContent.whoRenoted[user.uid]) {
                     renoteBtn.classList.add("renoted");
                  }
               })
            } else {
               renoteBtn.innerHTML = `<i class="fa-solid fa-retweet"></i> 0`;
            }
            renoteBtn.setAttribute("id", `renote-${noteContent.id}`);
            noteDiv.appendChild(renoteBtn);

            // Add reply button
            const replyBtn = document.createElement("p");
            replyBtn.classList.add("renoteBtn");
            if (noteContent.replies !== undefined) {
               replyBtn.innerHTML = `<i class="fa-solid fa-comment"></i> ${noteContent.replies}`;
            } else {
               replyBtn.innerHTML = `<i class="fa-solid fa-comment"></i> 0`;
            }
            if (pathName !== "/note") {
               replyBtn.setAttribute("onclick", `window.location.href="/note?id=${noteContent.id}";`);
            } else {
               replyBtn.setAttribute("onclick", "replyToNote(this);");
            }
            noteDiv.appendChild(replyBtn);

            // Add quote renote button
            const quoteRenote = document.createElement("p");
            quoteRenote.classList.add("quoteRenoteBtn");
            quoteRenote.innerHTML = `<i class="fa-solid fa-quote-left"></i>`;
            quoteRenote.setAttribute("onclick", `quoteRenote("${noteContent.id}")`);
            noteDiv.appendChild(quoteRenote);

            // If user created the note, allow them to edit/delete
            firebase.auth().onAuthStateChanged((user) => {
               if (user) {
                  if (user.uid === noteContent.whoSentIt) {
                     const more = document.createElement("p");
                     more.classList.add("more");
                     more.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>`;
                     noteDiv.appendChild(more);
                  }
               }
            })

            // Render note
            // BUT check for certain things first (such as if user is suspended, if user is blocked, etc.)
            // Prevent suspended users notes from rendering
            firebase.database().ref(`users/${noteContent.whoSentIt}`).once("value", (snapshot) => {
               const isSuspended = snapshot.val();

               if (isSuspended.suspensionStatus !== undefined) {
                  noteDiv.remove();
               }
            })

            // If all is okay, do it fine.
            if (pathName === "/") {
               if (noteContent.replyingTo === undefined) {
                  if (noteContent.isDeleted !== true) {
                     notesContainer.appendChild(noteDiv);
                  }
               }
            }
            if (pathName === "/note") {
               const url = new URL(window.location.href);
               const noteParam = url.searchParams.get("id");

               if (noteContent.replyingTo === noteParam) {
                  if (noteContent.isDeleted !== true) {
                     notesContainer.appendChild(noteDiv);
                  }
               }
            }
            if (pathName === "/u") {
               // Remove the note and go to line 1928 for proper note rendering, since we need to show renotes as well
               noteDiv.remove();
            }
         });
      })
      .catch(function (error) {
         console.error("TransSocial encountered an error trying to load notes:", error);
         console.error("TransSocial encountered an error trying to load notes: " + error + " Please check your internet connection or report an issue on GitHub (https://github.com/katniny/transsocial-issues/issues).");
      });

   // When a new note is added, let the user know.
   firebase.database().ref("notes/").on("child_added", (snapshot) => {
      const isReply = snapshot.val();
      if (isReply.replyingTo === undefined) {
         if (pathName === "/" || pathName === "/index" || pathName === "/index.html") {
            document.getElementById("newNotesAvailable").style.display = "block";
         }
      }
   })

   firebase.database().ref("notes/").on("child_changed", (snapshot) => {
      const data = snapshot.val();
      //console.log(data);

      // Check if any specific field (child) is updated
      document.getElementById(`like-${data.id}`).innerHTML = `<i class="fa-solid fa-heart"></i> ${data.likes}`;
      document.getElementById(`renote-${data.id}`).innerHTML = `<i class="fa-solid fa-retweet"></i> ${data.renotes}`;
      //console.log('Likes:', data.likes, 'Renotes:', data.renotes, 'Replies:', data.replies);

      firebase.auth().onAuthStateChanged((user) => {
         const uid = user.uid;

         // If user loved the note, update the UI to display that.
         if (data.whoLiked && data.whoLiked[uid]) {
            document.getElementById(`like-${data.id}`).classList.add("liked");
         } else {
            document.getElementById(`like-${data.id}`).classList.remove("liked");
         }

         // If user renoted the note, update the UI to display that.
         if (data.whoRenoted && data.whoRenoted[uid]) {
            document.getElementById(`renote-${data.id}`).classList.add("renoted");
         } else {
            document.getElementById(`renote-${data.id}`).classList.remove("renoted");
         }
      })
   });

   document.addEventListener('click', function (event) {
      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            const uid = user.uid;

            if (event.target.classList.contains("likeBtn") || event.target.classList.contains("fa-solid" && "fa-heart")) {
               const likeButton = event.target;
               const noteId = findNoteId(likeButton);

               const loveCountRef = firebase.database().ref(`notes/${noteId}/likes`);
               loveCountRef.once("value", (snapshot) => {
                  const data = snapshot.val();
                  //console.log(data);

                  firebase.database().ref(`notes/${noteId}/whoLiked`).once("value", (snapshot) => {
                     const likedData = snapshot.val();
                     if (likedData && likedData[uid]) {
                        firebase.database().ref(`notes/${noteId}`).update({
                           likes: data - 1
                        });

                        firebase.database().ref(`notes/${noteId}/whoLiked/${uid}`).remove();
                     } else {
                        firebase.database().ref(`notes/${noteId}`).update({
                           likes: data + 1
                        });

                        firebase.database().ref(`notes/${noteId}/whoLiked/${uid}`).update({
                           uid: uid
                        });

                        loveCountRef.off();

                        firebase.database().ref(`notes/${noteId}`).once("value", (snapshot) => {
                           const whoSentIt_note = snapshot.val();

                           if (user.uid !== whoSentIt_note.whoSentIt) {
                              firebase.database().ref(`notes/${noteId}`).once("value", (snapshot) => {
                                 const getUser = snapshot.val();

                                 const newNotiKey = firebase.database().ref("users/" + getUser.whoSentIt + "notifications/").push().key;

                                 const notiData = {
                                    type: "Love",
                                    who: user.uid,
                                    postId: noteId,
                                 }

                                 firebase.database().ref(`users/${getUser.whoSentIt}/notifications/`).child(newNotiKey).set(notiData);
                                 firebase.database().ref().update({
                                    [`users/${getUser.whoSentIt}/notifications/unread`]: firebase.database.ServerValue.increment(1)
                                 });
                              })
                           }
                        })
                     }
                  });

                  return;
               })
            }
         } else {
            loginPrompt();
         }
      })
   });

   function findNoteId(likeButton) {
      // Every note has an ID associated with it. This will fetch the note's ID and return it to allow the user to love the note.
      return likeButton.closest(".note").id;
   };

   document.addEventListener('click', function (event) {
      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            const uid = user.uid;

            if (event.target.classList.contains("renoteBtn") || event.target.classList.contains("fa-solid" && "fa-retweet")) {
               const renoteButton = event.target;
               const noteId = findNoteId(renoteButton);

               const renoteCountRef = firebase.database().ref(`notes/${noteId}/renotes`);
               renoteCountRef.once("value", (snapshot) => {
                  const data = snapshot.val();
                  //console.log(data);

                  firebase.database().ref(`notes/${noteId}/whoRenoted`).once("value", (snapshot) => {
                     const renotedData = snapshot.val();
                     if (renotedData && renotedData[uid]) {
                        firebase.database().ref(`notes/${noteId}`).update({
                           renotes: data - 1
                        });

                        firebase.database().ref(`notes/${noteId}/whoRenoted/${uid}`).remove();
                        firebase.database().ref(`users/${uid}/posts/${noteId}`).remove();
                     } else {
                        firebase.database().ref(`notes/${noteId}`).update({
                           renotes: data + 1
                        });

                        firebase.database().ref(`notes/${noteId}/whoRenoted/${uid}`).update({
                           uid: uid
                        });

                        firebase.database().ref(`users/${uid}/posts/${noteId}`).update({
                           isRenote: true,
                        })

                        unlockAchievement("Express Yourself");

                        renoteCountRef.off();

                        firebase.database().ref(`notes/${noteId}`).once("value", (snapshot) => {
                           const whoSentIt_note = snapshot.val();

                           if (user.uid !== whoSentIt_note.whoSentIt) {
                              firebase.database().ref(`notes/${noteId}`).once("value", (snapshot) => {
                                 const getUser = snapshot.val();

                                 const newNotiKey = firebase.database().ref("users/" + getUser.whoSentIt + "notifications/").push().key;

                                 const notiData = {
                                    type: "Renote",
                                    who: user.uid,
                                    postId: noteId,
                                 }

                                 firebase.database().ref(`users/${getUser.whoSentIt}/notifications/`).child(newNotiKey).set(notiData);
                                 firebase.database().ref().update({
                                    [`users/${getUser.whoSentIt}/notifications/unread`]: firebase.database.ServerValue.increment(1)
                                 });
                              })
                           }
                        })
                     }
                  });

                  return;
               })
            }
         } else {
            loginPrompt();
         }
      })
   });

   function findNoteId(renoteButton) {
      // Every note has an ID associated with it. This will fetch the note's ID and return it to allow the user to love the note.
      return renoteButton.closest(".note").id;
   };
}

// Hide profile in the sidebar if not signed in
function hideProfileSidebar() {
   firebase.auth().onAuthStateChanged((user) => {
      if (user) {
         // No need to do anything further
         const notSignedIn = document.getElementById("notSignedIn");
         notSignedIn.style.display = "none";
         return true;
      } else {
         document.getElementById("userPfp-sidebar").style.display = "none";
         document.getElementById("displayName-sidebar").style.display = "none";
         document.getElementById("username-pronouns-sidebar").style.display = "none";
      }
   })
}

// Hide sidebar buttons + login thing
function hideSidebarButtons() {
   const notifications = document.getElementById("notificationsSidebar");
   const messages = document.getElementById("messagesSidebar");
   const enchanted = document.getElementById("enchantedSidebar");
   const settings = document.getElementById("settingsSidebar");
   const profile = document.getElementById("linkToAcc");
   const loginThing = document.getElementById("notSignedIn-banner");
   const createNote = document.getElementById("createNote-sidebar");

   firebase.auth().onAuthStateChanged((user) => {
      if (user) {
         loginThing.style.display = "none";
         return;
      } else {
         profile.style.display = "none";
         notifications.style.display = "none";
         messages.style.display = "none";
         // enchanted.style.display = "none";
         settings.style.display = "none";
         createNote.style.display = "none";
      }
   })
}

// Close help prompt
function closeHelpPrompt() {
   const supportTransSocial = document.getElementById("pleaseDonate");

   supportTransSocial.style.display = "none";
}

// Create note
function createNotePopup() {
   const notePopup = document.getElementById("createNote-popup");

   document.getElementById("mainTab-noteCreation").classList.remove("hidden");
   document.querySelector(".settingsStuff").classList.add("hidden");
   notePopup.showModal();

   if (renotingNote === null) {
      document.getElementById("quotingNote").style.display = "none";
   } else {
      document.getElementById("quotingNote").style.display = "block";

      firebase.database().ref(`notes/${renotingNote}`).once("value", (snapshot) => {
         const noteData = snapshot.val();

         firebase.database().ref(`users/${noteData.whoSentIt}`).once("value", (snapshot) => {
            const userData = snapshot.val();

            document.getElementById("notePopupQuotePfp").src = `https://firebasestorage.googleapis.com/v0/b/chat-transsocial-test.appspot.com/o/images%2Fpfp%2F${noteData.whoSentIt}%2F${userData.pfp}?alt=media`;
            document.getElementById("notePopupQuoteDisplay").textContent = userData.display;
            document.getElementById("notePopupQuoteUsername").textContent = `@${userData.username}`;
            document.getElementById("notePopupQuoteText").textContent = noteData.text;
         })
      })
   }
}

function closeCreateNotePopup() {
   const notePopup = document.getElementById("createNote-popup");

   document.getElementById("noteContent-textarea").value = "";
   document.getElementById("uploadingImage").style.display = "none";
   removeImage();
   document.getElementById("hasntBeenUploadedNotice").style.display = "none";
   if (pathName === "/note" || pathName === "/note.html") {
      document.getElementById("replyingOrCreating").innerText = "Create a Note!";
      isReplying_notehtml = false;
   }
   document.getElementById("isNsfw").checked = false;
   document.getElementById("isSensitive").checked = false;
   renotingNote = null;

   notePopup.close();
}

// Swap Note Settings/Creation Tab
let currentTab = "note";

function swapNoteTab() {
   if (currentTab == "note") {
      document.getElementById("mainTab-noteCreation").classList.add("hidden");
      document.querySelector(".settingsStuff").classList.remove("hidden");
      currentTab = "settings";
   } else {
      document.getElementById("mainTab-noteCreation").classList.remove("hidden");
      document.querySelector(".settingsStuff").classList.add("hidden");
      currentTab = "note";
   }
}

// Load everything
function loadEverything() {
   getUserPfpSidebar();
   getUserInfoSidebar();
   linkButtonToAcc();
   hideProfileSidebar();
   hideSidebarButtons();
   Notification.requestPermission();
   firebase.auth().onAuthStateChanged((user) => {
      if (user) {
         firebase.database().ref(`users/${user.uid}/`).once("value", (snapshot) => {
            const isDMSEnabled = snapshot.val();

            if (isDMSEnabled.directMessagesExperiment === undefined) {
               document.getElementById("messagesSidebar").style.display = "none";
            } else {
               document.getElementById("messagesSidebar").style.display = "block";
            }
         })
      }
   })
}

// TransSocial account stuff
if (pathName !== "/auth/login.html" && pathName !== "/auth/register.html" && pathName !== "/auth/katniny.html" && pathName !== "/auth/login" && pathName !== "/auth/register" && pathName !== "/auth/katniny") {
   database.ref("users/G6GaJr8vPpeVdvenAntjOFYlbwr2").once("value", (snapshot) => {
      const data = snapshot.val();
      document.getElementById(`katninyPfp`).src = `https://firebasestorage.googleapis.com/v0/b/chat-transsocial-test.appspot.com/o/images%2Fpfp%2FG6GaJr8vPpeVdvenAntjOFYlbwr2%2F${data.pfp}?alt=media`;
      document.getElementById(`katninyDisplay`).innerHTML = data.display + ` <i class="fa-solid fa-circle-check" style="color: var(--main-color);"></i>`;
      document.getElementById(`followBtn-1`).href = `/u?id=${data.username}`;
      document.getElementById(`katninyUser-pronouns`).textContent = `@${data.username}`;
   });

   database.ref("users/80vDnNb0rJbSjCvbiTF9EtvqtXw1").once("value", (snapshot) => {
      const data = snapshot.val();
      document.getElementById(`transsocialPfp`).src = `https://firebasestorage.googleapis.com/v0/b/chat-transsocial-test.appspot.com/o/images%2Fpfp%2F80vDnNb0rJbSjCvbiTF9EtvqtXw1%2F${data.pfp}?alt=media`;
      document.getElementById(`transsocialDisplay`).innerHTML = data.display + ` <i class="fa-solid fa-circle-check" style="color: var(--main-color);"></i>`;
      document.getElementById(`followBtn-2`).href = `/u?id=${data.username}`;
      document.getElementById(`transsocialUser-pronouns`).textContent = `@${data.username}`;
   });

   database.ref("users/4luqDI8627asR5EV8hOqb0YrRQF3").once("value", (snapshot) => {
      const data = snapshot.val();
      document.getElementById(`katninystudiosPfp`).src = `https://firebasestorage.googleapis.com/v0/b/chat-transsocial-test.appspot.com/o/images%2Fpfp%2F4luqDI8627asR5EV8hOqb0YrRQF3%2F${data.pfp}?alt=media`;
      document.getElementById(`katninystudiosDisplay`).innerHTML = data.display + ` <i class="fa-solid fa-circle-check" style="color: var(--main-color);"></i>`;
      document.getElementById(`followBtn-3`).href = `/u?id=${data.username}`;
      document.getElementById(`katninystudiosUser-pronouns`).textContent = `@${data.username}`;
   });
}

// Get the user's information to display on the profile
if (pathName === "/u.html" || pathName === "/u") {
   const url = new URL(window.location.href);
   const userParam = url.searchParams.get("id");
   let profileExists = null;
   let profileData = null;

   database.ref(`taken-usernames/${userParam}`).once("value", (snapshot) => {
      profileExists = snapshot.val();

      if (profileExists.user !== null) {
         document.getElementById("userNotFound").style.display = "none";
         database.ref(`users/${profileExists.user}`).once("value", (snapshot) => {
            profileData = snapshot.val();
            document.title = `${profileData.display} (@${profileData.username}) | TransSocial`;
            document.getElementById(`melissa`).style.display = "block";
            document.getElementById(`userImage-profile`).src = `https://firebasestorage.googleapis.com/v0/b/chat-transsocial-test.appspot.com/o/images%2Fpfp%2F${profileExists.user}%2F${profileData.pfp}?alt=media`;
            document.getElementById(`display-profile`).textContent = profileData.display;
            if (profileData.isVerified) {
               const verifiedBadge = document.createElement("span");
               verifiedBadge.innerHTML = `<i class="fa-solid fa-circle-check"></i>`;
               verifiedBadge.classList.add("noteBadges");
               verifiedBadge.style.marginLeft = "7px";
               document.getElementById(`display-profile`).appendChild(verifiedBadge);
            }
            document.getElementById(`username-profile`).textContent = `@${profileData.username}`;

            document.getElementById("interactingWithWho").textContent = `User Actions for @${profileData.username}`;

            firebase.auth().onAuthStateChanged((user) => {
               if (user) {
                  if (user.uid === profileExists.user) {
                     document.getElementById("blockUser").style.display = "none";
                     document.getElementById("interactingWithWho_desc").textContent = "Would you like to do with your profile?";
                     document.getElementById("profileSidebar").classList.add("active");
                  } else {
                     document.getElementById("editProfile").remove();
                  }

                  firebase.database().ref(`users/${user.uid}/blocked/${profileExists.user}`).once("value", (snapshot) => {
                     const isBlocked = snapshot.val();

                     if (isBlocked === null) {
                        document.getElementById("ifUserBlocked_Current").style.display = "none";
                     } else if (isBlocked !== null) {
                        document.getElementById("ifUserBlocked_Current").style.display = "block";
                        document.getElementById("blockUser").style.display = "none";
                        document.getElementById("unblockUser").style.display = "block";
                        document.getElementById("whoIsBlocked").textContent = `@${profileData.username} is blocked`;
                        document.getElementById("whoIsBlocked_desc").textContent = `@${profileData.username} is blocked. Would you like to view their notes anyway or unblock them?`;
                        document.getElementById("followButton").remove();
                        document.getElementById("userActions").style.marginLeft = "15px";
                     }
                  })

                  firebase.database().ref(`users/${profileExists.user}/blocked/${user.uid}`).once("value", (snapshot) => {
                     const blocked = snapshot.val();

                     if (blocked === null) {
                        // Don't do anything, it's possible that this would hide the warning if the user visiting has blocked the other.
                     } else if (blocked !== null) {
                        document.getElementById("ifUserBlocked_Current").style.display = "block";
                        document.getElementById("blockUser").style.display = "none";
                        document.getElementById("unblockUser").style.display = "none";
                        document.getElementById("whoIsBlocked").textContent = `@${profileData.username} blocked you`;
                        document.getElementById("whoIsBlocked_desc").textContent = `@${profileData.username} blocked you. You may not see their notes.`;
                        // document.getElementById("followButton").remove();
                        document.getElementById("showNotesButton").remove();
                        document.getElementById("unblockUserButton").remove();
                     }
                  })
               }
            })

            if (profileData.pronouns === undefined || profileData.pronouns === null || profileData.pronouns === "") {
               document.getElementById(`pronouns-profile`).remove();
            } else {
               document.getElementById(`pronouns-profile`).textContent = profileData.pronouns;
            }

            if (profileData.bio === undefined || profileData.bio === null || profileData.bio === "") {
               document.getElementById("bio-profile").textContent = "No user bio provided.";
            } else {
               document.getElementById("bio-profile").innerHTML = sanitizeAndLinkify(profileData.bio);
               twemoji.parse(document.getElementById("bio-profile"), {
                  folder: 'svg',
                  ext: '.svg'
               });
            }

            if (profileData.followers === undefined) {
               document.getElementById("followers").textContent = "0 ";
            } else {
               document.getElementById("followers").textContent = `${profileData.followers} `;
            }

            if (profileData.following === undefined) {
               document.getElementById("following").textContent = "0 ";
            } else {
               document.getElementById("following").textContent = `${profileData.following} `;
            }

            // If user profile and logged in user are the same
            firebase.auth().onAuthStateChanged((user) => {
               if (user.uid === profileExists.user) {
                  document.getElementById("followButton").textContent = "Edit Profile";
                  document.getElementById("followButton").setAttribute("onclick", 'window.location.href="/settings"');
               } else {
                  const currentUserUid = user.uid;
                  const profileUserUid = profileExists.user;
                  const currentUserFollowsRef = firebase.database().ref(`users/${profileUserUid}/whoFollows`);

                  currentUserFollowsRef.once('value', (snapshot) => {
                     const followersData = snapshot.val();

                     if (followersData && followersData[currentUserUid]) {
                        document.getElementById("followButton").textContent = "Following";
                     } else {
                        //...
                     }
                  });
               }
            })
         })

         // Note rendering for users
         const notesRef = firebase.database().ref('notes');
         const notesDiv = document.getElementById("notes");

         // get the note ids from the user's notes
         firebase.database().ref(`users/${profileExists.user}/posts`).once('value')
            .then(snapshot => {
               const noteIds = [];
               snapshot.forEach(childSnapshot => {
                  noteIds.push(childSnapshot.key);
               });

               // fetch the note details for each note id
               const notePromises = noteIds.map(noteId => notesRef.child(noteId).once('value'));

               // resolve all promises
               return Promise.all(notePromises);
            })
            .then(snapshots => {
               const notesArray = snapshots.map(snap => snap.val()).filter(note => note !== null);

               // sort notes by timestamp, newest first
               notesArray.sort((a, b) => b.createdAt - a.createdAt);

               // create and append divs for each note
               notesArray.forEach(noteContent => {
                  const noteDiv = createNoteDiv(noteContent);
                  if (document.getElementById("newNotesAvailable")) {
                     document.getElementById("newNotesAvailable").style.display = "none";
                  }

                  // Check if the note has NSFW/Sensitive content and users preferences
                  // Do this immediately or bugs will arise (that I don't feel like fixing)
                  if (noteContent.isNsfw === true) {
                     firebase.auth().onAuthStateChanged(user => {
                        if (user) {
                           firebase.database().ref(`users/${user.uid}`).once("value", snapshot => {
                              const showNsfw = snapshot.val();

                              if (showNsfw.showNsfw === "Show") {
                                 // No need to do anything. It'll do it as is.
                              } else if (showNsfw.showNsfw === "Blur") {
                                 // The actual cover
                                 const cover = document.createElement("div");
                                 cover.classList.add("contentWarning");
                                 cover.setAttribute("id", `${noteContent.id}-blur`);

                                 // Warning Header
                                 const warning = document.createElement("p");
                                 warning.setAttribute("id", `${noteContent.id}-warning`);
                                 warning.classList.add("warning");
                                 warning.textContent = "Note may contain NSFW content.";

                                 // Warning Info
                                 const warningInfo = document.createElement("p");
                                 warningInfo.classList.add("warningInfo");
                                 warningInfo.setAttribute("id", `${noteContent.id}-warningInfo`);
                                 warningInfo.textContent = "The creator of this note flagged their note as having NSFW content.";

                                 // Close Warning Button
                                 const closeButton = document.createElement("button");
                                 closeButton.classList.add("closeWarning");
                                 closeButton.setAttribute("id", `${noteContent.id}-closeWarning`);
                                 closeButton.setAttribute("onclick", "removeNsfw(this.id);");
                                 closeButton.textContent = "View";

                                 // Show all children
                                 noteDiv.appendChild(cover);
                                 noteDiv.appendChild(warning);
                                 noteDiv.appendChild(warningInfo);
                                 noteDiv.appendChild(closeButton);
                              } else if (showNsfw.showNsfw === "Hide") {
                                 // We remove the note so the user doesn't have to see it
                                 noteDiv.remove();
                              }
                           })
                        } else {
                           noteDiv.remove();
                        }
                     })
                  } else if (noteContent.isSensitive === true) {
                     firebase.auth().onAuthStateChanged(user => {
                        if (user) {
                           firebase.database().ref(`users/${user.uid}`).once("value", snapshot => {
                              const showNsfw = snapshot.val();

                              if (showNsfw.showSensitive === "Show") {
                                 // No need to do anything. It'll do it as is.
                              } else if (showNsfw.showSensitive === "Blur") {
                                 // The actual cover
                                 const cover = document.createElement("div");
                                 cover.classList.add("contentWarning");
                                 cover.setAttribute("id", `${noteContent.id}-blur`);

                                 // Warning Header
                                 const warning = document.createElement("p");
                                 warning.setAttribute("id", `${noteContent.id}-warning`);
                                 warning.classList.add("warning");
                                 warning.textContent = "Note may contain sensitive content.";

                                 // Warning Info
                                 const warningInfo = document.createElement("p");
                                 warningInfo.classList.add("warningInfo");
                                 warningInfo.setAttribute("id", `${noteContent.id}-warningInfo`);
                                 warningInfo.textContent = "The creator of this note flagged their note as having sensitive content.";

                                 // Close Warning Button
                                 const closeButton = document.createElement("button");
                                 closeButton.classList.add("closeWarning");
                                 closeButton.setAttribute("id", `${noteContent.id}-closeWarning`);
                                 closeButton.setAttribute("onclick", "removeNsfw(this.id);");
                                 closeButton.textContent = "View";

                                 // Show all children
                                 noteDiv.appendChild(cover);
                                 noteDiv.appendChild(warning);
                                 noteDiv.appendChild(warningInfo);
                                 noteDiv.appendChild(closeButton);
                              } else if (showNsfw.showSensitive === "Hide") {
                                 // We remove the note so the user doesn't have to see it
                                 noteDiv.remove();
                              }
                           })
                        } else {
                           noteDiv.remove();
                        }
                     })
                  } else if (noteContent.isPolitical === true) {
                     firebase.auth().onAuthStateChanged((user) => {
                        if (user) {
                           firebase.database().ref(`users/${user.uid}`).once("value", (snapshot) => {
                              const showNsfw = snapshot.val();

                              if (showNsfw.showPolitics === "Show") {
                                 // No need to do anything. It'll do it as is.
                              } else if (showNsfw.showPolitics === "Blur") {
                                 // The actual cover
                                 const cover = document.createElement("div");
                                 cover.classList.add("contentWarning");
                                 cover.setAttribute("id", `${noteContent.id}-blur`);

                                 // Warning Header
                                 const warning = document.createElement("p");
                                 warning.setAttribute("id", `${noteContent.id}-warning`);
                                 warning.classList.add("warning");
                                 warning.textContent = "Note may contain political content.";

                                 // Warning Info
                                 const warningInfo = document.createElement("p");
                                 warningInfo.classList.add("warningInfo");
                                 warningInfo.setAttribute("id", `${noteContent.id}-warningInfo`);
                                 warningInfo.textContent = "This note may contain political content. This note does not reflect TransSocial's opinions. This note may not be political and may be incorrectly flagged.";

                                 // Close Warning Button
                                 const closeButton = document.createElement("button");
                                 closeButton.classList.add("closeWarning");
                                 closeButton.setAttribute("id", `${noteContent.id}-closeWarning`);
                                 closeButton.setAttribute("onclick", "removeNsfw(this.id);");
                                 closeButton.textContent = "View";
                                 closeButton.style.marginTop = "25px";

                                 // Show all children
                                 noteDiv.appendChild(cover);
                                 noteDiv.appendChild(warning);
                                 noteDiv.appendChild(warningInfo);
                                 noteDiv.appendChild(closeButton);
                              } else if (showNsfw.showPolitics === "Hide") {
                                 // We remove the note so the user doesn't have to see it
                                 noteDiv.remove();
                              }
                           })
                        } else {
                           noteDiv.remove();
                        }
                     })
                  }

                  // Check if the note is a renote
                  if (profileExists.user !== noteContent.whoSentIt) {
                     const isRenote = document.createElement("p");
                     isRenote.classList.add("isRenote");
                     isRenote.innerHTML = `<i class="fa-solid fa-retweet"></i> Fetching... renoted`;
                     noteDiv.appendChild(isRenote);

                     firebase.database().ref(`users/${profileExists.user}`).once("value", (snapshot) => {
                        const getUsername = snapshot.val();

                        isRenote.innerHTML = `<i class="fa-solid fa-retweet"></i> ${getUsername.display} renoted`;
                     })
                  }

                  // Create the user's PFP
                  const userPfp = document.createElement("img");
                  userPfp.classList.add("notePfp");
                  firebase.database().ref("users/" + noteContent.whoSentIt).once("value", snapshot => {
                     const fetchedUser = snapshot.val();
                     userPfp.src = `https://firebasestorage.googleapis.com/v0/b/chat-transsocial-test.appspot.com/o/images%2Fpfp%2F${noteContent.whoSentIt}%2F${fetchedUser.pfp}?alt=media`;
                     userPfp.setAttribute("draggable", "false");
                     userPfp.setAttribute("loading", "lazy");
                  });
                  noteDiv.appendChild(userPfp);

                  // Create the user's display name
                  // Also check for badges (verified, mod, Enchanted, etc.)
                  const displayName = document.createElement("a");
                  displayName.classList.add("noteDisplay");
                  firebase.database().ref("users/" + noteContent.whoSentIt).once("value", snapshot => {
                     const fetchedUser = snapshot.val();
                     displayName.textContent = fetchedUser.display;
                     displayName.href = `/u?id=${fetchedUser.username}`;

                     if (fetchedUser.isVerified === true) {
                        const badges = document.createElement("span");
                        badges.innerHTML = `<i class="fa-solid fa-circle-check fa-sm"></i>`;
                        badges.classList.add("noteBadges");
                        displayName.appendChild(badges);
                     }
                  })
                  noteDiv.appendChild(displayName);

                  // Insert Breakpoint to Seperate Display Name and Username
                  const breakpoint = document.createElement("br");
                  noteDiv.appendChild(breakpoint);

                  // Create the user's username
                  const username = document.createElement("a");
                  username.classList.add("noteUsername");
                  firebase.database().ref("users/" + noteContent.whoSentIt).once("value", (snapshot) => {
                     const fetchedUser = snapshot.val();

                     if (fetchedUser.pronouns !== undefined) {
                        const displayDate = timeAgo(noteContent.createdAt);

                        username.textContent = `@${fetchedUser.username} • ${fetchedUser.pronouns} • ${displayDate}`;
                     } else {
                        const displayDate = timeAgo(noteContent.createdAt);

                        username.textContent = `@${fetchedUser.username} • ${displayDate}`;
                     }
                     username.href = `/u?id=${fetchedUser.username}`;
                  })

                  noteDiv.appendChild(username);

                  // Create the note's text
                  const text = document.createElement("p");
                  text.innerHTML = sanitizeAndLinkify(noteContent.text);
                  text.classList.add("noteText");
                  if (noteContent.replyingTo === undefined) {
                     text.setAttribute("onclick", `window.location.href="/note?id=${noteContent.id}"`);
                  }
                  twemoji.parse(text, {
                     folder: 'svg',
                     ext: '.svg'
                  });
                  noteDiv.appendChild(text);

                  // If image has image/video, render a video/image
                  if (noteContent.image === undefined) {
                     // No need to run anything
                  } else {
                     let imageFileName = noteContent.image;
                     let imageExtension = imageFileName.split(".").pop();
                     const url = imageExtension;
                     const cleanUrl = url.split('?')[0];

                     if (cleanUrl === "mp4") {
                        const video = document.createElement("video");
                        video.src = noteContent.image;
                        video.classList.add("uploadedImg");
                        video.controls = true;
                        video.muted = true;
                        video.loop = true;
                        video.setAttribute("loading", "lazy");
                        firebase.auth().onAuthStateChanged((user) => {
                           if (user) {
                              firebase.database().ref(`users/${user.uid}/autoplayVideos`).once("value", (snapshot) => {
                                 const evenExists = snapshot.exists();
                                 const pref = snapshot.val();

                                 if (evenExists === true) {
                                    if (pref === "true") {
                                       video.autoplay = true;
                                    } else if (pref === false) {
                                       video.autoplay = false;
                                    } else {
                                       video.autoplay = true;
                                    }
                                 } else {
                                    video.autoplay = true;
                                 }
                              })
                           } else {
                              video.autoplay = true;
                           }
                        })
                        video.setAttribute("alt", `${noteContent.alt}`);
                        noteDiv.appendChild(video);
                     } else {
                        const image = document.createElement("img");
                        image.src = noteContent.image;
                        image.draggable = "false";
                        image.classList.add("uploadedImg");
                        image.setAttribute("alt", `${noteContent.alt}`);
                        image.setAttribute("loading", "lazy");
                        noteDiv.appendChild(image);
                     }
                  }

                  // If quoting a note, display the note that the note is quoting
                  if (noteContent.quoting) {
                     const container = document.createElement("div");
                     container.classList.add("quoteContainer");
                     container.setAttribute("onclick", `window.location.replace("/note?id=${noteContent.quoting}")`);
                     noteDiv.appendChild(container);

                     firebase.database().ref(`notes/${noteContent.quoting}`).once("value", (snapshot) => {
                        const quoteData = snapshot.val();

                        firebase.database().ref(`users/${quoteData.whoSentIt}`).once("value", (snapshot) => {
                           const quoteUser = snapshot.val();

                           const quotePfp = document.createElement("img");
                           quotePfp.classList.add("quotePfp");
                           quotePfp.setAttribute("draggable", "false");
                           quotePfp.src = `https://firebasestorage.googleapis.com/v0/b/chat-transsocial-test.appspot.com/o/images%2Fpfp%2F${quoteData.whoSentIt}%2F${quoteUser.pfp}?alt=media`;

                           const quoteContent = document.createElement("div");
                           quoteContent.classList.add("quoteContent");

                           const quoteHeader = document.createElement("div");
                           quoteHeader.classList.add("quoteHeader");

                           const quoteDisplay = document.createElement("span");
                           quoteDisplay.classList.add("quoteDisplay");
                           quoteDisplay.textContent = quoteUser.display;

                           const quoteUsername = document.createElement("span");
                           quoteUsername.classList.add("quoteUsername");
                           if (quoteUser.pronouns !== undefined || quoteUser.pronouns !== "") {
                              quoteUsername.textContent = `@${quoteUser.username} • ${quoteUser.pronouns}`;
                           } else {
                              quoteUsername.textContent = `@${quoteUser.username}`;
                           }

                           const quoteText = document.createElement("span");
                           quoteText.classList.add("quoteText");
                           quoteText.textContent = quoteData.text;

                           container.appendChild(quotePfp);
                           container.appendChild(quoteContent);
                           quoteHeader.appendChild(quoteDisplay);
                           quoteHeader.appendChild(quoteUsername);
                           quoteContent.appendChild(quoteHeader);
                           quoteContent.appendChild(quoteText);
                           twemoji.parse(text, {
                              folder: 'svg',
                              ext: '.svg'
                           });
                        })
                     })
                  }

                  // If flagged, display that.
                  if (noteContent.isNsfw === true) {
                     const contentWarning = document.createElement("p");
                     contentWarning.classList.add("contentWarning-showBelowText");
                     contentWarning.innerHTML = `<i class="fa-solid fa-flag"></i> Flagged as NSFW`;

                     noteDiv.appendChild(contentWarning);
                  } else if (noteContent.isSensitive === true) {
                     const contentWarning = document.createElement("p");
                     contentWarning.classList.add("contentWarning-showBelowText");
                     contentWarning.innerHTML = `<i class="fa-solid fa-flag"></i> Flagged as sensitive`;

                     noteDiv.appendChild(contentWarning);
                  } else if (noteContent.isPolitical === true) {
                     const contentWarning = document.createElement("p");
                     contentWarning.classList.add("contentWarning-showBelowText");
                     contentWarning.innerHTML = `<i class="fa-solid fa-flag"></i> Flagged as political`;

                     noteDiv.appendChild(contentWarning);
                  }

                  // Add love button
                  const loveBtn = document.createElement("p");
                  loveBtn.classList.add("likeBtn");
                  if (noteContent.likes !== undefined) {
                     loveBtn.innerHTML = `<i class="fa-solid fa-heart"></i> ${noteContent.likes}`;

                     firebase.auth().onAuthStateChanged(user => {
                        if (noteContent.whoLiked && noteContent.whoLiked[user.uid]) {
                           loveBtn.classList.add("liked");
                        }
                     })
                  } else {
                     loveBtn.innerHTML = `<i class="fa-solid fa-heart"></i> 0`;
                  }
                  loveBtn.setAttribute("id", `like-${noteContent.id}`);
                  noteDiv.appendChild(loveBtn);

                  // Add renote button
                  const renoteBtn = document.createElement("p");
                  renoteBtn.classList.add("renoteBtn");
                  if (noteContent.renotes !== undefined) {
                     renoteBtn.innerHTML = `<i class="fa-solid fa-retweet"></i> ${noteContent.renotes}`;

                     firebase.auth().onAuthStateChanged(user => {
                        if (noteContent.whoRenoted && noteContent.whoRenoted[user.uid]) {
                           renoteBtn.classList.add("renoted");
                        }
                     })
                  } else {
                     renoteBtn.innerHTML = `<i class="fa-solid fa-retweet"></i> 0`;
                  }
                  renoteBtn.setAttribute("id", `renote-${noteContent.id}`);
                  noteDiv.appendChild(renoteBtn);

                  // Add reply button
                  const replyBtn = document.createElement("p");
                  replyBtn.classList.add("renoteBtn");
                  if (noteContent.replies !== undefined) {
                     replyBtn.innerHTML = `<i class="fa-solid fa-comment"></i> ${noteContent.replies}`;
                  } else {
                     replyBtn.innerHTML = `<i class="fa-solid fa-comment"></i> 0`;
                  }
                  if (pathName !== "/note") {
                     replyBtn.setAttribute("onclick", `window.location.href="/note?id=${noteContent.id}";`);
                  } else {
                     replyBtn.setAttribute("onclick", "replyToNote(this);");
                  }
                  noteDiv.appendChild(replyBtn);

                  // Add quote renote button
                  const quoteRenote = document.createElement("p");
                  quoteRenote.classList.add("quoteRenoteBtn");
                  quoteRenote.innerHTML = `<i class="fa-solid fa-quote-left"></i>`;
                  quoteRenote.setAttribute("onclick", `quoteRenote("${noteContent.id}")`);
                  noteDiv.appendChild(quoteRenote);

                  // If user created the note, allow them to edit/delete
                  firebase.auth().onAuthStateChanged(user => {
                     if (user) {
                        if (user.uid === noteContent.whoSentIt) {
                           const more = document.createElement("p");
                           more.classList.add("more");
                           more.innerHTML = `<i class="fa-solid fa-pen-to-square"></i>`;
                           noteDiv.appendChild(more);
                        }
                     }
                  })

                  // Render note
                  // BUT check for certain things first (such as if user is suspended, if user is blocked, etc.)
                  // Prevent suspended users notes from rendering
                  firebase.database().ref(`users/${noteContent.whoSentIt}`).once("value", snapshot => {
                     const isSuspended = snapshot.val();

                     if (isSuspended.suspensionStatus !== undefined) {
                        noteDiv.remove();
                     }
                  })

                  // If all is okay, do it fine.
                  if (pathName === "/u") {
                     if (noteContent.replyingTo === undefined) {
                        if (noteContent.isDeleted !== true) {
                           notesDiv.appendChild(noteDiv);
                        }
                     }
                  }
               });
            })
            .catch(error => {
               console.error("TransSocial encountered an error trying to load notes:", error);
               console.error("TransSocial encountered an error trying to load notes: " + error + " Please check your internet connection or report an issue on GitHub (https://github.com/katniny/transsocial-issues/issues).");
            });

         function createNoteDiv(noteContent) {
            const noteDiv = document.createElement('div');
            noteDiv.className = 'note';
            noteDiv.setAttribute("id", `${noteContent.id}`);
            return noteDiv;
         }
      }

      // Achievements
      firebase.database().ref(`users/${profileExists.user}/achievements/transsocial/firstSteps`).once("value", (snapshot) => {
         const unlocked = snapshot.exists();
         const data = snapshot.val();

         if (unlocked === true) {
            document.getElementById("firstStepsAchievement").classList.remove("locked");
            document.getElementById("unlockDescription_fs").textContent = "You've taken the plunge! Welcome to TransSocial! (Create a note)";
            document.getElementById("unlockDate_fs").textContent = `Unlocked ${data.unlockedWhen}`;
         } else {
            firebase.database().ref(`users/${profileExists.user}`).once("value", (snapshot) => {
               const user = snapshot.val();

               document.getElementById("unlockDescription_fs").textContent = `@${user.username} hasn't unlocked this achievement yet.`;
            })
         }
      })

      firebase.database().ref(`users/${profileExists.user}/achievements/transsocial/expressYourself`).once("value", (snapshot) => {
         const unlocked = snapshot.exists();
         const data = snapshot.val();

         if (unlocked === true) {
            document.getElementById("expressYourselfAchievement").classList.remove("locked");
            document.getElementById("unlockDescription_ey").textContent = "Unleash your inner rockstar! (Renote a note)";
            document.getElementById("unlockDate_ey").textContent = `Unlocked ${data.unlockedWhen}`;
         } else {
            firebase.database().ref(`users/${profileExists.user}`).once("value", (snapshot) => {
               const user = snapshot.val();

               document.getElementById("unlockDescription_ey").textContent = `@${user.username} hasn't unlocked this achievement yet.`;
            })
         }
      })

      firebase.database().ref(`users/${profileExists.user}/achievements/transsocial/theSocialButterfly`).once("value", (snapshot) => {
         const unlocked = snapshot.exists();
         const data = snapshot.val();

         if (unlocked === true) {
            document.getElementById("theSocialButterflyAchievement").classList.remove("locked");
            document.getElementById("unlockDescription_tsb").textContent = "Spread your wings and fly! (Follow another user on TransSocial)";
            document.getElementById("unlockDate_tsb").textContent = `Unlocked ${data.unlockedWhen}`;
         } else {
            firebase.database().ref(`users/${profileExists.user}`).once("value", (snapshot) => {
               const user = snapshot.val();

               document.getElementById("unlockDescription_tsb").textContent = `@${user.username} hasn't unlocked this achievement yet.`;
            })
         }
      })

      firebase.database().ref(`users/${profileExists.user}/achievements/transsocial/chatterbox`).once("value", (snapshot) => {
         const unlocked = snapshot.exists();
         const data = snapshot.val();

         if (unlocked === true) {
            document.getElementById("chatterboxAchievement").classList.remove("locked");
            document.getElementById("unlockDescription_cb").textContent = "Conversation starter! (Reply to a note)";
            document.getElementById("unlockDate_cb").textContent = `Unlocked ${data.unlockedWhen}`;
         } else {
            firebase.database().ref(`users/${profileExists.user}`).once("value", (snapshot) => {
               const user = snapshot.val();

               document.getElementById("unlockDescription_cb").textContent = `@${user.username} hasn't unlocked this achievement yet.`;
            })
         }
      })
   })

   function followUser() {
      firebase.auth().onAuthStateChanged((user) => {
         const currentUserUid = user.uid;
         const profileUserUid = profileExists.user;
         const currentUserFollowsRef = firebase.database().ref(`users/${profileUserUid}/whoFollows`);
         let isBlocked = null;

         currentUserFollowsRef.once('value', (snapshot) => {
            const followersData = snapshot.val();

            firebase.database().ref(`users/${profileUserUid}/blocked`).once("value", (snapshot) => {
               const getUser = snapshot.val();

               if (getUser && getUser[user.uid]) {
                  document.getElementById('youAreBlocked').showModal();
               } else {
                  if (followersData && followersData[currentUserUid]) {
                     firebase.database().ref().update({
                        [`users/${profileUserUid}/whoFollows/${currentUserUid}`]: null,
                        [`users/${profileUserUid}/followers`]: firebase.database.ServerValue.increment(-1),
                        [`users/${currentUserUid}/followingWho/${profileUserUid}`]: null,
                        [`users/${currentUserUid}/following`]: firebase.database.ServerValue.increment(-1)
                     }); // ENDS HERE.

                     unblockUser();
                     //window.location.reload();
                  } else {
                     firebase.auth().onAuthStateChanged((user) => {
                        if (user) { // Check if user is logged in 
                           const currentUserUid = user.uid;
                           const profileUserUid = profileExists.user; // Assuming you get this from elsewhere

                           // Use a database transaction
                           firebase.database().ref().update({
                              [`users/${profileUserUid}/whoFollows/${currentUserUid}`]: { uid: currentUserUid },
                              [`users/${profileUserUid}/followers`]: firebase.database.ServerValue.increment(1),
                              [`users/${currentUserUid}/followingWho/${profileUserUid}`]: { uid: profileUserUid },
                              [`users/${currentUserUid}/following`]: firebase.database.ServerValue.increment(1)
                           });

                           const newNotiKey = firebase.database().ref("users/" + profileUserUid + "notifications/").push().key;

                           const notiData = {
                              type: "Follow",
                              who: currentUserUid,
                           }

                           firebase.database().ref(`users/${profileUserUid}/notifications/`).child(newNotiKey).set(notiData);
                           firebase.database().ref().update({
                              [`users/${profileUserUid}/notifications/unread`]: firebase.database.ServerValue.increment(1)
                           });

                           unlockAchievement("The Social Butterfly");

                           window.location.reload();
                        }
                     });
                  }

               }
            })
         });
      })
   }

   // User Actions
   function userActions() {
      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            document.getElementById("userActions-dialog").showModal();
         } else {
            loginModal();
         }
      })
   }

   function blockUser() {
      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}/blocked/${profileExists.user}`).update({
               user: profileExists.user
            })

            firebase.database().ref(`users/${user.uid}/followingWho/${profileExists.user}`).once("value", (snapshot) => {
               const exists = snapshot.val();

               if (exists === null) {
                  window.location.reload();
               } else {
                  followUser();
               }
            })
         } else {
            loginPrompt();
         }
      })
   }

   function unblockUser() {
      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}/blocked/${profileExists.user}`).update({
               user: null
            })

            window.location.reload();
         } else {
            loginPrompt();
         }
      })
   }

   // Filters
   function notesFilter() {
      document.getElementById("filterNotes").classList.add("active");
      document.getElementById("filterAchievements").classList.remove("active");

      document.getElementById("notes").style.display = "block";
      document.getElementById("achievementsContent").style.display = "none";
   }

   function achievementsFilter() {
      document.getElementById("filterNotes").classList.remove("active");
      document.getElementById("filterAchievements").classList.add("active");

      document.getElementById("notes").style.display = "none";
      document.getElementById("achievementsContent").style.display = "block";
   }
};

// Upload Notes with or without images
function uploadImage() {
   const imageUploadInput = document.getElementById("imageUploadInput");
   imageUploadInput.click();

   document.getElementById("imageUploadInput").addEventListener("change", () => {
      let fileName = document.getElementById("imageUploadInput").value;
      let extension = fileName.split(".").pop();

      if (extension !== "png" && extension !== "jpg" && extension !== "webp" && extension !== "jpeg" && extension !== "gif" && extension !== "mp4") {
         document.getElementById("uploadingImage").textContent = "Unsupported file type. Only .png, .jpg (.jpeg), .webp, .gif and .mp4 files are supported.";
         document.getElementById("uploadingImage").style.display = "block";
         document.getElementById("imageUploadInput").value = "";
         document.getElementById("uploadingImage").style.color = "var(--error-text)";
      } else {
         document.getElementById("uploadingImage").textContent = "";
         document.getElementById("uploadingImage").style.display = "none";

         let file = event.target.files[0];
         if (file) {
            const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

            if (file.size > MAX_FILE_SIZE_BYTES) {
               document.getElementById("uploadingImage").textContent = "File size is over the file size limit (5MB).";
               document.getElementById("uploadingImage").style.display = "block";
               document.getElementById("uploadingImage").style.color = "var(--error-text)";
               document.getElementById("imageUploadInput").value = "";
               document.getElementById("imgToBeUploaded").style.display = "none";
            } else {
               if (extension !== "mp4") {
                  const reader = new FileReader();

                  reader.addEventListener("load", (event) => {
                     document.getElementById("imgToBeUploaded").src = event.target.result;
                     document.getElementById("imgToBeUploaded").style.display = "block";
                     document.getElementById("hasntBeenUploadedNotice").style.display = "block";
                     document.getElementById("removeUploadedImage").style.display = "block";
                     document.getElementById("addAltTextToImage").style.display = "block";
                  });

                  reader.readAsDataURL(file);
               } else {
                  const reader = new FileReader();

                  reader.addEventListener("load", (event) => {
                     document.getElementById("vidToBeUploaded").src = event.target.result;
                     document.getElementById("vidToBeUploaded").style.display = "block";
                     document.getElementById("vidToBeUploaded").style.display = "block";
                     document.getElementById("hasntBeenUploadedNotice").style.display = "block";
                     document.getElementById("removeUploadedImage").style.display = "block";
                     document.getElementById("addAltTextToImage").style.display = "block";
                  });

                  reader.readAsDataURL(file);
               }
            }
         }
      }
   })
}

function removeImage() {
   document.getElementById("imgToBeUploaded").src = "";
   document.getElementById("vidToBeUploaded").src = "";
   document.getElementById("vidToBeUploaded").style.display = "none";
   document.getElementById("imageUploadInput").value = "";
   document.getElementById("removeUploadedImage").style.display = "none";
   document.getElementById("hasntBeenUploadedNotice").style.display = "none";
   document.getElementById("addAltTextToImage").style.display = "none";
}

function isTextareaEmpty(text) {
   const trimmedValue = text.trim();
   return /^\s*$/.test(trimmedValue);
}

// Remove Sensitive Content Warning
function removeSensitive(buttonId) {
   // Remove "-closeWarning" from the ID to get the note's ID
   const noteId = buttonId.slice(0, -13);

   // Delete the warning, info about the warning, the button and the blur
   document.getElementById(`${noteId}-warning`).remove();
   document.getElementById(`${noteId}-warningInfo`).remove();
   document.getElementById(`${noteId}-closeWarning`).remove();
   document.getElementById(`${noteId}-blur`).remove();
}

// Remove NSFW Content Warning
function removeNsfw(buttonId) {
   // Remove "-closeWarning" from the ID to get the note's ID
   const noteId = buttonId.slice(0, -13);

   // Delete the warning, info about the warning, the button and the blur
   document.getElementById(`${noteId}-warning`).remove();
   document.getElementById(`${noteId}-closeWarning`).remove();
   document.getElementById(`${noteId}-warningInfo`).remove();
   document.getElementById(`${noteId}-blur`).remove();
}

// Get the note's information to display in the container
let uniNoteId_notehtml = null;
let isReplying_notehtml = false;

if (pathName === "/note.html" || pathName === "/note") {
   const url = new URL(window.location.href);
   const userParam = url.searchParams.get("id");
   isReplying_notehtml = false;

   database.ref(`notes/${userParam}`).once("value", (snapshot) => {
      const noteData = snapshot.val();

      uniNoteId_notehtml = noteData.id;

      if (noteData.user !== null && noteData.replyingTo === undefined) {
         document.getElementById("melissa").style.display = "block";
         document.getElementById("noteNotFound").style.display = "none";

         document.getElementById("quoteRenoteButton").setAttribute("onclick", `quoteRenote("${noteData.id}")`);
         if (noteData.quoting) {
            firebase.database().ref(`notes/${noteData.quoting}`).once("value", (snapshot) => {
               const quoteData = snapshot.val();

               firebase.database().ref(`users/${quoteData.whoSentIt}`).once("value", (snapshot) => {
                  const quoteUser = snapshot.val();

                  document.getElementById("noteQuotePfp").src = `https://firebasestorage.googleapis.com/v0/b/chat-transsocial-test.appspot.com/o/images%2Fpfp%2F${quoteData.whoSentIt}%2F${quoteUser.pfp}?alt=media`;
                  document.getElementById("noteQuoteDisplay").textContent = quoteUser.display;
                  document.getElementById("noteQuoteUsername").textContent = `@${quoteUser.username}`;
                  document.getElementById("noteQuoteText").textContent = quoteData.text;
                  twemoji.parse(document.getElementById("noteQuoteText"), {
                     folder: 'svg',
                     ext: '.svg'
                  });

                  document.getElementById("quotingNote_note").setAttribute("onclick", `window.location.href="/note?id=${quoteData.id}"`);
               })
            })
         } else {
            document.getElementById("quotingNote_note").style.display = "none";
         }

         database.ref(`users/${noteData.whoSentIt}`).once("value", (snapshot) => {
            const profileData = snapshot.val();
            document.title = `"${noteData.text}" / @${profileData.username} on TransSocial`;
            document.getElementById(`melissa`).style.display = "block";
            document.getElementById(`userImage-profile`).src = `https://firebasestorage.googleapis.com/v0/b/chat-transsocial-test.appspot.com/o/images%2Fpfp%2F${noteData.whoSentIt}%2F${profileData.pfp}?alt=media`;
            document.getElementById(`userImage-profile`).setAttribute("onclick", `window.location.href="/u?id=${profileData.username}"`);
            document.getElementById(`display-profile`).textContent = profileData.display;
            document.getElementById(`display-profile`).setAttribute("onclick", `window.location.href="/u?id=${profileData.username}"`);
            if (profileData.isVerified) {
               const verifiedBadge = document.createElement("span");
               verifiedBadge.innerHTML = `<i class="fa-solid fa-circle-check fa-sm"></i>`;
               verifiedBadge.classList.add("noteBadges");
               document.getElementById("display-profile").appendChild(verifiedBadge);
               verifiedBadge.style.marginLeft = "7px";
            }
            document.getElementById(`username-profile`).textContent = `@${profileData.username}`;
            document.getElementById(`username-profile`).setAttribute("onclick", `window.location.href="/u?id=${profileData.username}"`);
            if (profileData.pronouns === undefined || profileData.pronouns === null || profileData.pronouns === "") {
               document.getElementById(`pronouns-profile`).remove();
            } else {
               document.getElementById(`pronouns-profile`).textContent = profileData.pronouns;
               document.getElementById(`pronouns-profile`).setAttribute("onclick", `window.location.href="/u?id=${profileData.username}"`);
            }

            document.getElementById("noteContent").innerHTML = sanitizeAndLinkify(noteData.text);
            twemoji.parse(document.getElementById("noteContent"), {
               folder: 'svg',
               ext: '.svg'
            });
            document.getElementById("likeButton").innerHTML = `<i class="fa-solid fa-heart"></i> ${noteData.likes}`;
            document.getElementById("renoteButton").innerHTML = `<i class="fa-solid fa-retweet"></i> ${noteData.renotes}`;

            if (noteData.image) {
               let imageFileName = noteData.image;
               let imageExtension = imageFileName.split(".").pop();
               const url = imageExtension;
               const cleanUrl = url.split('?')[0];

               if (cleanUrl === "mp4") {
                  document.getElementById("uploadedVideo-main").src = noteData.image;
                  document.getElementById("uploadedVideo-main").setAttribute("alt", `${noteData.alt}`);
                  firebase.auth().onAuthStateChanged((user) => {
                     if (user) {
                        firebase.database().ref(`users/${user.uid}/autoplayVideos`).once("value", (snapshot) => {
                           const evenExists = snapshot.exists();
                           const pref = snapshot.val();

                           if (evenExists === true) {
                              if (pref === "true") {
                                 // :p
                              } else if (pref === false) {
                                 document.getElementById("uploadedVideo-main").pause();
                              } else {
                                 // :p
                              }
                           } else {
                              // :p
                           }
                        })
                     } else {
                        // :p
                     }
                  })
                  document.getElementById("uploadedImg-main").remove();
               } else {
                  document.getElementById("uploadedImg-main").src = noteData.image;
                  document.getElementById("uploadedImg-main").setAttribute("alt", `${noteData.alt}`);
                  document.getElementById("uploadedVideo-main").remove();
               }
            } else {
               document.getElementById("uploadedImg-main").remove();
               document.getElementById("uploadedVideo-main").remove();
            }

            firebase.auth().onAuthStateChanged((user) => {
               if (user) {
                  const uid = user.uid;

                  if (noteData.whoLiked && noteData.whoLiked[uid]) {
                     document.getElementById("likeButton").classList.add("liked");
                  } else {
                     document.getElementById("likeButton").classList.remove("liked");
                  }

                  if (noteData.whoRenoted && noteData.whoRenoted[uid]) {
                     document.getElementById("renoteButton").classList.add("renoted");
                  } else {
                     document.getElementById("renoteButton").classList.remove("renoted");
                  }
               } else {
                  document.getElementById("likeButton").classList.remove("liked");
               }
            })

         })
      } else if (noteData === undefined) {
         document.getElementById("melissa").style.display = "none";
      } else if (noteData.replyingTo !== undefined) {
         window.location.replace(`/note?id=${noteData.replyingTo}`);
      } else {
         document.getElementById("melissa").style.display = "none";
      }

      if (userParam === "" || userParam === "undefined") {
         document.getElementById("melissa").style.display = "none";
         document.getElementById("noteNotFound").style.display = "block";
      }
   })

   function likeNote() {
      database.ref(`notes/${uniNoteId_notehtml}`).once("value", (snapshot) => {
         const data = snapshot.val();

         firebase.auth().onAuthStateChanged((user) => {
            if (user) {
               if (data.whoLiked && data.whoLiked[user.uid]) {
                  firebase.database().ref(`notes/${data.id}/whoLiked/${user.uid}`).remove();

                  firebase.database().ref(`notes/${data.id}`).update({
                     likes: data.likes - 1
                  })

                  database.ref(`notes/${uniNoteId_notehtml}`).once("value", (snapshot) => {
                     const newData = snapshot.val();

                     document.getElementById("likeButton").innerHTML = `<i class="fa-solid fa-heart"></i> ${newData.likes}`;
                     document.getElementById("likeButton").classList.remove("liked");
                  })
               } else {
                  firebase.database().ref(`notes/${data.id}/whoLiked/${user.uid}`).update({
                     uid: user.uid
                  })

                  firebase.database().ref(`notes/${data.id}`).update({
                     likes: data.likes + 1
                  })

                  database.ref(`notes/${uniNoteId_notehtml}`).once("value", (snapshot) => {
                     const newData = snapshot.val();

                     document.getElementById("likeButton").innerHTML = `<i class="fa-solid fa-heart"></i> ${newData.likes}`;
                     document.getElementById("likeButton").classList.add("liked");
                  })

                  firebase.database().ref(`notes/${uniNoteId_notehtml}`).once("value", (snapshot) => {
                     const whoSentIt_note = snapshot.val();

                     if (user.uid !== whoSentIt_note.whoSentIt) {
                        firebase.database().ref(`notes/${uniNoteId_notehtml}`).once("value", (snapshot) => {
                           const getUser = snapshot.val();

                           const newNotiKey = firebase.database().ref("users/" + getUser.whoSentIt + "notifications/").push().key;

                           const notiData = {
                              type: "Love",
                              who: user.uid,
                              postId: uniNoteId_notehtml,
                           }

                           firebase.database().ref(`users/${getUser.whoSentIt}/notifications/`).child(newNotiKey).set(notiData);
                           firebase.database().ref().update({
                              [`users/${getUser.whoSentIt}/notifications/unread`]: firebase.database.ServerValue.increment(1)
                           });
                        })
                     }
                  })
               }
            }
         })
      })
   }

   function renoteNote() {
      database.ref(`notes/${uniNoteId_notehtml}`).once("value", (snapshot) => {
         const data = snapshot.val();

         firebase.auth().onAuthStateChanged((user) => {
            if (user) {
               if (data.whoRenoted && data.whoRenoted[user.uid]) {
                  firebase.database().ref(`notes/${data.id}/whoRenoted/${user.uid}`).remove();

                  firebase.database().ref(`notes/${data.id}`).update({
                     renotes: data.renotes - 1
                  })

                  firebase.database().ref(`users/${user.uid}/posts/${data.id}`).remove();

                  database.ref(`notes/${uniNoteId_notehtml}`).once("value", (snapshot) => {
                     const newData = snapshot.val();

                     document.getElementById("renoteButton").innerHTML = `<i class="fa-solid fa-retweet"></i> ${newData.renotes}`;
                     document.getElementById("renoteButton").classList.remove("renoted");
                  })
               } else {
                  firebase.database().ref(`notes/${data.id}/whoRenoted/${user.uid}`).update({
                     uid: user.uid
                  })

                  firebase.database().ref(`notes/${data.id}`).update({
                     renotes: data.renotes + 1
                  })

                  firebase.database().ref(`users/${user.uid}/posts/${data.id}`).update({
                     isRenote: true
                  })

                  database.ref(`notes/${uniNoteId_notehtml}`).once("value", (snapshot) => {
                     const newData = snapshot.val();

                     document.getElementById("renoteButton").innerHTML = `<i class="fa-solid fa-retweet"></i> ${newData.renotes}`;
                     document.getElementById("renoteButton").classList.add("renoted");
                  })

                  firebase.database().ref(`notes/${uniNoteId_notehtml}`).once("value", (snapshot) => {
                     const whoSentIt_note = snapshot.val();

                     if (user.uid !== whoSentIt_note.whoSentIt) {
                        firebase.database().ref(`notes/${uniNoteId_notehtml}`).once("value", (snapshot) => {
                           const getUser = snapshot.val();

                           const newNotiKey = firebase.database().ref("users/" + getUser.whoSentIt + "notifications/").push().key;

                           const notiData = {
                              type: "Renote",
                              who: user.uid,
                              postId: uniNoteId_notehtml,
                           }

                           firebase.database().ref(`users/${getUser.whoSentIt}/notifications/`).child(newNotiKey).set(notiData);
                           firebase.database().ref().update({
                              [`users/${getUser.whoSentIt}/notifications/unread`]: firebase.database.ServerValue.increment(1)
                           });
                        })
                     }
                  })

                  unlockAchievement("Express Yourself");
               }
            }
         })
      })
   }

   function replyToNote(element) {
      isReplying_notehtml = true;
      const noteContainer = element.closest('.note');

      if (noteContainer) {
         const usernameElement = noteContainer.querySelector('.noteUsername');
         const username = usernameElement.textContent;

         const fullUsernameText = usernameElement.textContent;
         const regex = /@(\w+)/; // Capture usernames with letters, numbers, or underscores
         const match = fullUsernameText.match(regex);

         if (match) {
            const username = match[1];
            replyingOrCreating.textContent = "Replying to @" + username;

            document.getElementById("noteContent-textarea").value = `@${username} `;
         }

         createNotePopup();
      } else {
         replyingOrCreating.textContent = "Replying to Note";
         createNotePopup();
      }
   }
};

// Upload Notes with or without images (cont.)
function addAltText() {
   document.getElementById("addAltText").showModal();
}

function addAltText_finish() {
   document.getElementById("addAltText").close();
}

async function publishNote() {
   firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
         document.getElementById("coverCreateANote").style.display = "block";

         const notesRef = firebase.database().ref("notes");
         const userNotes = firebase.database().ref(`users/${user.uid}/posts`);
         const newNoteKey = notesRef.push().key;

         // if (pathName === "/note" || pathName === "/note.html") {
         //     console.log(isReplying_notehtml);
         //     console.log(uniNoteId_notehtml);
         // }

         const noteContent = document.getElementById("noteContent-textarea").value;

         if (isTextareaEmpty(noteContent)) {
            document.getElementById("noteError").textContent = "You can't create notes without text! Try adding some content!";
            return;
         }

         const renoteData = {
            isRenote: false,
         }

         const imageUploadInput = document.getElementById("imageUploadInput");
         const file = imageUploadInput.files[0];

         const postData = {
            text: noteContent,
            whoSentIt: user.uid,
            id: newNoteKey,
            likes: 0,
            renotes: 0,
            replies: 0,
            isNsfw: document.getElementById("isNsfw").checked,
            isSensitive: document.getElementById("isSensitive").checked,
            isPolitical: document.getElementById("isPolitical").checked,
            createdAt: firebase.database.ServerValue.TIMESTAMP,
            alt: document.getElementById("altText_input").value
         }

         if (renotingNote !== null) {
            postData.quoting = renotingNote;
         }

         if (isReplying_notehtml === true) {
            unlockAchievement("Chatterbox");

            if (pathName === "/note" || pathName === "/note.html") {
               postData.replyingTo = uniNoteId_notehtml;

               firebase.database().ref(`notes/${uniNoteId_notehtml}`).once("value", (snapshot) => {
                  const replyData = snapshot.val();

                  if (user.uid !== replyData.whoSentIt) {
                     firebase.database().ref(`users/${replyData.whoSentIt}`).once("value", (snapshot) => {
                        const newNotiKey = firebase.database().ref("users/" + replyData.whoSentIt + "notifications/").push().key;
                        const notiData = {
                           type: "Reply",
                           who: user.uid,
                           postId: uniNoteId_notehtml,
                        }
                        firebase.database().ref(`users/${replyData.whoSentIt}/notifications/`).child(newNotiKey).set(notiData);
                        firebase.database().ref().update({
                           [`users/${replyData.whoSentIt}/notifications/unread`]: firebase.database.ServerValue.increment(1)
                        });
                     })
                  }

                  if (replyData.replies === undefined) {
                     firebase.database().ref(`notes/${uniNoteId_notehtml}`).update({
                        replies: 1
                     });
                  } else {
                     firebase.database().ref(`notes/${uniNoteId_notehtml}`).update({
                        replies: replyData.replies + 1
                     });

                     loveCountRef.off();
                  }
               });
            }
         } else {
            unlockAchievement("First Steps");
         }

         try {
            if (file) {
               const storageRef = firebase.storage().ref();
               const imageRef = storageRef.child(`images/notes/${user.uid}/${newNoteKey}-${file.name}`);
               const snapshot = await imageRef.put(file);

               const imageUrl = await snapshot.ref.getDownloadURL();
               postData.image = imageUrl;
            }

            await notesRef.child(newNoteKey).set(postData);
            await userNotes.child(newNoteKey).set(renoteData);

            const notePopup = document.getElementById("createNote-popup");

            document.getElementById("noteContent-textarea").value = "";
            document.getElementById("uploadingImage").style.display = "none";
            removeImage();
            document.getElementById("hasntBeenUploadedNotice").style.display = "none";
            if (pathName === "/note" || pathName === "/note.html") {
               document.getElementById("replyingOrCreating").innerText = "Create a Note!";
               isReplying_notehtml = false;
            }
            document.getElementById("isNsfw").checked = false;
            document.getElementById("isSensitive").checked = false;

            document.getElementById("coverCreateANote").style.display = "none";
            document.getElementById("successfullySent").style.display = "block";
            renotingNote = null;
            document.getElementById("altText_input").value = "";
            notePopup.close();

            setTimeout(function () {
               document.getElementById("successfullySent").style.display = "none";
            }, 3000);
         } catch (error) {
            document.getElementById("noteError").textContent = "Error publishing note: " + error.message;
         }
      } else {
         loginPrompt();
      }
   })
};

// Settings Page
if (pathName === "/settings" || pathName === "/settings.html") {
   // Swap tabs
   function profileTab() {
      // Set active tab & set others inactive
      document.getElementById("profileTab").classList.add("active");
      document.getElementById("accountTab").classList.remove("active");
      document.getElementById("personalizationTab").classList.remove("active");
      document.getElementById("subscriptionTab").classList.remove("active");

      // Show section
      document.getElementById("profileTab-display").style.display = "block";
      document.getElementById("profileTab-account").style.display = "none";
      document.getElementById("profileTab-personalization").style.display = "none";
      document.getElementById("profileTab-subscription").style.display = "none";
   }

   function accountTab() {
      // Set active tab & set others inactive
      document.getElementById("profileTab").classList.remove("active");
      document.getElementById("accountTab").classList.add("active");
      document.getElementById("personalizationTab").classList.remove("active");
      document.getElementById("subscriptionTab").classList.remove("active");

      // Show section
      document.getElementById("profileTab-display").style.display = "none";
      document.getElementById("profileTab-account").style.display = "block";
      document.getElementById("profileTab-personalization").style.display = "none";
      document.getElementById("profileTab-subscription").style.display = "none";
   }

   function personalizationTab() {
      // Set active tab & set others inactive
      document.getElementById("profileTab").classList.remove("active");
      document.getElementById("accountTab").classList.remove("active");
      document.getElementById("personalizationTab").classList.add("active");
      document.getElementById("subscriptionTab").classList.remove("active");

      // Show section
      document.getElementById("profileTab-display").style.display = "none";
      document.getElementById("profileTab-account").style.display = "none";
      document.getElementById("profileTab-personalization").style.display = "block";
      document.getElementById("profileTab-subscription").style.display = "none";
   }

   function subscriptionTab() {
      // Set active tab & set others inactive
      document.getElementById("profileTab").classList.remove("active");
      document.getElementById("accountTab").classList.remove("active");
      document.getElementById("personalizationTab").classList.remove("active");
      document.getElementById("subscriptionTab").classList.add("active");

      // Show section
      document.getElementById("profileTab-display").style.display = "none";
      document.getElementById("profileTab-account").style.display = "none";
      document.getElementById("profileTab-personalization").style.display = "none";
      document.getElementById("profileTab-subscription").style.display = "block";
   }

   // Set defaults
   firebase.auth().onAuthStateChanged((user) => {
      if (user) {
         firebase.database().ref(`users/${user.uid}`).once("value", (snapshot) => {
            const userData = snapshot.val();

            // Set user profile picture
            if (userData.pfp !== undefined) {
               document.getElementById("profilePicture_settings").src = `https://firebasestorage.googleapis.com/v0/b/chat-transsocial-test.appspot.com/o/images%2Fpfp%2F${user.uid}%2F${userData.pfp}?alt=media`;
            }

            // Display name
            if (userData.display !== undefined) {
               document.getElementById("displayName-text").value = `${userData.display}`;
               document.getElementById("characterLimit_display").textContent = `${userData.display.length}/25`;
            }

            // Username
            if (userData.username !== undefined) {
               document.getElementById("username-text").value = `${userData.username}`;
               document.getElementById("characterLimit_username").textContent = `${userData.username.length}/20`;
            }

            // Pronouns
            if (userData.pronouns !== undefined) {
               document.getElementById("pronouns-text").value = `${userData.pronouns}`;
               document.getElementById("characterLimit_pronouns").textContent = `${userData.pronouns.length}/15`;
            }

            // Bio
            if (userData.bio) {
               document.getElementById("bioText").value = `${userData.bio}`;
               document.getElementById("characterLimit_bio").textContent = `${userData.bio.length}/500`;
            }

            // Email address
            document.getElementById("email-address").value = `${userData.email}`;

            // Get input and show "Save" button if different from current.
            document.addEventListener("input", () => {
               if (event.target === document.getElementById("displayName-text")) {
                  if (document.getElementById("displayName-text").value !== userData.display) {
                     document.getElementById("saveDisplay").style.display = "block";
                  } else {
                     document.getElementById("saveDisplay").style.display = "none";
                  }
               }
            })

            document.addEventListener("input", () => {
               if (event.target === document.getElementById("username-text")) {
                  if (document.getElementById("username-text").value !== userData.username) {
                     document.getElementById("saveUsername").style.display = "block";
                     document.getElementById("usernameNotice").style.display = "block";
                  } else {
                     document.getElementById("saveUsername").style.display = "none";
                     document.getElementById("usernameNotice").style.display = "none";
                  }
               }
            })

            document.addEventListener("input", () => {
               if (event.target === document.getElementById("pronouns-text")) {
                  if (document.getElementById("pronouns-text").value !== userData.pronouns) {
                     document.getElementById("savePronouns").style.display = "block";
                  } else {
                     document.getElementById("savePronouns").style.display = "none";
                  }
               }
            })

            document.addEventListener("input", () => {
               if (event.target === document.getElementById("bioText")) {
                  if (document.getElementById("bioText").value !== userData.bio) {
                     document.getElementById("saveBio").style.display = "block";
                  } else {
                     document.getElementById("saveBio").style.display = "none";
                  }
               }
            })

            document.addEventListener("input", () => {
               if (event.target === document.getElementById("email-address")) {
                  if (document.getElementById("email-address").value !== userData.email) {
                     document.getElementById("saveEmail").style.display = "block";
                  } else {
                     document.getElementById("saveEmail").style.display = "none";
                  }
               }
            })
         })
      } else {
         window.location.replace("/");
      }
   })

   // Save display name
   function setDisplayName() {
      if (!document.getElementById("saveDisplay").classList.contains("disabled")) {
         document.getElementById("saveDisplay").innerHTML = `<i class="fa-solid fa-spinner fa-spin-pulse"></i> Setting Display...`;
         document.getElementById("saveDisplay").classList.add("disabled");
         document.getElementById("errorUsingDisplay").style.display = "none";

         const displayValue = document.getElementById("displayName-text").value.trim();

         if (displayValue === "") {
            document.getElementById("errorUsingDisplay").textContent = "Your display name cannot be empty."
            document.getElementById("errorUsingDisplay").style.display = "block";
            document.getElementById("saveDisplay").innerHTML = `Save`;
            document.getElementById("saveDisplay").style.display = "none";
            document.getElementById("saveDisplay").classList.remove("disabled");
         } else {
            firebase.auth().onAuthStateChanged((user) => {
               firebase.database().ref(`users/${user.uid}`).update({
                  display: document.getElementById("displayName-text").value
               })
                  .then(() => {
                     window.location.reload();
                  }).catch((error) => {
                     document.getElementById("errorUsingDisplay").textContent = `Error saving display name: ${error.message}`;
                     document.getElementById("errorUsingDisplay").style.display = "block";
                     document.getElementById("saveDisplay").innerHTML = `Save`;
                     document.getElementById("saveDisplay").style.display = "none";
                     document.getElementById("saveDisplay").classList.remove("disabled");
                  })
            })
         }
      }
   }

   // Set username
   function setUsername() {
      if (!document.getElementById("saveUsername").classList.contains("disabled")) {
         document.getElementById("saveUsername").innerHTML = `<i class="fa-solid fa-spinner fa-spin-pulse"></i> Checking whitespace...`;
         document.getElementById("saveUsername").classList.add("disabled");
         document.getElementById("errorTakingUsername").style.display = "none";

         const userValue = document.getElementById("username-text").value.trim();

         if (userValue === "") {
            document.getElementById("errorTakingUsername").textContent = "Your username cannot be empty."
            document.getElementById("errorTakingUsername").style.display = "block";
            document.getElementById("saveUsername").innerHTML = `Save`;
            document.getElementById("saveUsername").style.display = "none";
            document.getElementById("saveUsername").classList.remove("disabled");
            document.getElementById("usernameNotice").style.display = "none";
         } else {
            firebase.auth().onAuthStateChanged((user) => {
               if (user) {
                  firebase.database().ref(`taken-usernames/${document.getElementById("username-text").value}`).once("value", (snapshot) => {
                     const usernameTaken = snapshot.exists();

                     if (usernameTaken === true) {
                        document.getElementById("errorTakingUsername").textContent = `This username is unavailable! Try another!`;
                        document.getElementById("errorTakingUsername").style.display = "block";
                        document.getElementById("saveUsername").innerHTML = `Save`;
                        document.getElementById("saveUsername").style.display = "none";
                        document.getElementById("saveUsername").classList.remove("disabled");
                        document.getElementById("usernameNotice").style.display = "none";
                     } else {
                        firebase.database().ref(`users/${user.uid}`).once("value", (snapshot) => {
                           const data = snapshot.val();

                           document.getElementById("saveUsername").innerHTML = `<i class="fa-solid fa-spinner fa-spin-pulse"></i> Removing old username...`;
                           firebase.database().ref(`taken-usernames/${data.username}`).update({
                              user: null
                           })
                              .then(() => {
                                 document.getElementById("saveUsername").innerHTML = `<i class="fa-solid fa-spinner fa-spin-pulse"></i> Reserving username...`;

                                 firebase.database().ref(`taken-usernames/${document.getElementById("username-text").value}`).update({
                                    user: user.uid
                                 })
                                    .then(() => {
                                       document.getElementById("saveUsername").innerHTML = `<i class="fa-solid fa-spinner fa-spin-pulse"></i> Setting publicly...`;

                                       firebase.database().ref(`users/${user.uid}`).update({
                                          username: document.getElementById("username-text").value
                                       })
                                          .then(() => {
                                             window.location.reload();
                                          })
                                    })
                              })
                        })
                     }
                  })
               }
            })
         }
      }
   }

   // Set pronouns
   function setPronouns() {
      if (!document.getElementById("savePronouns").classList.contains("disabled")) {
         if (!document.getElementById("savePronouns").classList.contains("disabled")) {
            document.getElementById("savePronouns").innerHTML = `<i class="fa-solid fa-spinner fa-spin-pulse"></i> Updating pronouns...`;
            document.getElementById("savePronouns").classList.add("disabled");

            firebase.auth().onAuthStateChanged((user) => {
               firebase.database().ref(`users/${user.uid}`).update({
                  pronouns: document.getElementById("pronouns-text").value
               })
                  .then(() => {
                     window.location.reload();
                  })
            })
         }
      }
   }

   // Set bio
   function setBio() {
      if (!document.getElementById("saveBio").classList.contains("disabled")) {
         document.getElementById("saveBio").innerHTML = `<i class="fa-solid fa-spinner fa-spin-pulse"></i> Updating bio...`;
         document.getElementById("saveBio").classList.add("disabled");

         firebase.auth().onAuthStateChanged((user) => {
            firebase.database().ref(`users/${user.uid}`).update({
               bio: document.getElementById("bioText").value
            })
               .then(() => {
                  window.location.reload();
               })
         })
      }
   }

   // Set new email
   function setEmail() {
      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            document.getElementById("editEmail").showModal();
         }
      })
   }

   function changeEmail_reauth() {
      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).once("value", (snapshot) => {
               const stuff = snapshot.val();
               const currentUser = firebase.auth().currentUser; // renamed to avoid conflict
               const email = stuff.email;
               const passwordInput = document.getElementById("password_reauth_email");

               if (!passwordInput) {
                  console.error('Element with id "password_reauth_email" not found. This is a developer issue!');
                  return;
               }

               const password = passwordInput.value;

               if (!password) {
                  document.getElementById("errorWithReauthenticating_email").textContent = "Password cannot be empty.";
                  document.getElementById("errorWithReauthenticating_email").style.display = "block";
                  return;
               }

               const credential = firebase.auth.EmailAuthProvider.credential(email, password);

               currentUser.reauthenticateWithCredential(credential)
                  .then(() => {
                     document.getElementById("errorWithReauthenticating_email").textContent = "Successful! Changing email, please wait a moment...";
                     document.getElementById("errorWithReauthenticating_email").style.color = "var(--success-color)";
                     document.getElementById("errorWithReauthenticating_email").style.display = "block";

                     // set email
                     currentUser.updateEmail(`${document.getElementById("email-address").value}`).then(() => {
                        firebase.database().ref(`users/${currentUser.uid}`).update({
                           email: document.getElementById("email-address").value
                        })
                           .then(() => {
                              window.location.reload();
                           })
                     }).catch((error) => {
                        document.getElementById("errorWithReauthenticating_email").textContent = `An error occurred: ${error.message}`;
                        document.getElementById("errorWithReauthenticating_email").style.color = "var(--error-text)";
                        document.getElementById("errorWithReauthenticating_email").style.display = "block";
                     })
                  })
                  .catch((error) => {
                     document.getElementById("errorWithReauthenticating_email").textContent = `Failed to reauthenticate: ${error.message}`;
                     document.getElementById("errorWithReauthenticating_email").style.display = "block";
                  });
            });
         }
      });
   }

   // change password
   function sendPasswordResetEmail() {
      if (!document.getElementById("sendPasswordReset").classList.contains("disabled")) {
         document.getElementById("sendPasswordReset").classList.add("disabled")
         const email = document.getElementById("email-address").value;
         document.getElementById("sendPasswordReset").innerHTML = `<i class="fa-solid fa-spinner fa-spin-pulse"></i> Sending...`;

         firebase.auth().sendPasswordResetEmail(email)
            .then(() => {
               document.getElementById("passwordResetSent").textContent = "Password reset email sent!";
               document.getElementById("passwordResetSent").style.color = "var(--success-color)";
               document.getElementById("passwordResetSent").style.display = "block";
               document.getElementById("sendPasswordReset").classList.remove("disabled");
               document.getElementById("sendPasswordReset").innerHTML = `Send Password Reset Email`;
            })
            .catch((error) => {
               document.getElementById("passwordResetSent").textContent = `Failed to send password reset: ${error.message}`;
               document.getElementById("passwordResetSent").style.display = "block";
               document.getElementById("passwordResetSent").style.color = "var(--error-text)";
               document.getElementById("sendPasswordReset").classList.remove("disabled")
               document.getElementById("sendPasswordReset").innerHTML = `Send Password Reset Email`;
            })
      }
   }

   // theme selection
   function selectTheme() {
      document.getElementById("themeSelect").showModal();
   }

   function themeDark() {
      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).update({
               theme: "Dark"
            })
               .then(() => {
                  window.location.reload();
               })
         }
      })
   }

   function themeMintDark() {
      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).update({
               theme: "Mint (Dark)"
            })
               .then(() => {
                  window.location.reload();
               })
         }
      })
   }

   function themeHighContrast() {
      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).update({
               theme: "High Contrast"
            })
               .then(() => {
                  window.location.reload();
               })
         }
      })
   }

   function themeMidnightPurple() {
      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).update({
               theme: "Midnight Purple"
            })
               .then(() => {
                  window.location.reload();
               })
         }
      })
   }

   function themeDarker() {
      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).update({
               theme: "Darker"
            })
               .then(() => {
                  window.location.reload();
               })
         }
      })
   }

   function themeLight() {
      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).update({
               theme: "Light"
            })
               .then(() => {
                  window.location.reload();
               })
         }
      })
   }

   function themeMintLight() {
      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).update({
               theme: "Mint (Light)"
            })
               .then(() => {
                  window.location.reload();
               })
         }
      })
   }

   function themeClassic() {
      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).update({
               theme: "TransSocial Classic"
            })
               .then(() => {
                  window.location.reload();
               })
         }
      })
   }

   // Change mature content preference
   function hideMatureContent() {
      document.getElementById("updatedMatureContentPref").style.display = "none";

      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).update({
               showNsfw: "Hide"
            })
               .then(() => {
                  document.getElementById("updatedMatureContentPref").textContent = "Updated preference to Hide successfully!";
                  document.getElementById("updatedMatureContentPref").style.display = "block";
               })
         }
      })
   }

   function blurMatureContent() {
      document.getElementById("updatedMatureContentPref").style.display = "none";

      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).update({
               showNsfw: "Blur"
            })
               .then(() => {
                  document.getElementById("updatedMatureContentPref").textContent = "Updated preference to Blur successfully!";
                  document.getElementById("updatedMatureContentPref").style.display = "block";
               })
         }
      })
   }

   function showMatureContent() {
      document.getElementById("updatedMatureContentPref").style.display = "none";

      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).update({
               showNsfw: "Show"
            })
               .then(() => {
                  document.getElementById("updatedMatureContentPref").textContent = "Updated preference to Show successfully!";
                  document.getElementById("updatedMatureContentPref").style.display = "block";
               })
         }
      })
   }

   // set sensitive content preference
   function hideSensitiveContent() {
      document.getElementById("updatedSensitiveContentPref").style.display = "none";

      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).update({
               showSensitive: "Hide"
            })
               .then(() => {
                  document.getElementById("updatedSensitiveContentPref").textContent = "Updated preference to Hide successfully!";
                  document.getElementById("updatedSensitiveContentPref").style.display = "block";
               })
         }
      })
   }

   function blurSensitiveContent() {
      document.getElementById("updatedSensitiveContentPref").style.display = "none";

      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).update({
               showSensitive: "Blur"
            })
               .then(() => {
                  document.getElementById("updatedSensitiveContentPref").textContent = "Updated preference to Blur successfully!";
                  document.getElementById("updatedSensitiveContentPref").style.display = "block";
               })
         }
      })
   }

   function showSensitiveContent() {
      document.getElementById("updatedSensitiveContentPref").style.display = "none";

      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).update({
               showSensitive: "Show"
            })
               .then(() => {
                  document.getElementById("updatedSensitiveContentPref").textContent = "Updated preference to Show successfully!";
                  document.getElementById("updatedSensitiveContentPref").style.display = "block";
               })
         }
      })
   }

   // political content preference
   function hidePoliticalContent() {
      document.getElementById("updatedPoliticalContentPref").style.display = "none";

      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).update({
               showPolitics: "Hide"
            })
               .then(() => {
                  document.getElementById("updatedPoliticalContentPref").textContent = "Updated preference to Hide successfully!";
                  document.getElementById("updatedPoliticalContentPref").style.display = "block";
               })
         }
      })
   }

   function blurPoliticalContent() {
      document.getElementById("updatedPoliticalContentPref").style.display = "none";

      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).update({
               showPolitics: "Blur"
            })
               .then(() => {
                  document.getElementById("updatedPoliticalContentPref").textContent = "Updated preference to Blur successfully!";
                  document.getElementById("updatedPoliticalContentPref").style.display = "block";
               })
         }
      })
   }

   function showPoliticalContent() {
      document.getElementById("updatedPoliticalContentPref").style.display = "none";

      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).update({
               showPolitics: "Show"
            })
               .then(() => {
                  document.getElementById("updatedPoliticalContentPref").textContent = "Updated preference to Show successfully!";
                  document.getElementById("updatedPoliticalContentPref").style.display = "block";
               })
         }
      })
   }

   // pride flag pref
   function hidePrideFlag() {
      document.getElementById("updatedPrideFlagContentPref").style.display = "none";

      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).update({
               showPrideFlag: "No"
            })
               .then(() => {
                  document.getElementById("updatedPrideFlagContentPref").textContent = "Updated preference to No successfully!";
                  document.getElementById("updatedPrideFlagContentPref").style.display = "block";
               })
         }
      })
   }

   function showPrideFlag() {
      document.getElementById("updatedPrideFlagContentPref").style.display = "none";

      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).update({
               showPrideFlag: "Yes"
            })
               .then(() => {
                  document.getElementById("updatedPrideFlagContentPref").textContent = "Updated preference to Yes successfully!";
                  document.getElementById("updatedPrideFlagContentPref").style.display = "block";
               })
         }
      })
   }

   // font scale
   function normalFontScale() {
      document.getElementById("updatedFontScaleContentPref").style.display = "none";

      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).update({
               fontSizePref: "normal"
            })
               .then(() => {
                  document.documentElement.style.setProperty('--zoom-level', '1');
                  document.getElementById("updatedFontScaleContentPref").style.display = "block";
                  document.getElementById("updatedFontScaleContentPref").textContent = "Updated preference to Normal successfully!";
               })
         }
      })
   }

   function largeFontScale() {
      document.getElementById("updatedFontScaleContentPref").style.display = "none";

      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).update({
               fontSizePref: "large"
            })
               .then(() => {
                  document.documentElement.style.setProperty('--zoom-level', '1.07');
                  document.getElementById("updatedFontScaleContentPref").style.display = "block";
                  document.getElementById("updatedFontScaleContentPref").textContent = "Updated preference to Large successfully!";
               })
         }
      })
   }

   // autoplay videos
   function doAutoplay() {
      document.getElementById("updatedAutoplayContentPref").style.display = "none";

      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).update({
               autoplayVideos: true
            })
               .then(() => {
                  document.getElementById("updatedAutoplayContentPref").style.display = "block";
                  document.getElementById("updatedAutoplayContentPref").textContent = "Updated preference to 'Autoplay On' successfully!";
               })
         }
      })
   }

   function doNotAutoplay() {
      document.getElementById("updatedAutoplayContentPref").style.display = "none";

      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).update({
               autoplayVideos: false
            })
               .then(() => {
                  document.getElementById("updatedAutoplayContentPref").style.display = "block";
                  document.getElementById("updatedAutoplayContentPref").textContent = "Updated preference to 'Autoplay Off' successfully!";
               })
         }
      })
   }

   // enable experiments
   function showExperiments() {
      document.getElementById("experimentSelect").showModal();
   }

   // change pfp
   function changePfp() {
      if (!document.getElementById("changePfp").classList.contains("disabled")) {
         document.getElementById("fileInput").click();
      }
   }

   document.getElementById("fileInput").addEventListener("change", function (event) {
      firebase.auth().onAuthStateChanged((user) => {
         const file = event.target.files[0];

         if (file) {
            const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
            if (file.size <= 5 * 1024 * 1024) {
               if (allowedTypes.includes(file.type)) {
                  const storageRef = firebase.storage().ref();
                  const fileRef = storageRef.child(`images/pfp/${user.uid}/${file.name}`);

                  fileRef.put(file).then(function (snapshot) {
                     snapshot.ref.getDownloadURL().then(function (downloadURL) {
                        firebase.database().ref(`users/${user.uid}/pfp`).once("value", (snapshot) => {
                           firebase.database().ref(`users/${user.uid}/pfp`).once("value", (snapshot) => {
                              const oldPfpName = snapshot.val();

                              firebase.database().ref(`users/${user.uid}`).update({
                                 pfp: file.name
                              })
                                 .then(() => {
                                    if (oldPfpName) {
                                       const oldFileRef = storageRef.child(`images/pfp/${user.uid}/${oldPfpName}`);
                                       oldFileRef.delete().then(() => {
                                          // :D
                                       }).catch((error) => {
                                          document.getElementById("errorUploadingPfp").style.display = "block";
                                          document.getElementById("errorUploadingPfp").textContent = `Failed to upload profile picture: ${error.message}`;
                                       })
                                    }
                                 })
                           })
                        })
                     });
                  }).catch(function (error) {
                     document.getElementById("errorUploadingPfp").style.display = "block";
                     document.getElementById("errorUploadingPfp").textContent = `Failed to upload profile picture: ${error.message}`;
                  })
               } else {
                  document.getElementById("errorUploadingPfp").style.display = "block";
                  document.getElementById("errorUploadingPfp").textContent = `Invalid image type. Please select a .png, .jpg (.jpeg), or .webp file.`;
               }
            } else {
               document.getElementById("errorUploadingPfp").style.display = "block";
               document.getElementById("errorUploadingPfp").textContent = `Image exceeds 5MB. Please choose a smaller image.`;
            }
         }
      })
   })

   // enable/disable experiments
   function toggleDMExperimentDetails() {
      if (document.getElementById("dm_details").style.display === "none") {
         document.getElementById("dm_details").style.display = "block";
      } else {
         document.getElementById("dm_details").style.display = "none";
      }
   }

   function enableDms() {
      document.getElementById("enableDms").innerHTML = `<i class="fa-solid fa-spinner fa-spin-pulse"></i> Enabling...`;
      document.getElementById("enableDms").classList.add("disabled");
      document.getElementById("disableDms").classList.add("disabled");

      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).update({
               directMessagesExperiment: true
            }).then(() => {
               window.location.reload();
            });
         }
      })
   }

   function disableDms() {
      document.getElementById("disableDms").innerHTML = `<i class="fa-solid fa-spinner fa-spin-pulse"></i> Disabling...`;
      document.getElementById("enableDms").classList.add("disabled");
      document.getElementById("disableDms").classList.add("disabled");

      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            firebase.database().ref(`users/${user.uid}`).update({
               directMessagesExperiment: null
            }).then(() => {
               window.location.reload();
            });
         }
      })
   }
}

// Accept cookies
function acceptCookies() {
   if (pathName === "/" || pathName === "/index" || pathName === "/index.html") {
      document.cookie = "cookieAcceptance=true";
      document.getElementById("cookie-notice").style.display = "none";
   }
}

// Notifications
if (pathName === "/notifications" || pathName === "/notifications.html") {
   firebase.auth().onAuthStateChanged((user) => {
      if (user) {
         // Clear notifications
         firebase.database().ref(`users/${user.uid}/notifications`).update({
            unread: 0
         })

         // Show notifications
         const notificationsRef = firebase.database().ref(`users/${user.uid}/notifications`);

         notificationsRef.once('value', (snapshot) => {
            const notifications = snapshot.val();

            // Clear any existing notifications
            const notificationsDiv = document.getElementById("notificationCenter");
            notificationsDiv.innerHTML = "";

            if (notifications) {
               Object.keys(notifications).forEach((notificationId) => {
                  const notification = notifications[notificationId];

                  const newNotificationDiv = document.createElement("div");
                  newNotificationDiv.classList.add("notification");

                  // Customize notification content based on 'type'
                  if (notification.type === "Follow") {
                     firebase.database().ref(`users/${notification.who}`).on("value", (snapshot) => {
                        const user = snapshot.val();

                        newNotificationDiv.innerHTML = `<img class="notificationPfp" draggable=false src="https://firebasestorage.googleapis.com/v0/b/chat-transsocial-test.appspot.com/o/images%2Fpfp%2F${notification.who}%2F${user.pfp}?alt=media" /> @${user.username} followed you!`;
                        newNotificationDiv.setAttribute("onclick", `window.location.href="/u?id=${user.username}"`);
                     })
                  } else if (notification.type === "Reply") {
                     newNotificationDiv.setAttribute("onclick", `window.location.href="/note?id=${notification.postId}"`);

                     firebase.database().ref(`users/${notification.who}`).on("value", (snapshot) => {
                        const user = snapshot.val();

                        newNotificationDiv.innerHTML = `<img class="notificationPfp" draggable=false src="https://firebasestorage.googleapis.com/v0/b/chat-transsocial-test.appspot.com/o/images%2Fpfp%2F${notification.who}%2F${user.pfp}?alt=media" /> @${user.username} replied to your note!`;
                     })
                  } else if (notification.type === "Love") {
                     newNotificationDiv.setAttribute("onclick", `window.location.href="/note?id=${notification.postId}"`);

                     firebase.database().ref(`users/${notification.who}`).on("value", (snapshot) => {
                        const user = snapshot.val();

                        newNotificationDiv.innerHTML = `<img class="notificationPfp" draggable=false src="https://firebasestorage.googleapis.com/v0/b/chat-transsocial-test.appspot.com/o/images%2Fpfp%2F${notification.who}%2F${user.pfp}?alt=media" /> @${user.username} loved your note!`;
                     })
                  } else if (notification.type === "Renote") {
                     newNotificationDiv.setAttribute("onclick", `window.location.href="/note?id=${notification.postId}"`);

                     firebase.database().ref(`users/${notification.who}`).on("value", (snapshot) => {
                        const user = snapshot.val();

                        newNotificationDiv.innerHTML = `<img class="notificationPfp" draggable=false src="https://firebasestorage.googleapis.com/v0/b/chat-transsocial-test.appspot.com/o/images%2Fpfp%2F${notification.who}%2F${user.pfp}?alt=media" /> @${user.username} renoted your note!`;
                     })
                  } else {
                     // Handle other notification types...
                     newNotificationDiv.style.display = "none";
                  }

                  notificationsDiv.appendChild(newNotificationDiv);
               });
            } else {
               // Handle the case where there are no notifications
               const noNotificationsMessage = document.createElement("h1");
               noNotificationsMessage.innerHTML = `<i class="fa-solid fa-face-frown"></i> You have no notifications.`;
               notificationsDiv.appendChild(noNotificationsMessage);
            }
         });
      }
   });
}

// Creating custom theme
if (pathName === "/create_theme" || pathName === "/create_theme.html") {
   const rootStyles = getComputedStyle(document.documentElement);
   const backgroundValue = rootStyles.getPropertyValue('--background');

   // Background
   document.getElementById("backgroundNewVal").value = backgroundValue;
   function updateBackground() {
      document.body.style.background = document.getElementById("backgroundNewVal").value;
   }
}

// Report user
function reportUser() {
   document.getElementById("reportUser").showModal();
   if (pathName === "/u" || pathName === "/u.html") {
      document.getElementById("userActions-dialog").close();
   }
}

function reportType_harassmentBullying() {
   const newReportRef = firebase.database().ref("reports").push();
   const reportId = newReportRef.key;
   const url = new URL(window.location.href);
   const userParam = url.searchParams.get("id");

   const reportData = {
      reportedUsername: userParam,
      reason: "Harassment/Bullying",
      timestamp: Date.now()
   }

   const updates = {};
   updates["/reports/" + reportId] = reportData;

   document.getElementById("reportUser").close();

   document.getElementById("reportReason").textContent = reportData.reason;
   document.getElementById("reportUsername").textContent = `@${reportData.reportedUsername}`;

   document.getElementById("reportReceived").showModal();
   return firebase.database().ref().update(updates);
}

function reportType_hateSpeech() {
   const newReportRef = firebase.database().ref("reports").push();
   const reportId = newReportRef.key;
   const url = new URL(window.location.href);
   const userParam = url.searchParams.get("id");

   const reportData = {
      reportedUsername: userParam,
      reason: "Hate Speech",
      timestamp: Date.now()
   }

   const updates = {};
   updates["/reports/" + reportId] = reportData;

   document.getElementById("reportUser").close();

   document.getElementById("reportReason").textContent = reportData.reason;
   document.getElementById("reportUsername").textContent = `@${reportData.reportedUsername}`;

   document.getElementById("reportReceived").showModal();
   return firebase.database().ref().update(updates);
}

function reportType_spam() {
   const newReportRef = firebase.database().ref("reports").push();
   const reportId = newReportRef.key;
   const url = new URL(window.location.href);
   const userParam = url.searchParams.get("id");

   const reportData = {
      reportedUsername: userParam,
      reason: "Spam",
      timestamp: Date.now()
   }

   const updates = {};
   updates["/reports/" + reportId] = reportData;

   document.getElementById("reportUser").close();

   document.getElementById("reportReason").textContent = reportData.reason;
   document.getElementById("reportUsername").textContent = `@${reportData.reportedUsername}`;

   document.getElementById("reportReceived").showModal();
   return firebase.database().ref().update(updates);
}

function reportType_harmfulImpersonation() {
   const newReportRef = firebase.database().ref("reports").push();
   const reportId = newReportRef.key;
   const url = new URL(window.location.href);
   const userParam = url.searchParams.get("id");

   const reportData = {
      reportedUsername: userParam,
      reason: "Harmful Impersonation",
      timestamp: Date.now()
   }

   const updates = {};
   updates["/reports/" + reportId] = reportData;

   document.getElementById("reportUser").close();

   document.getElementById("reportReason").textContent = reportData.reason;
   document.getElementById("reportUsername").textContent = `@${reportData.reportedUsername}`;

   document.getElementById("reportReceived").showModal();
   return firebase.database().ref().update(updates);
}

function reportType_harassmentBullying() {
   const newReportRef = firebase.database().ref("reports").push();
   const reportId = newReportRef.key;
   const url = new URL(window.location.href);
   const userParam = url.searchParams.get("id");

   const reportData = {
      reportedUsername: userParam,
      reason: "Harassment/Bullying",
      timestamp: Date.now()
   }

   const updates = {};
   updates["/reports/" + reportId] = reportData;

   document.getElementById("reportUser").close();

   document.getElementById("reportReason").textContent = reportData.reason;
   document.getElementById("reportUsername").textContent = `@${reportData.reportedUsername}`;

   document.getElementById("reportReceived").showModal();
   return firebase.database().ref().update(updates);
}

function reportType_childPornOrEndangerment() {
   const newReportRef = firebase.database().ref("reports").push();
   const reportId = newReportRef.key;
   const url = new URL(window.location.href);
   const userParam = url.searchParams.get("id");

   const reportData = {
      reportedUsername: userParam,
      reason: "Child Pornography/Endangerment",
      timestamp: Date.now()
   }

   const updates = {};
   updates["/reports/" + reportId] = reportData;

   document.getElementById("reportUser").close();

   document.getElementById("reportReason").textContent = reportData.reason;
   document.getElementById("reportUsername").textContent = `@${reportData.reportedUsername}`;
   document.getElementById("changeBasedOnReportReason").textContent = "Thank you for being brave and reporting this. We understand how difficult it is to see content involving child pornography/endangerment, and we sincerely appreciate you bringing it to our attention. We'll investigate this urgently and take appropriate action. We'll keep you updated on our progress.";

   document.getElementById("reportReceived").showModal();
   return firebase.database().ref().update(updates);
}

function reportType_privacyViolations() {
   const newReportRef = firebase.database().ref("reports").push();
   const reportId = newReportRef.key;
   const url = new URL(window.location.href);
   const userParam = url.searchParams.get("id");

   const reportData = {
      reportedUsername: userParam,
      reason: "Privacy Violations",
      timestamp: Date.now()
   }

   const updates = {};
   updates["/reports/" + reportId] = reportData;

   document.getElementById("reportUser").close();

   document.getElementById("reportReason").textContent = reportData.reason;
   document.getElementById("reportUsername").textContent = `@${reportData.reportedUsername}`;

   document.getElementById("reportReceived").showModal();
   return firebase.database().ref().update(updates);
}

function reportType_scams() {
   const newReportRef = firebase.database().ref("reports").push();
   const reportId = newReportRef.key;
   const url = new URL(window.location.href);
   const userParam = url.searchParams.get("id");

   const reportData = {
      reportedUsername: userParam,
      reason: "Scam",
      timestamp: Date.now()
   }

   const updates = {};
   updates["/reports/" + reportId] = reportData;

   document.getElementById("reportUser").close();

   document.getElementById("reportReason").textContent = reportData.reason;
   document.getElementById("reportUsername").textContent = `@${reportData.reportedUsername}`;

   document.getElementById("reportReceived").showModal();
   return firebase.database().ref().update(updates);
}

function reportType_copyrightInfringement() {
   const newReportRef = firebase.database().ref("reports").push();
   const reportId = newReportRef.key;
   const url = new URL(window.location.href);
   const userParam = url.searchParams.get("id");

   const reportData = {
      reportedUsername: userParam,
      reason: "Copyright Infringement",
      timestamp: Date.now()
   }

   const updates = {};
   updates["/reports/" + reportId] = reportData;

   document.getElementById("reportUser").close();

   document.getElementById("reportReason").textContent = reportData.reason;
   document.getElementById("reportUsername").textContent = `@${reportData.reportedUsername}`;

   document.getElementById("reportReceived").showModal();
   return firebase.database().ref().update(updates);
}

function reportType_other() {
   document.getElementById("reportUser").close();
   document.getElementById("reportReason_other").showModal();
}

function reportType_other_finish() {
   const newReportRef = firebase.database().ref("reports").push();
   const reportId = newReportRef.key;
   const url = new URL(window.location.href);
   const userParam = url.searchParams.get("id");

   const reportData = {
      reportedUsername: userParam,
      reason: document.getElementById("reportReason_txt").value,
      timestamp: Date.now()
   }

   const updates = {};
   updates["/reports/" + reportId] = reportData;

   document.getElementById("reportUser").close();
   document.getElementById("reportReason_other").close();

   document.getElementById("reportReason").textContent = reportData.reason;
   document.getElementById("reportUsername").textContent = `@${reportData.reportedUsername}`;

   document.getElementById("reportReceived").showModal();
   return firebase.database().ref().update(updates);
}

// Edit/Deleting Notes
if (pathName === "/" || pathName === "/index" || pathName === "/note" || pathName === "/note.html" || pathName === "/u" || pathName === "/u.html") {
   let editingNote = null;

   // Getting the note and making sure it actually belongs to the user
   document.addEventListener('click', function (event) {
      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            const uid = user.uid;

            if (event.target.classList.contains("more") || event.target.classList.contains("fa-solid" && "fa-pen-to-square")) {
               const moreButton = event.target;
               const noteId = findNoteId(moreButton);

               firebase.database().ref(`notes/${noteId}`).once("value", (snapshot) => {
                  const ensureItsUser = snapshot.val();

                  if (ensureItsUser.whoSentIt === user.uid) {
                     editingNote = noteId;
                     document.getElementById("editWhatPartofNote").showModal();
                  }
               })
            }
         }
      })
   });

   function findNoteId(moreButton) {
      // Every note has an ID associated with it. This will fetch the note's ID and return it to allow the user to love the note.
      return moreButton.closest(".note").id;
   };

   // Delete Note
   function deleteNote() {
      document.getElementById("checkIfNoteDeletion").showModal();
      document.getElementById("editWhatPartofNote").close();
   }

   function deleteNote_fully() {
      firebase.database().ref(`notes/${editingNote}`).update({
         isDeleted: true
      })

      document.getElementById("noteDeleted").showModal();
      document.getElementById("checkIfNoteDeletion").close();
   }

   function deleteNote_nevermind() {
      document.getElementById("editWhatPartofNote").showModal();
      document.getElementById("checkIfNoteDeletion").close();
   }

   // Edit Note
   function editNoteContent() {
      document.getElementById("editNoteContent").showModal();
      document.getElementById("editWhatPartofNote").close();
   }

   function applyEdits() {
      document.getElementById("coverUpdatingNote").style.display = "block";

      let oldText = null;

      firebase.database().ref(`notes/${editingNote}`).once("value", (snapshot) => {
         console.log("Accessed");
         const currentText = snapshot.val();

         oldText = currentText.text;
      })

      const updateKey = firebase.database().ref(`notes/${editingNote}/updates`).push().key;
      const updates = {};

      firebase.database().ref(`notes/${editingNote}`).update({
         text: document.getElementById("newTextContent").value,
      })

      firebase.database().ref(`notes/${editingNote}/updates/${updateKey}`).update({
         previousText: oldText,
      })

      document.getElementById("noteUpdated").showModal();
      document.getElementById("editNoteContent").close();

      // firebase.database().ref(`notes/${editingNote}`).update({
      //     text: document.getElementById("newTextContent").value
      // })

      // document.getElementById("noteUpdated").showModal();
      // document.getElementById("editNoteContent").close();
   }

   function dontApplyEdits() {
      document.getElementById("editNoteContent").close();
      document.getElementById("editWhatPartofNote").showModal();
   }
}

// Account Area
document.body.addEventListener('click', function (event) {
   if (document.getElementById("profile").contains(event.target) || document.querySelector(".profileContainer").contains(event.target)) {
      document.getElementById("profile").style.display = "block";
   } else {
      document.getElementById("profile").style.display = "none";
   }
});

// Direct Messages
if (pathName === "/messages") {
   firebase.auth().onAuthStateChanged((user) => {
      if (user) {
         firebase.database().ref(`users/${user.uid}/openDMs`).on("value", (snapshot) => {
            const openDMs = snapshot.val() || {}; // Handle the case where openDMs doesn't exist

            const dmContainer = document.getElementById("openChats");
            dmContainer.innerHTML = "";

            if (Object.keys(openDMs).length > 0) {
               if (document.getElementById("noDMsOpen")) {
                  document.getElementById("noDMsOpen").remove();
               }

               // Create divs for each DM
               for (const dmId in openDMs) {
                  const dmDiv = document.createElement("div");
                  dmDiv.id = dmId;
                  dmDiv.classList.add("person");
                  firebase.database().ref(`dms/${dmId}`).on("value", (snapshot) => {
                     const dmData = snapshot.val();

                     if (user.uid === dmData.user1) {
                        const otherPersonPfp = document.createElement("img");
                        const otherPersonDisplay = document.createElement("span");
                        const lastMessageSent = document.createElement("span");

                        firebase.database().ref(`users/${dmData.user2}`).once("value", (snapshot) => {
                           const otherPerson = snapshot.val();

                           // Get pfp
                           otherPersonPfp.src = `https://firebasestorage.googleapis.com/v0/b/chat-transsocial-test.appspot.com/o/images%2Fpfp%2F${dmData.user2}%2F${otherPerson.pfp}?alt=media`;
                           otherPersonPfp.setAttribute("draggable", "false");
                           otherPersonPfp.classList.add("pfp");
                           dmDiv.appendChild(otherPersonPfp);
                           dmContainer.appendChild(dmDiv);

                           // Get display
                           otherPersonDisplay.textContent = otherPerson.display;
                           otherPersonDisplay.classList.add("display");
                           dmDiv.appendChild(otherPersonDisplay);
                           dmContainer.appendChild(dmDiv);

                           // Get last message, if available
                           if (dmData.messages) {

                           } else {
                              lastMessageSent.textContent = `You and ${otherPerson.username} haven't chatted yet!`;
                              lastMessageSent.classList.add("lastMessageSent");
                              dmDiv.appendChild(lastMessageSent);
                              dmContainer.appendChild(dmDiv);
                           }
                        })
                     } else {
                        const otherPersonPfp = document.createElement("img");
                        const otherPersonDisplay = document.createElement("span");
                        const lastMessageSent = document.createElement("p");

                        firebase.database().ref(`users/${dmData.user1}`).once("value", (snapshot) => {
                           const otherPerson = snapshot.val();

                           // Get pfp
                           otherPersonPfp.src = `https://firebasestorage.googleapis.com/v0/b/chat-transsocial-test.appspot.com/o/images%2Fpfp%2F${dmData.user1}%2F${otherPerson.pfp}?alt=media`;
                           otherPersonPfp.setAttribute("draggable", "false");
                           otherPersonPfp.classList.add("pfp");
                           dmDiv.appendChild(otherPersonPfp);
                           dmContainer.appendChild(dmDiv);

                           // Get display
                           otherPersonDisplay.textContent = otherPerson.display;
                           otherPersonDisplay.classList.add("display");
                           dmDiv.appendChild(otherPersonDisplay);
                           dmContainer.appendChild(dmDiv);

                           // Get last message, if available
                           if (dmData.messages) {

                           } else {
                              lastMessageSent.textContent = `You and ${otherPerson.username} haven't chatted yet!`;
                              lastMessageSent.classList.add("lastMessageSent");
                              dmDiv.appendChild(lastMessageSent);
                              dmContainer.appendChild(dmDiv);
                           }
                        })
                     }
                  })
               }
            } else {
               document.getElementById("noDMsOpen").style.display = "block";
            }
         })
      }
   })

   // Create new DMs
   function startNewChat() {
      document.getElementById("peopleToDm").showModal();

      firebase.database().ref(`users`).once("value", (snapshot) => {
         const allUsers = snapshot.val();

         for (const userId in allUsers) {
            const directMessagesExperiment = allUsers[userId].directMessagesExperiment; // Assuming 'display' exists
            if (directMessagesExperiment) {
               if (!document.getElementById(userId)) {
                  firebase.database().ref(`users/${userId}`).once("value", (snapshot) => {
                     const data = snapshot.val();

                     // Create div to house everything in
                     const profileHolder = document.createElement("div");
                     profileHolder.setAttribute("id", userId);
                     profileHolder.setAttribute("onclick", "createDM(this)");
                     profileHolder.classList.add("selectUserToDm");

                     // Get user pfp
                     const userId_pfp = document.createElement("img");
                     userId_pfp.src = `https://firebasestorage.googleapis.com/v0/b/chat-transsocial-test.appspot.com/o/images%2Fpfp%2F${userId}%2F${data.pfp}?alt=media`;
                     userId_pfp.classList.add("selectUser-pfp");
                     userId_pfp.setAttribute("draggable", "false");
                     profileHolder.appendChild(userId_pfp);

                     // Get display name
                     const userId_display = document.createElement("span");
                     userId_display.textContent = data.display;
                     userId_display.classList.add("display");
                     profileHolder.appendChild(userId_display);

                     // Get username and pronouns (if applicable)
                     const userId_username = document.createElement("span");
                     if (data.pronouns !== "" && data.pronouns !== undefined) {
                        userId_username.textContent = `@${data.username} • ${data.pronouns}`;
                     } else {
                        userId_username.textContent = `@${data.username}`;
                     }
                     userId_username.classList.add("username");
                     profileHolder.appendChild(userId_username);

                     // Finally, show the profile
                     document.getElementById("peopleToDm-users").appendChild(profileHolder);
                  })
               }
            }
         }
      })
   }

   // Create DM
   function createDM(element) {
      firebase.auth().onAuthStateChanged((user) => {
         if (user) {
            const newDM = firebase.database().ref('dms').push();
            const generatedKey = newDM.key;

            firebase.database().ref(`users/${user.uid}/hasDMsWith/${element.id}`).once("value", (snapshot) => {
               const exists = snapshot.exists();

               if (exists === false) {
                  // Set DMs for logged in user
                  firebase.database().ref(`users/${user.uid}/openDMs/${generatedKey}`).update({
                     isOpen: true,
                  })
                  firebase.database().ref(`users/${user.uid}/hasDMsWith/${element.id}`).update({
                     true: true,
                  })

                  // Set DMs for other user
                  firebase.database().ref(`users/${element.id}/openDMs/${generatedKey}`).update({
                     isOpen: true,
                  })
                  firebase.database().ref(`users/${element.id}/hasDMsWith/${user.uid}`).update({
                     true: true,
                  })

                  // Create DM
                  firebase.database().ref(`dms/${generatedKey}`).update({
                     user1: user.uid,
                     user2: element.id,
                  })

                  document.getElementById("peopleToDm").close();
               }
            })
         }
      })
   }
}

// Greet user
if (document.getElementById("greetingTime")) {
   const now = new Date();
   let hours = now.getHours();

   firebase.auth().onAuthStateChanged((user) => {
      if (user) {
         firebase.database().ref(`users/${user.uid}`).once("value", (snapshot) => {
            const greetWho = snapshot.val();

            if (hours < 12) {
               document.getElementById("greetingTime").textContent = `Good morning, ${greetWho.username}!`;
            } else if (hours < 17) {
               document.getElementById("greetingTime").textContent = `Good afternoon, ${greetWho.username}!`;
            } else {
               document.getElementById("greetingTime").textContent = `Good evening, ${greetWho.username}!`;
            }
         })
      } else {
         if (hours < 12) {
            document.getElementById("greetingTime").textContent = "Good morning!";
         } else if (hours < 17) {
            document.getElementById("greetingTime").textContent = "Good afternoon!";
         } else {
            document.getElementById("greetingTime").textContent = "Good evening!";
         }
      }
   })
}

// Email Verification
firebase.auth().onAuthStateChanged((user) => {
   if (user) {
      const isEmailVerified = user.emailVerified;

      if (isEmailVerified === false) {
         document.getElementById("verifyEmail").showModal();
      }
   }
})

function getVerificationEmail() {
   firebase.auth().currentUser.sendEmailVerification()
      .then(() => {
         document.getElementById("verifyEmail").close();
         document.getElementById("emailSent_emailVer").showModal();
      })
}

// Show Notification when user receives one
// This function is broken and should not be uncommented under any circumstance by a user.

// let notificationTitle = "";
// let notificationBody = "";

// firebase.auth().onAuthStateChanged((user) => {
//     if (user) {
//         firebase.database().ref(`users/${user.uid}/notifications`).once("child_added", (snapshot) => {
//             notificationTitle = 'New Notification';
//             notificationBody = 'You have a new notification.';

//             if (Notification.permission === 'granted') {
//                 console.log("Granted");
//                 showNotification();
//             }
//         })
//     }
// })

// function showNotification() {
//     const notification = new Notification(notificationTitle, {
//         body: notificationBody
//     });
// }

// Detect if user is on the desktop or not, and update the variable
if (window.location.origin === "http://127.0.0.1:1430") {
   isOnDesktopApp = true;

   // Remove the "We're beta testing out Windows app" notice from the index page
   if (document.getElementById("betaTestingApp")) {
      document.getElementById("betaTestingApp").remove();
   }

   // Remove the "Looks like you aren't on the desktop app..." noticce
   if (document.getElementById("notOnDesktopApp")) {
      document.getElementById("notOnDesktopApp").remove();
      document.getElementById("isOnDesktopApp").style.display = "block";
   }
} else {
   isOnDesktopApp = false;

   // Remove the Desktop settings
   if (document.getElementById("isOnDesktopApp")) {
      document.getElementById("isOnDesktopApp").remove();
   }
}

// Detect user OS
if (pathName === "/download") {
   const userAgent = navigator.userAgent || navigator.vendor || window.opera;

   // Windows/Windows Phone
   if (/windows phone/i.test(userAgent)) {
      document.getElementById("downloadButton").style.display = "none";
      document.getElementById("systemRequirement").textContent = "Unavailable for Windows Phone.";
   } else if (/win/i.test(userAgent)) {
      document.getElementById("downloadButton").setAttribute("onclick", "window.location.href='/assets/releases/windows/ts_installer.msi'");
      document.getElementById("downloadButton").textContent = "Get TransSocial for Windows";
      document.getElementById("systemRequirement").textContent = "Requires Windows 8 or later.";
      // macOS    
   } else if (/macintosh|mac os x/i.test(userAgent)) {
      document.getElementById("downloadButton").style.display = "none";
      document.getElementById("systemRequirement").textContent = "Unavailable for macOS at this time.";
      // iPad/iPhone/iPod
   } else if (/ipad|iphone|ipod/i.test(userAgent) && !window.MSStream) {
      document.getElementById("downloadButton").style.display = "none";
      document.getElementById("systemRequirement").textContent = "Unavailable for iOS at this time.";
      // Android
   } else if (/android/i.test(userAgent)) {
      document.getElementById("downloadButton").setAttribute("onclick", "window.location.href='/assets/releases/android/app-release.apk'");
      document.getElementById("downloadButton").textContent = "Get TransSocial for Windows";
      document.getElementById("systemRequirement").textContent = "Requires Android 6 or later.";
      // Linux
   } else if (/linux/i.test(userAgent)) {
      document.getElementById("downloadButton").style.display = "none";
      document.getElementById("systemRequirement").textContent = "Unavailable for Linux at this time.";
      // who knows?
   } else {
      document.getElementById("downloadButton").style.display = "none";
      document.getElementById("systemRequirement").textContent = "You're using an unknown operating system.";
   }
}

// User pfp in header
firebase.auth().onAuthStateChanged((user) => {
   if (user) {
      firebase.database().ref(`users/${user.uid}`).once("value", (snapshot) => {
         const data = snapshot.val();

         if (document.getElementById("userPfp-header")) {
            document.getElementById("userPfp-header").src = `https://firebasestorage.googleapis.com/v0/b/chat-transsocial-test.appspot.com/o/images%2Fpfp%2F${user.uid}%2F${data.pfp}?alt=media`;
         }
      })
   } else {
      if (document.getElementById("userPfp-header")) {
         document.getElementById("userPfp-header").src = `/assets/imgs/defaultPfp.png`;
      }
   }
})

// account manager (header) 
function accountManager() {
   if (document.getElementById("accountManager").style.display === "none") {
      document.getElementById("accountManager").style.display = "block";
      document.getElementById("greetingManager").textContent = `Hello, ${document.getElementById("displayName-sidebar").textContent}!`;
   }
}

document.body.addEventListener('click', function (event) {
   if (document.getElementById("accountManager").contains(event.target) || document.getElementById("userPfp-header").contains(event.target)) {
      document.getElementById("accountManager").style.display = "block";
   } else {
      document.getElementById("accountManager").style.display = "none";
   }
});

// determine date creation
function timeAgo(timestamp) {
   const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
   const seconds = now - Math.floor(timestamp / 1000); // Convert milliseconds to seconds

   if (seconds < 60) {
      return `${seconds}s`;
   }
   const minutes = Math.floor(seconds / 60);
   if (minutes < 60) {
      return `${minutes}m`;
   }
   const hours = Math.floor(minutes / 60);
   if (hours < 24) {
      return `${hours}h`;
   }
   const days = Math.floor(hours / 24);
   if (days < 30) {
      return `${days}d`;
   }

   // Convert timestamp to a Date object
   const date = new Date(timestamp);
   const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
   const formattedDate = `${months[date.getMonth()]} ${date.getDate()}`;

   return formattedDate;
}

// Check unlocked achievements on achievement page
if (pathName === "/achievements") {
   firebase.auth().onAuthStateChanged((user) => {
      if (user) {
         firebase.database().ref(`users/${user.uid}/achievements/transsocial`).once("value", (snapshot) => {
            const achievement = snapshot.val();

            if (achievement) {
               if (achievement.firstSteps) {
                  document.getElementById("firstStepsAchievement").classList.remove("locked");
                  document.getElementById("unlockDescription_fs").textContent = "You've taken the plunge! Welcome to TransSocial! (Create a note)";
                  document.getElementById("unlockDate_fs").textContent = `Unlocked ${achievement.firstSteps.unlockedWhen}`;
               }

               if (achievement.expressYourself) {
                  document.getElementById("expressYourselfAchievement").classList.remove("locked");
                  document.getElementById("unlockDescription_ey").textContent = "Unleash your inner rockstar! (Renote a note)";
                  document.getElementById("unlockDate_ey").textContent = `Unlocked ${achievement.expressYourself.unlockedWhen}`;
               }

               if (achievement.theSocialButterfly) {
                  document.getElementById("theSocialButterflyAchievement").classList.remove("locked");
                  document.getElementById("unlockDescription_tsb").textContent = "Spread your wings and fly! (Follow another user on TransSocial)";
                  document.getElementById("unlockDate_tsb").textContent = `Unlocked ${achievement.theSocialButterfly.unlockedWhen}`;
               }

               if (achievement.chatterbox) {
                  document.getElementById("chatterboxAchievement").classList.remove("locked");
                  document.getElementById("unlockDescription_cb").textContent = "Conversation starter! (Reply to a note)";
                  document.getElementById("unlockDate_cb").textContent = `Unlocked ${achievement.chatterbox.unlockedWhen}`;
               }
            }
         })
      }
   })
}

// Unlock achievement
function unlockAchievement(achievement) {
   firebase.auth().onAuthStateChanged((user) => {
      if (user) {
         if (achievement === "First Steps") {
            firebase.database().ref(`users/${user.uid}/achievements/transsocial/firstSteps`).once("value", (snapshot) => {
               const hasAchievement = snapshot.exists();

               if (hasAchievement === false) {
                  // Play the sound and show the achievement
                  new Audio("/assets/audio/transsocial_achievement_chime.wav").play();
                  document.getElementById("achievementUnlock").style.display = "block";
                  document.getElementById("achievementName").textContent = achievement;

                  // unlock it
                  const date = new Date();
                  const formattedDate = date.toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" });

                  firebase.database().ref(`users/${user.uid}/achievements/transsocial/firstSteps`).update({
                     unlockedWhen: formattedDate,
                     unlocked: true
                  })
                     .then(() => {
                        setTimeout(function () {
                           document.getElementById("achievementUnlock").style.display = "none";
                        }, 3000);
                     })
               }
            })
         } else if (achievement === "Chatterbox") {
            firebase.database().ref(`users/${user.uid}/achievements/transsocial/chatterbox`).once("value", (snapshot) => {
               const hasAchievement = snapshot.exists();

               if (hasAchievement === false) {
                  // Play the sound and show the achievement
                  new Audio("/assets/audio/transsocial_achievement_chime.wav").play();
                  document.getElementById("achievementUnlock").style.display = "block";
                  document.getElementById("achievementName").textContent = achievement;
                  document.getElementById("achievementIcon").innerHTML = `<i class="fa-solid fa-comments"></i>`;

                  // unlock it
                  const date = new Date();
                  const formattedDate = date.toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" });

                  firebase.database().ref(`users/${user.uid}/achievements/transsocial/chatterbox`).update({
                     unlockedWhen: formattedDate,
                     unlocked: true
                  })
                     .then(() => {
                        setTimeout(function () {
                           document.getElementById("achievementUnlock").style.display = "none";
                        }, 3000);
                     })
               }
            })
         } else if (achievement === "The Social Butterfly") {
            firebase.database().ref(`users/${user.uid}/achievements/transsocial/theSocialButterfly`).once("value", (snapshot) => {
               const hasAchievement = snapshot.exists();

               if (hasAchievement === false) {
                  // Play the sound and show the achievement
                  new Audio("/assets/audio/transsocial_achievement_chime.wav").play();
                  document.getElementById("achievementUnlock").style.display = "block";
                  document.getElementById("achievementName").textContent = achievement;
                  document.getElementById("achievementIcon").innerHTML = `<i class="fa-solid fa-user-plus"></i>`;

                  // unlock it
                  const date = new Date();
                  const formattedDate = date.toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" });

                  firebase.database().ref(`users/${user.uid}/achievements/transsocial/theSocialButterfly`).update({
                     unlockedWhen: formattedDate,
                     unlocked: true
                  })
                     .then(() => {
                        setTimeout(function () {
                           document.getElementById("achievementUnlock").style.display = "none";
                        }, 3000);
                     })
               }
            })
         } else if (achievement === "Express Yourself") {
            firebase.database().ref(`users/${user.uid}/achievements/transsocial/expressYourself`).once("value", (snapshot) => {
               const hasAchievement = snapshot.exists();

               if (hasAchievement === false) {
                  // Play the sound and show the achievement
                  new Audio("/assets/audio/transsocial_achievement_chime.wav").play();
                  document.getElementById("achievementUnlock").style.display = "block";
                  document.getElementById("achievementName").textContent = achievement;
                  document.getElementById("achievementIcon").innerHTML = `<i class="fa-solid fa-bullhorn"></i>`;

                  // unlock it
                  const date = new Date();
                  const formattedDate = date.toLocaleDateString("en-US", { year: "2-digit", month: "2-digit", day: "2-digit" });

                  firebase.database().ref(`users/${user.uid}/achievements/transsocial/expressYourself`).update({
                     unlockedWhen: formattedDate,
                     unlocked: true
                  })
                     .then(() => {
                        setTimeout(function () {
                           document.getElementById("achievementUnlock").style.display = "none";
                        }, 3000);
                     })
               }
            })
         }
      }
   })
}