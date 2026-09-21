const inputPwd = document.getElementById('passwordInput');
const pwdviewbtn = document.querySelector('.passwordviewbtn');
const eyeopen = document.querySelector('.eyeopen');
const eyeclosed = document.querySelector('.eyeclosed');

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