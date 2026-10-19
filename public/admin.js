// login/signup manager + checkauth
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('nav');
    const navTitle = document.getElementById('nav-title');
    function checkScroll () {
        if(window.scrollY>40){
            nav.classList.add("scrolled");
        } else{
            nav.classList.remove("scrolled");
        }
    }

    window.addEventListener('scroll', checkScroll);
    checkScroll();
    
    const loginWindow = document.getElementById('login');
    const signUpForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    signUpForm.style.display = 'none';
    let clicked = false;
    const typeSwitch = document.getElementById('type-switch');
    typeSwitch.addEventListener('click', ()=> {
        if (clicked) {
            loginForm.style.display = 'flex';
            signUpForm.style.display = 'none';
            clicked = false;
            typeSwitch.textContent = 'New user? Sign Up!'
        } else {
            loginForm.style.display = 'none';
            signUpForm.style.display = 'flex';
            clicked = true;
            typeSwitch.textContent = 'Existing user? Login!'
        }
    })
    async function checkAuth() {
        const response = await fetch('/admin/me', {
            credentials: "include"
        })
        console.log("Status:", response.status);
        console.log("Content-Type:", response.headers.get('content-type'));
        const result = await response.json();
        console.log("SERVER RESPONSE:", result);
        if (result.authenticated) {
            loginWindow.remove();
            return true
        } else {
            loginWindow.style.hidden = false; 
            return false
        }
    }
    async function init() {
        try {
            const authenticated = await checkAuth();
            if (authenticated) {
                loginWindow.remove();
            } else {
                const submit = document.getElementById('login-submit');
                const email = document.getElementById('email');
                const password = document.getElementById('password');
                const newEmail = document.getElementById('newEmail');
                const newPassword = document.getElementById('newPassword');
                const confirmPassword = document.getElementById('newConfirmPassword');
                const signupSubmit = document.getElementById('signup-submit');
                const username = document.getElementById("nameInput");
                signupSubmit.addEventListener('click', async (e)=> {
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
                    e.preventDefault();
                    if (newPassword.value.length >= 6 && hasUpperCase(newPassword.value) && hasLowerCase(newPassword.value) && hasSymbols(newPassword.value)) { 
                        if (newPassword.value === confirmPassword.value) {
                            const response = await fetch('/admin/signup', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    name: username.value,
                                    email: newEmail.value,
                                    password: newPassword.value
                                }),
                                credentials: 'include'
                            })
                            const result = await response.json();
                            if (result.auth === 'Success') {
                                loginWindow.remove();
                            } else {
                                alert('Error ' + result.result)
                            }
                        } else {
                            alert('Passwords do not match, try again!')
                        }
                    } else {
                        alert('Password too weak, include 1 uppercase letter, 1 lowercase, 1 symbol and minimum 6 letters')
                    }
                })
                submit.addEventListener('click', async (e) => {
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
                    e.preventDefault();
                    if (password.value.length >= 6 && hasUpperCase(password.value) && hasLowerCase(password.value) && hasSymbols(password.value)) { 
                        const request = await fetch('/admin/login', {
                            method: 'POST',
                            headers: {
                                'content-type': 'application/json'
                            },
                            body: JSON.stringify({
                                email: email.value,
                                password: password.value
                            }),
                            credentials: 'include'
                        })
                        console.log(request.status);
                        const response = await request.json();
                        console.log('Server response', response);
                        if (response.login === 'S') {
                            loginWindow.remove();
                        } else {
                            console.log(response.status);
                            console.log(response);
                            alert('Login failed, wrong password/email');
                        }
                    } else {
                        alert('Password too weak, include 1 uppercase letter, 1 lowercase, 1 symbol and minimum 6 letters')
                    }
                })
            }
        } catch (err) {
            console.error(err);
            return false;
        }
        
    }
    init();

    // password view buttons
    const pwdviewbtns = document.querySelectorAll(".passwordViewBtn");
    
    pwdviewbtns.forEach((button) => {
        const targetId = button.dataset.target;
        const inputPwd = document.getElementById(targetId);
        const eyeOpen = button.querySelector(".eyeopen");
        const eyeClosed = button.querySelector(".eyeclosed");

        eyeClosed.style.display = 'none';
        eyeOpen.style.display = 'block';

        button.addEventListener('click', () => {
            const isPassword = inputPwd.type === 'password';
            inputPwd.type = isPassword ? 'text' : 'password';

            eyeClosed.style.display = isPassword ? 'block' : 'none';
            eyeOpen.style.display = isPassword ? 'none' : 'block';
        });
    });
})