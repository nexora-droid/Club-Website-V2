const sendBtn = document.getElementById('sendBtn');
const msgInput = document.getElementById('msgText');
const aiTemplate = document.getElementById('aimsgtemplate');
const userTemplate = document.getElementById('usermsgtemplate');
const messages = document.getElementById("messages");
sendBtn.addEventListener('click', async (e)=> {
    e.preventDefault();
    const msg = msgInput.value;
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
    const userNode = userTemplate.content.cloneNode(true);
    userNode.querySelector(".usermsg").textContent = msg;
    messages.appendChild(userNode);
    const aiNode = aiTemplate.content.cloneNode(true);
    aiNode.querySelector(".aimsg").textContent = reply.answer;
    messages.appendChild(aiNode);
})