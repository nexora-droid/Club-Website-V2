const pwdviewbtn = document.querySelectorAll('.passwordviewbtn');

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
})
})