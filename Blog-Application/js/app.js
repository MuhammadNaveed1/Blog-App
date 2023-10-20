import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
// Authentication
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updatePassword, signOut } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
// Cloud Firestore
import { getFirestore, doc, setDoc, addDoc, collection, onSnapshot, updateDoc, serverTimestamp, query, orderBy, where, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";
// Firestorage
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-storage.js";
const firebaseConfig = {
    apiKey: "AIzaSyDUoAEcULpvx3ZtewF_dWnr2ALb0VPnjQo",
    authDomain: "hackathone-6d30f.firebaseapp.com",
    projectId: "hackathone-6d30f",
    storageBucket: "hackathone-6d30f.appspot.com",
    messagingSenderId: "601106675756",
    appId: "1:601106675756:web:904cf3c2ea88bac7173989"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage();

let signupFlag = true;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W+).{8,}$/;
onAuthStateChanged(auth, (user) => {
    if (user) {
        const uid = user.uid;
        console.log(user);
        if (location.pathname !== "/dashboard.html" && signupFlag && location.pathname !== "/profile.html" && location.pathname !== "/blog.html") {
            window.location.replace("/dashboard.html");
        }
        getUid(uid, user);
        getData();
        getBlog();
    } else {
        if (location.pathname !== "/index.html" && location.pathname !== "/signup.html")
            window.location.replace("/index.html");
        console.log("User is signed out");
    }
});


let signupBtn = document.getElementById("signup-btn");
let formDiv = document.getElementById("form-div");
let loader = document.getElementById("loader");
// Signup
function signup() {
    signupFlag = false;
    event.preventDefault();
    // auth data variables
    let fullname = document.getElementById("fullname");
    let phone = document.getElementById("phone");
    let email = document.getElementById("email");
    let password = document.getElementById("password");
    //
    // auth error variables
    let fullnameError = document.getElementById("fullname-error");
    let phoneError = document.getElementById("phone-error");
    let emailError = document.getElementById("email-error");
    let passwordError = document.getElementById("password-error");
    //
    if (fullname.value === "") {
        phoneError.innerHTML = "";
        emailError.innerText = "";
        passwordError.innerText = "";
        fullnameError.innerText = "Please enter your full name.";
    }
    else if (phone.value === "") {
        fullnameError.innerText = "";
        emailError.innerText = "";
        passwordError.innerText = "";
        phoneError.innerHTML = "Please enter your phone number.";
    }
    else if (email.value === "") {
        fullnameError.innerText = "";
        phoneError.innerText = "";
        passwordError.innerText = "";
        emailError.innerText = "Please enter your email address.";
    }
    else if (passwordRegex.test(password.value) === false) {
        fullnameError.innerText = "";
        phoneError.innerText = "";
        emailError.innerText = "";
        passwordError.innerText = "Password requires 8 characters, including uppercase, lowercase, digit or special char.";
    }
    else {
        fullnameError.innerText = "";
        passwordError.innerHTML = "";
        emailError.innerText = "";
        passwordError.innerText = "";
        formDiv.style.opacity = "0.5";
        loader.style.display = "block";
        createUserWithEmailAndPassword(auth, email.value, password.value)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log(user);
                addUserData(user.uid, fullname.value, phone.value, email.value, password.value)
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorMessage);
                formDiv.style.opacity = "1";
                loader.style.display = "none";
                switch (errorMessage) {
                    case "Firebase: Error (auth/invalid-email).":
                        emailError.innerText = "Please enter a valid email address.";
                        break;
                    case "Firebase: Error (auth/email-already-in-use).":
                        emailError.innerText = "The email address is already in use.";
                        break;
                }
            });
    }
}
signupBtn && signupBtn.addEventListener("click", () => { signup() });

// Login
let loginBtn = document.getElementById("login-btn");
function login() {
    // auth error variables
    let emailError = document.getElementById("email-error");
    let passwordError = document.getElementById("password-error");
    //
    emailError.innerText = "";
    passwordError.innerText = "";
    event.preventDefault();
    // auth data variables
    let email = document.getElementById("email");
    let password = document.getElementById("password");
    //
    console.log(email.value, password.value);
    formDiv.style.opacity = "0.5";
    loader.style.display = "block";
    signInWithEmailAndPassword(auth, email.value, password.value)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log(user);
            formDiv.style.opacity = "1";
            loader.style.display = "none";
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorMessage);
            formDiv.style.opacity = "1";
            loader.style.display = "none";
            if (email.value === "") {
                passwordError.innerText = "";
                emailError.innerText = "Please enter your email address.";
            } else {
                switch (errorMessage) {
                    case "Firebase: Error (auth/invalid-email).":
                        passwordError.innerText = "";
                        emailError.innerText = "Please enter a valid email address.";
                        break;
                    case "Firebase: Error (auth/missing-password).":
                        emailError.innerText = "";
                        passwordError.innerText = "Please enter your password.";
                        break;
                    case "Firebase: Error (auth/wrong-password).":
                        emailError.innerText = "";
                        passwordError.innerText = "Invalid password. Please try again.";
                        break;
                    case "Firebase: Error (auth/user-not-found).":
                        emailError.innerText = "";
                        passwordError.innerText = "User not found.";
                        break;
                }
            }
        });
}
loginBtn && loginBtn.addEventListener("click", () => { login() });

