const nav = document.getElementById('nav');
const memberName = document.getElementById('memberName');

    function checkScroll () {
        if(window.scrollY>40){
            nav.classList.add("scrolled");
        } else{
            nav.classList.remove("scrolled");
        }
    }

    window.addEventListener('scroll', checkScroll);
    checkScroll();


document.addEventListener('DOMContentLoaded', async (e)=> {
    const request = await fetch('/members/me', {
        credentials: 'include'
    })
    const response = await request.json();
    if (response.authenticated) {
        memberName.textContent = response.user.user_metadata.display_name;
    } else {
        window.location.href = "/404";
    }
})
