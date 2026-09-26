document.addEventListener('DOMContentLoaded', ()=> {
    const projectSubmit = document.getElementById('paf-submit');
    const projectCancel = document.getElementById('paf-cancel');
    const projectAdd = document.getElementById('p-add');
    const newProjectMenu = document.getElementById('pa-menu');
    let authenticated = false;
    projectSubmit.addEventListener('click', (e) => {
        e.preventDefault();
        newProjectMenu.classList.remove('slideIn');
        newProjectMenu.classList.add('slideOut');
        const projectName = document.getElementById('p-name');
        const projectTags = document.getElementById('p-tags');
        const projectImg = document.getElementById('p-image');
        const projectDesc = document.getElementById('p-desc');
        const name = projectName.value;
        const tags = projectTags.value;
        const img = projectImg.value;
        const desc = projectDesc.value;
        addProject(name, tags, desc, img);
    })
    projectCancel.addEventListener('click', (e) => {
        e.preventDefault();
        newProjectMenu.classList.remove('slideIn');
        newProjectMenu.classList.add('slideOut');
    })
    projectAdd.addEventListener('click', (e)=> {
        e.preventDefault();
        newProjectMenu.classList.add('slideIn');
        newProjectMenu.classList.remove('slideOut');
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
            authenticated = true;
        } else {
            authenticated = false;
        }
    }
    async function addProject(name, tags, desc, img) {
        if (checkAuth()) {
            tags = sliceTags(tags);
            const reqeust = await fetch('/admin/projects/add', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    tags,
                    img,
                    desc,
                })
            })
        }
    }
    function sliceTags(tags = String) {
	    let splitTags = Array;
	    splitTags = tags.split(",");
	    for (let i = 0; i < splitTags.length; i++) {
		    splitTags[i] = splitTags[i].trim();
	    }
        return splitTags;
    }
    async function getAllProjects() {
        const request = await fetch('/admin/projects');
        const response = await request.json();
        
    }
})