async function addUserData(uid, fullname, phone, email, password) {
    let userDefaultImage = "https://firebasestorage.googleapis.com/v0/b/hackathone-6d30f.appspot.com/o/images%2Fuser.webp?alt=media&token=88a3f0e4-cd7b-4725-a512-32f46087e10b";
    await setDoc(doc(db, "Users", uid), {
        fullname: fullname,
        phone: phone,
        email: email,
        password: password,
        userimage: userDefaultImage
    });
    signupFlag = true;
    console.log(signupFlag)
    formDiv.style.opacity = "1";
    loader.style.display = "none";
    signupFlag = true;
    window.location.replace("/dashboard.html");
}

let uid;
let user;
function getUid(id, User) {
    uid = id;
    user = User;
}
async function addBlog() {
    let blogDiv = document.getElementById("blog-div")
    let blogTitle = document.getElementById("blog-title");
    let blogText = document.getElementById("blog-text");
    let blogError = document.getElementById("blog-error");
    onSnapshot(doc(db, "Users", uid), async (doc) => {
        if (blogTitle.value === "" || blogText.value === "") {
            blogError.innerText = "Title or blog missing. Please provide both.";
        }
        else if (blogTitle.value.length < 5 || blogTitle.value.length > 50) {
            blogError.innerText = "Title length must be between 5 and 50 characters.";
        }
        else if (blogText.value.length < 300 || blogText.value.length > 3000) {
            blogError.innerText = "Blog length must be between 300 and 3000 characters.";
        }
        else {
            blogError.innerText = "";
            blogDiv.style.opacity = "0.2";
            try {
                const docRef = await addDoc(collection(db, "Blogs"), {
                    blogtitle: blogTitle.value,
                    blogText: blogText.value,
                    uid: uid,
                    timestamp: serverTimestamp(),
                    user: doc.data()
                });
                console.log("Document written with ID: ", docRef.id);
                blogTitle.value = "";
                blogText.value = "";
                blogDiv.style.opacity = "1";
                getBlog();
            } catch (e) {
                console.error("Error adding document: ", e);
                dashboardPage.style.opacity = "1";
            }
        }
    })
}
let postBlog = document.getElementById("post-blog");
postBlog && postBlog.addEventListener("click", addBlog);

