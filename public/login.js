const inputPwd = document.getElementById('passwordInput');
const pwdviewbtn = document.querySelector('.passwordviewbtn');
const eyeopen = document.querySelector('.eyeopen');
const eyeclosed = document.querySelector('.eyeclosed');
const loginSubmit = document.getElementById('loginBtn');
const emailInput = document.getElementById('emailInput');
pwdviewbtn.addEventListener('click', () => {
    if(inputPwd.type === 'password'){
        inputPwd.type = 'text';
        eyeopen.style.display = 'none';
        eyeclosed.style.display = 'block';
    } else{
        inputPwd.type = 'password';
        eyeopen.style.display = 'block';
        eyeclosed.style.display = 'none';
    }
})
loginSubmit.addEventListener('click', async(e)=> {
    e.preventDefault();
    const request = await fetch('/auth/signin', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            email: emailInput.value,
            password: inputPwd.value
        }),
        credentials: 'include'
    })
    const response = await request.json();
    if (response.loggedIn) {
        window.location.href = '/members'
    } else {
        alert('Error', response.error);
    }
})
document.addEventListener('DOMContentLoaded', async (e)=> {
    const request = await fetch('/members/me', {
        credentials: 'include'
    });
    const response = await request.json();
    if (response.authenticated) {
        window.location.href = "/members";
    }
})