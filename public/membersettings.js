// section switching
const settingsLinks = document.querySelectorAll(".settings-link");
const settingsSections = document.querySelectorAll(".settings-section");

settingsLinks.forEach(link => {
    link.addEventListener("click", () => {
        const sectionName = link.dataset.section;
        settingsLinks.forEach(section => {
            section.classList.remove("active");
        });
        settingsSections.forEach(section => {
            section.classList.remove("active");
        });

        link.classList.add("active");
        document.getElementById(sectionName).classList.add("active");
    })
})

// profile pic upload n cropping feature
const defaultpfp = "https://i.pinimg.com/originals/9e/83/75/9e837528f01cf3f42119c5aeeed1b336.jpg?nii=t";
const pfpBtn = document.getElementById("changepicbtn");
const removepfpBtn = document.getElementById("removepicbtn");
const picInput = document.getElementById("picInput");
const pfp = document.getElementById("profilePic");

const cropMain = document.getElementById("cropmain");
const cropCanvas = document.getElementById("cropCanvas");
const ctx = cropCanvas.getContext("2d");

const closeCropBtn = document.getElementById("closeCropBtn");
const cancelCropBtn = document.getElementById("cancelCropBtn");
const applyCropBtn = document.getElementById("applyCropBtn");

const uploadPlaceholder = document.getElementById("uploadPlaceholder");
const resetZoomBtn = document.getElementById("resetZoomBtn");
const zoomSlider = document.getElementById("zoomSlider");
const zoomValue = document.getElementById("zoomValue");

let selectedImage = null;
let imageURL = null;
let zoom = 1;

// zoom drag control variaables
let imageX = 0;
let imageY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;

uploadPlaceholder.addEventListener("click", () => {
    picInput.click();
})

picInput.addEventListener("change", () => {
    const file = picInput.files[0];
    if(!file) return;

    const allowedtypes = ["image/jpeg", "image/png", "image/webp"];
    if(!allowedtypes.includes(file.type)){
        alert("Please upload the accepted formats listed");
        picInput.value = "";
        return;
    }

    const maxSize = 5242880;
    if(file.size > maxSize){
        alert("Your profile picture must be smaller than 5 MB");
        picInput.value = "";
        return;
    }
    
    imageURL = URL.createObjectURL(file);
    selectedImage = new Image();

    selectedImage.onload = () => {
        zoom = 1;
        zoomSlider.value = 1;
        zoomValue.textContent = "1.00x";

        imageX = 0;
        imageY = 0;

        uploadPlaceholder.style.display = "none";
        cropCanvas.style.display = "block";

        drawImageOnCanvas();
    };

    selectedImage.src = imageURL;
});

function drawImageOnCanvas(){
    if(!selectedImage)return;

    const imageWidth = selectedImage.naturalWidth;
    const imageHeight = selectedImage.naturalHeight;

    const cropSize = Math.min(imageWidth, imageHeight);
    const zoomedCropSize = cropSize / zoom;

    const maxX = (imageWidth - zoomedCropSize) / 2;
    const maxY = (imageHeight - zoomedCropSize) / 2;

    imageX = Math.max(-maxX, Math.min(maxX, imageX));
    imageY = Math.max(-maxY, Math.min(maxY, imageY));

    const centerX = imageWidth / 2;
    const centerY = imageHeight / 2;
    const sourceX = centerX - zoomedCropSize / 2 - imageX;
    const sourceY = centerY - zoomedCropSize / 2 - imageY;

    cropCanvas.width = 512;
    cropCanvas.height = 512;

    ctx.clearRect(0, 0, 512, 512);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(selectedImage, sourceX, sourceY, zoomedCropSize, zoomedCropSize, 0, 0, 512, 512);
}

// dragging function for pfp
cropCanvas.addEventListener("mousedown", (event) => {
    if(!selectedImage)return;

    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;

    cropCanvas.style.cursor = "grabbing";
});

window.addEventListener("mousemove", (event) => {
    if(!isDragging) return;

    const dragX = event.clientX - startX;
    const dragY = event.clientY - startY;

    startX = event.clientX;
    startY = event.clientY;

    imageX += dragX * 3 / zoom;
    imageY += dragY * 3 / zoom;

    drawImageOnCanvas();
});

window.addEventListener("mouseup", () => {
    if (!isDragging) return;
    isDragging = false;
    cropCanvas.style.cursor = "grab";
});

// crop buttons
pfpBtn.addEventListener("click", () => {
    cropMain.classList.add("active");
    uploadPlaceholder.style.display = "flex";
    cropCanvas.style.display = "none";

    selectedImage = null;
    imageX = 0;
    imageY = 0;
    zoom = 1;
    zoomSlider.value = 1;
    zoomValue.textContent = "1.00x"
});

applyCropBtn.addEventListener("click", async (e) => {
    const croppedImage = cropCanvas.toDataURL("image/webp", 0.7);
    pfp.src = croppedImage;
    closeCrop();
    const response = await fetch('/members/photos/upload', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            image: croppedImage,
        }),
        credentials: 'include'
    })
    const reply = await response.json();
    console.log(reply);
});

document.addEventListener('DOMContentLoaded', async (e) => {
    const response = await fetch('/members/photos/mine', {
        credentials: 'include'
    });
    const reply = await response.json();
    if (reply.exists) {
        pfp.src = reply.data.publicUrl;
    }
})  

