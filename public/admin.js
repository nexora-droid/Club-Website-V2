const navbar = document.getElementById("nav");
const navtitle = document.getElementById("nav-title");
window.addEventListener("scroll", ()=>{
    if (window.scrollY >= 500) {
        navbar.classList.add("shrink");
        navtitle.hidden = true;
    } else {
        navbar.classList.remove("shrink");
        navtitle.hidden = false;
    }
})