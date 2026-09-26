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

let selectedImage = null;
let imageURL = null;

picInput.addEventListener("change", () => {
    const file = picInput.files[0];
    if(!file) return;

    const allowedtypes = ["image/jpeg", "image/png",, "image/webp"];
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
        drawImageOnCanvas(selectedImage);
        cropMain.classList.add("active");
    };

    selectedImage.src = imageURL;
});

function drawImageOnCanvas(image){
    if(!image)return;

    const cropSize = Math.min(image.naturalWidth, image.naturalHeight);
    const sourceX = (image.naturalWidth - cropSize)/2;
    const sourceY = (image.naturalHeight - cropSize)/2;

    cropCanvas.width = 512;
    cropCanvas.height = 512;

    ctx.clearRect(0,0,cropCanvas.width, cropCanvas.height);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(image, sourceX, sourceY, cropSize, cropSize, 0, 0, 512, 512);
}

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