async function getBlog() {
    let myBlogContainer = document.getElementById("myblog-container");
    let allBlogContainer = document.getElementById("all-blog-container");
    if (location.pathname === "/dashboard.html") {
        loader.style.display = "block";
        myBlogContainer.innerHTML = "";
        const q = query(collection(db, "Blogs"), where("uid", "==", uid), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        if(querySnapshot.empty) {
            loader.style.display = "none";
        }
        else {
            querySnapshot.forEach((doc) => {
                loader.style.display = "none";
                console.log(doc.id, " => ", doc.data());
                myBlogContainer.innerHTML += `
        <div class="postedblog-container" id="postedblog-container">
                    <div class="postedblog-div">
                        <div class="profile-div">
                            <div class="profilepic-div">
                                <img src="${doc.data().user.userimage}" alt="">
                            </div>
                            <div class="topic-div">
                                <h3>${doc.data().blogtitle}</h3>
                                <p>${doc.data().user.fullname} <span> - ${doc.data().timestamp.toDate().toDateString()}</span></p>
                            </div>
                        </div>
                        <div class="postedblog-text">
                            <textarea readonly name="" id="blog-text-area${doc.id}" cols="30" rows="10" class="">${doc.data().blogText}</textarea>
                        </div>
                        <div class="blog-btn-div">
                            <button id="del-btn" onClick="delBlog('${doc.id}')">Delete</button>
                            <button id="edit-btn" onClick="editBlog('${doc.id}')">Edit</button>
                        </div>
                    </div>
                </div>
        `
                let textArea = document.getElementById(`blog-text-area${doc.id}`);
                if (textArea.value.length < 500) {
                    textArea.style.height = "100px";
                }
                else if (textArea.value.length < 1000) {
                    textArea.style.height = "200px";
                }
            });
        }
        
    }
    if (location.pathname === "/blog.html") {
        loader.style.display = "block";
        const q = query(collection(db, "Blogs"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
            loader.style.display = "none";
            allBlogContainer.innerHTML += `
    <div class="postedblog-container" id="postedblog-container">
                <div class="postedblog-div">
                    <div class="profile-div">
                        <div class="profilepic-div">
                            <img src="${doc.data().user.userimage}" alt="">
                        </div>
                        <div class="topic-div">
                            <h3>${doc.data().blogtitle}</h3>
                            <p>${doc.data().user.fullname} <span> - ${doc.data().timestamp.toDate().toDateString()}</span></p>
                        </div>
                    </div>
                    <div class="postedblog-text">
                        <textarea readonly name="" id="blog-text-area${doc.id}" cols="30" rows="10" class="">${doc.data().blogText}</textarea>
                    </div>
                </div>
            </div>
    `
            let textArea = document.getElementById(`blog-text-area${doc.id}`);
            console.log(textArea.value.length)
            if (textArea.value.length < 500) {
                textArea.style.height = "100px";
            }
            else if (textArea.value.length < 1000) {
                textArea.style.height = "200px";
            }
        });
    }
}

function delBlog(id) {
    Swal.fire({
        title: 'Are you sure?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'rgb(71, 44, 2)',
        cancelButtonColor: '#e1c4a1',
        confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            await deleteDoc(doc(db, "Blogs", id));
            getBlog();
            Swal.fire(
                'Deleted!',
                'Your blog has been deleted.',
                'success'
            )
        }
    })
}
window.delBlog = delBlog;

let username = document.getElementById("username");
let usernameImg = document.getElementById("username-img");
let EditUsername = document.getElementById("edit-username");
EditUsername && EditUsername.addEventListener("click", function () {
    if (username.readOnly === true) {
        username.readOnly = false;
        username.focus();
        usernameImg.src = "images/check.png";
    }
    else {
        username.readOnly = true;
        username.blur();
        usernameImg.src = "images/pencil.png";
    }
})

let oldPassword = document.getElementById("old-password");
let oldPasswordImg = document.getElementById("old-password-img");
let EditOldPassword = document.getElementById("edit-old-password");
EditOldPassword && EditOldPassword.addEventListener("click", function () {
    if (oldPassword.readOnly === true) {
        oldPassword.readOnly = false;
        oldPassword.focus();
        oldPasswordImg.src = "images/check.png";
    }
    else {
        oldPassword.readOnly = true;
        oldPassword.blur();
        oldPasswordImg.src = "images/pencil.png";
    }
})


let newPassword = document.getElementById("new-password");
let newPasswordImg = document.getElementById("new-password-img");
let editNewPassword = document.getElementById("edit-new-password");
editNewPassword && editNewPassword.addEventListener("click", function () {
    if (newPassword.readOnly === true) {
        newPassword.readOnly = false;
        newPassword.focus();
        newPasswordImg.src = "images/check.png";
    }
    else {
        newPassword.readOnly = true;
        newPassword.blur();
        newPasswordImg.src = "images/pencil.png";
    }
})


let repeatNewPassword = document.getElementById("repeat-new-password");
let repeatNewPasswordImg = document.getElementById("repeat-new-password-img");
let editRepeatNewPassword = document.getElementById("edit-repeat-new-password");
editRepeatNewPassword && editRepeatNewPassword.addEventListener("click", function () {
    if (repeatNewPassword.readOnly === true) {
        repeatNewPassword.readOnly = false;
        repeatNewPassword.focus();
        repeatNewPasswordImg.src = "images/check.png";
    }
    else {
        repeatNewPassword.readOnly = true;
        repeatNewPassword.blur();
        repeatNewPasswordImg.src = "images/pencil.png";
    }
})
let updateProfileError = document.getElementById("updateprofile-error");
let file = document.getElementById("file");
let userImg = document.getElementById("user-image");
file && file.addEventListener("change", (e) => {
    userImg.src = URL.createObjectURL(e.target.files[0]);
})

