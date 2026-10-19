const pwdviewbtn = document.querySelectorAll('.passwordviewbtn');
const pwdRepeatInput = document.getElementById('passwordRepeatInput');
const pwdInput = document.getElementById('passwordInput');
const pwdWarn = document.getElementById('warn');
const submit = document.getElementById('loginBtn');
const nameInput = document.getElementById('nameInput');
const emailInput = document.getElementById('emailInput');
pwdWarn.hidden = true;
pwdviewbtn.forEach(button => {
    button.addEventListener('click', () => {

        const field = button.closest('.formfield');
        const input = field.querySelector('input');
        const eyeopen = button.querySelector('.eyeopen');
        const eyeclosed = button.querySelector('.eyeclosed');

        if(input.type === 'password'){
            input.type = 'text';
            eyeopen.style.display = 'none';
            eyeclosed.style.display = 'block';
        } else{
            input.type = 'password';
            eyeopen.style.display = 'block';
            eyeclosed.style.display = 'none';
        }
    });
})
pwdRepeatInput.addEventListener('input', (e)=> {
    if (pwdRepeatInput.value === pwdInput.value) {
        pwdWarn.hidden = true;
    } else {
        pwdWarn.hidden = false;
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
submit.addEventListener('click', async (e)=> {
    if (inputPwd.value.length >= 6 && hasUpperCase(inputPwd.value) && hasLowerCase(inputPwd.value) && hasSymbols(inputPwd.value)) {
        e.preventDefault();
        if (pwdInput.value === pwdRepeatInput.value) {
            const name = nameInput.value;
            const email = emailInput.value;
            const pwd = pwdRepeatInput.value;
            signUp(name, email, pwd);
        } else {
            alert('Error occured. Passwords still dont match.')
        }
    } else {
        alert('Password too weak, include 1 uppercase letter, 1 lowercase, 1 symbol and minimum 6 letters');
    }


})
async function signUp(name, email, pwd) {
    const request = await fetch('/auth/signup', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            email: email,
            password: pwd
        }),
        credentials: 'include'
    })
    const response = await request.json();
    if (response.loggedIn) {
        window.location.href = "/members";
    }
}

document.addEventListener('DOMContentLoaded', async (e)=> {
    const request = await fetch('/members/me', {
        credentials: 'include'
    });
    const response = await request.json();
    if (response.authenticated) {
        window.location.href = "/members";
    }
})