function closeCrop(){
    cropMain.classList.remove("active");

    if(imageURL){
        URL.revokeObjectURL(imageURL);
        imageURL = null;
    }

    selectedImage = null;
    picInput.value = "";
}

closeCropBtn.addEventListener("click", () => {
    closeCrop();
});

cancelCropBtn.addEventListener("click", () => {
    closeCrop();
});

removepfpBtn.addEventListener("click", async (e) => {
    const response = await fetch('/members/photos/delete', {
        method: 'DELETE',
        credentials: 'include'
    })
    const reply = await response.json();
    if (reply.error) {
        alert('Error deleting photo: ' + reply.mesge);
    } else {
        pfp.src = defaultpfp;
        picInput.value = "";
    }
})

resetZoomBtn.addEventListener("click", () => {
    zoom = 1;
    zoomSlider.value = 1
    zoomValue.textContent = "1.00x"
    imageX = 0;
    imageY = 0;

    drawImageOnCanvas();
})

//zoom value display
zoomSlider.addEventListener("input", (event) => {
    zoom = parseFloat(event.target.value);
    zoomValue.textContent = `${zoom.toFixed(2)}x`
    drawImageOnCanvas();
});

// profile info
const savebtn = document.querySelector(".savebtn");
const emailInput = document.getElementById("email");
const classInput = document.getElementById("class");
const roleInput = document.getElementById("role");

document.addEventListener("DOMContentLoaded", async (e)=> {
    const response = await fetch('/members/profile', {
        credentials: 'include'
    })
    const reply = await response.json();
    if (reply.success) {
        emailInput.value = reply.data[0].email;
        classInput.value = reply.data[0].class;
        roleInput.value = reply.data[0].role;
    } else {
        alert("Error loading profile info: " + reply.error.message);
        console.log("Error loading profile info: " + reply.error.message);
    }
})
savebtn.addEventListener('click', async (e)=> {
    let name;
    const nameReq = await fetch('/members/profile', {
        credentials: 'include'
    })
    const nameReply = await nameReq.json();
    name = nameReply.data[0].name;
    const response = await fetch('/members/profile/update', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            email: emailInput.value,
            class: classInput.value,
            role: roleInput.value,
            name: name
        }),
        credentials: 'include'
    })
    const reply = await response.json()
    if (reply.success) {
        emailInput.value = reply.data[0].email;
        classInput.value = reply.data[0].class;
        roleInput.value = reply.data[0].role;
    } else {
        console.log(reply);
        console.log(reply.error);
        alert('Error saving: ' + reply.message);
    }
})

// change password
const pwdUpdDiv = document.getElementById("passwordUpdate");
const pwdUpdForm = document.getElementById("passwordUpdForm");
const pwdUpdSubmit = document.getElementById("submitPwdUpd");
const currentPwdInput = document.getElementById("currentpassword");
const newPwdInput = document.getElementById("newpassword");
const repeatPwdInput = document.getElementById("repeatpassword");
const pwdUpdBtn = document.getElementById("changepwd");
pwdUpdBtn.addEventListener("click", async(e)=> {
    e.preventDefault();
    pwdUpdDiv.style.visibility = "visible";
})
document.addEventListener("keydown", (e)=>{
    if (e.key === 'Escape') {
        if (pwdUpdDiv.style.visibility !== 'hidden') {
            pwdUpdDiv.style.visibility = 'hidden'
        }
    }
})
pwdUpdSubmit.addEventListener("click", async (e)=> { 
    e.preventDefault();
    const currentPwd = currentPwdInput.value;
    const newPwd = newPwdInput.value;
    const repeatPwd = repeatPwdInput.value;
    if (newPwd === repeatPwd) {
        const response = await fetch('/auth/updatepwd', {
            method: 'POST', 
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                current_password: currentPwd,
                new_password: newPwd
            }),
            credentials: 'include'
        })
        const reply = await response.json();
        console.log(reply)
        if (reply.success) {
            pwdUpdDiv.style.visibility = 'hidden';
            window.location.href = "/login";
        }
    } else {
        alert("Passwords don't match!");
    }
})

document.addEventListener('DOMContentLoaded', async (e)=> {
    pwdUpdDiv.style.visibility = 'hidden';
    const request = await fetch('/members/me', {
        credentials: 'include'
    })
    const response = await request.json();
    if (response.authenticated) {
        localStorage.setItem("email", response.user.user_metadata.email);
    } else {
        window.location.href = "/404";
    }
})

//logout
const logoutBtn = document.getElementById("logoutBtn");
logoutBtn.addEventListener('click', async (e)=> {
    console.log("pressed logout")
    const response = await fetch('/auth/logout', {
        credentials: 'include'
    })
    console.log(response.status);
    console.log("3. Response received:", response.status);
    console.log("4. Content type:", response.headers.get("content-type"));
    const data = await response.json();
    console.log(data)
    if (data.error) {
        alert('Error logging out' + data.message);
    }
    const request = await fetch('/members/me', {
        credentials: 'include'
    })
    const response2 = await request.json();
    if (response2.authenticated) {
        alert('Error logging out' + data.message);
    } else {
        window.location.href = "/#";
    }
})

// notifcations - ON HOLD.
const eventNotif = document.getElementById("eventNotifs");
const announcementNotif = document.getElementById("announcementsNotifs");
const projectsNotif = document.getElementById("projectNotifs");