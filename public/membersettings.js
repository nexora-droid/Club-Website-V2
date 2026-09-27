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
const resetZoomBtn = document.getElementById("resetZoomBtn");

let selectedImage = null;
let imageURL = null;
let zoom = 1;

// zoom drag control variaables
let imageX = 0;
let imageY = 0;
let isDragging = false;
let startX = 0;
let startY = 0;

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

        drawImageOnCanvas(selectedImage);
        cropMain.classList.add("active");
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
    picInput.click();
});

applyCropBtn.addEventListener("click", () => {
    const croppedImage = cropCanvas.toDataURL("image/jpeg", 0.95);
    pfp.src = croppedImage;
    closeCrop();
});

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

removepfpBtn.addEventListener("click", () => {
    pfp.src = defaultpfp;
    picInput.value = "";
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
const zoomSlider = document.getElementById("zoomSlider");
const zoomValue = document.getElementById("zoomValue");

zoomSlider.addEventListener("input", (event) => {
    zoom = parseFloat(event.target.value);
    zoomValue.textContent = `${zoom.toFixed(2)}x`
    drawImageOnCanvas();
});