let backBtn = document.getElementById("back-btn");
backBtn && backBtn.addEventListener("click", function () {
    event.preventDefault();
    history.back();
})
let userProfileDiv = document.getElementById("user-profile-div");
function getData() {
    let userProfileDiv = document.getElementById("user-profile-div");
    let updateBtn = document.getElementById("update-profile");
    if (location.pathname === "/profile.html") {
        userProfileDiv.style.opacity = "0.5";
        loader.style.display = "block";
    }
    onSnapshot(doc(db, "Users", uid), (doc) => {
        console.log(doc.data());
        if (doc.data().userimage && location.pathname === "/profile.html") {
            userImg.src = doc.data().userimage;
        }
        if (location.pathname === "/profile.html") {
            username.value = doc.data().fullname;
            userProfileDiv.style.opacity = "1";
            loader.style.display = "none";
        }
        if (location.pathname === "/dashboard.html" || location.pathname === "/blog.html") {
            username.innerText = doc.data().fullname;
        }
        updateBtn && updateBtn.addEventListener("click", async () => {
            if (username.value === "") {
                updateProfileError.style.color = "red";
                updateProfileError.innerText = "Please enter username";
            }
            else if (username.value.length < 3) {
                updateProfileError.style.color = "red";
                updateProfileError.innerText = "User name should be between 3 and 20 characters";
            }
            else if (oldPassword.value !== "" && oldPassword.value !== doc.data().password) {
                updateProfileError.style.color = "red";
                updateProfileError.innerText = " Old password is incorrect.";
            }
            else if (oldPassword.value === "" && (newPassword.value !== "" || repeatNewPassword.value !== "")) {
                updateProfileError.style.color = "red";
                updateProfileError.innerText = "Please enter your old password.";
            }
            else if (newPassword.value !== "" && passwordRegex.test(newPassword.value) === false) {
                updateProfileError.style.color = "red";
                updateProfileError.innerText = "Password requires 8 characters, including uppercase, lowercase, digit or special char.";
            }
            else if (newPassword.value !== "" && repeatNewPassword !== "" && newPassword.value !== repeatNewPassword.value) {
                updateProfileError.style.color = "red";
                updateProfileError.innerText = "The new passwords you entered do not match.";
            }
            else {
                updateProfileError.innerText = "";
                userProfileDiv.style.opacity = "0.5";
                loader.style.display = "block";
                if (file.files[0]) {
                    const mountainImagesRef = ref(storage, `images/${file.files[0].name}`);
                    const uploadTask = uploadBytesResumable(mountainImagesRef, file.files[0]);
                    uploadTask.on('state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            console.log('Upload is ' + progress + '% done');
                            switch (snapshot.state) {
                                case 'paused':
                                    console.log('Upload is paused');
                                    break;
                                case 'running':
                                    console.log('Upload is running');
                                    break;
                            }
                        },
                        (error) => {
                            console.log(error);
                        },
                        () => {
                            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                                console.log('File available at', downloadURL);
                                if (newPassword.value === "") {
                                    let userData = {
                                        fullname: username.value,
                                        userimage: downloadURL
                                    }
                                    updateUser(userData);
                                }
                                else {
                                    let userData = {
                                        fullname: username.value,
                                        password: newPassword.value,
                                        userimage: downloadURL
                                    }
                                    updateUser(userData);
                                }
                            });
                        }
                    );
                }
                else {
                    if (newPassword.value === "") {
                        let userData = {
                            fullname: username.value,
                        }
                        updateUser(userData);
                    }
                    else {
                        let userData = {
                            fullname: username.value,
                            password: newPassword.value,
                        }
                        updateUser(userData);
                    }
                }
            }
        })

    })
}
async function updateUser(userData) {
    updateProfileError.innerText = "";
    function updatePass() {
        updatePassword(user, userData.password).then(() => {
            console.log("Updated");
        }).catch((error) => {
            if (error.message === "Firebase: Error (auth/requires-recent-login).") {
                logout()
            }
        });
    }
    await updateDoc(doc(db, "Users", uid), {
        ...userData
    });
    if (userData.password) {
        updatePass()
    }
    oldPassword.value = "";
    newPassword.value = "";
    repeatNewPassword.value = "";
    updateProfileError.style.color = "green";
    updateProfileError.innerText = "Profile updated.";
    userProfileDiv.style.opacity = "1";
    loader.style.display = "none";
}

let logoutBtn = document.getElementById("logout-button");
logoutBtn && logoutBtn.addEventListener("click", logout);
function logout() {
    Swal.fire({
        title: 'Are you sure?',
        showCancelButton: true,
        confirmButtonColor: 'rgb(71, 44, 2)',
        cancelButtonColor: '#e1c4a1',
        confirmButtonText: 'Yes',
        cancelButtonText: `No`
      }).then((result) => {
        if (result.isConfirmed) {
            signOut(auth).then(() => {
                console.log("Sign-out successful.");
            }).catch((error) => {
                console.log("An error happened.");
            });
        }
      })
}