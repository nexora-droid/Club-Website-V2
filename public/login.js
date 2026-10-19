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
function hasSymbols(str) {
  const regex = /[^a-zA-Z0-9 ]/;
  return regex.test(str);
}
function hasUpperCase(str) {
    return /[A-Z]/.test(str);
}

function hasLowerCase(str) {
    return /[a-z]/.test(str);
}
loginSubmit.addEventListener('click', async(e)=> {
    if (inputPwd.value.length >= 6 && hasUpperCase(inputPwd.value) && hasLowerCase(inputPwd.value) && hasSymbols(inputPwd.value)) {
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
            alert('Error: ' + response.error.message);
        }
    } else {
        alert('Password too weak, include 1 uppercase letter, 1 lowercase, 1 symbol and minimum 6 letters');
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