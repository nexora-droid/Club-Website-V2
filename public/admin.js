// login/signup manager + checkauth
document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('nav');
    const navTitle = document.getElementById('nav-title');
    function checkScroll () {
        if(window.scrollY>400){
            nav.classList.add("scrolled");
            navTitle.hidden = true;
        } else{
            nav.classList.remove("scrolled");
            navTitle.hidden = false;
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
            typeSwitch.textContent = 'Exsisting user? Login!'
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
                signupSubmit.addEventListener('click', async (e)=> {
                    e.preventDefault();
                    if (newPassword.value === confirmPassword.value) {
                        const response = await fetch('/admin/signup', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
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
                })
                submit.addEventListener('click', async (e) => {
                    e.preventDefault();
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
                })
            }
        } catch (err) {
            console.error(err);
            return false;
        }
        
    }
    init();
})