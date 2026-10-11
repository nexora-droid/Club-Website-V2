const sendBtn = document.getElementById('sendBtn');
const msgInput = document.getElementById('msgText');
const aiTemplate = document.getElementById('aimsgtemplate');
const userTemplate = document.getElementById('usermsgtemplate');
const messages = document.getElementById("messages");
sendBtn.addEventListener('click', async (e)=> {
    e.preventDefault();
    const msg = msgInput.value;
    msgInput.value = " ";
    const userNode = userTemplate.content.cloneNode(true);
    userNode.querySelector(".usermsg").innerHTML = msg;
    userNode.querySelector(".username").textContent = localStorage.getItem('name');
    messages.appendChild(userNode);
    messages.scrollTo({
        top: messages.scrollHeight,
        behavior: 'smooth'
    })
    const response = await fetch('/members/support/ai', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            message: msg
        })
    })
    const reply = await response.json();
    const aiNode = aiTemplate.content.cloneNode(true);
    aiNode.querySelector(".aimsg").innerHTML = marked.parse(reply.answer);
    messages.appendChild(aiNode);
    messages.scrollTo({
        top: messages.scrollHeight,
        behavior: 'smooth'
    })
})