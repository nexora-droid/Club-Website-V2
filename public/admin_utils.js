document.addEventListener('DOMContentLoaded', ()=> {
    const projectSubmit = document.getElementById('paf-submit');
    const projectCancel = document.getElementById('paf-cancel');
    const projectAdd = document.getElementById('p-add');
    const newProjectMenu = document.getElementById('pa-menu');
    const eventSubmit = document.getElementById('eaf-submit');
    const eventCancel = document.getElementById('eaf-cancel');
    const eventAdd = document.getElementById('e-add');
    const newEventMenu = document.getElementById('ea-menu');

    const projectDelete = document.querySelectorAll('.project-delete');
    const projectEdit = document.querySelectorAll('.project-edit');
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
    eventSubmit.addEventListener('click', (e)=> {
        e.preventDefault();
        newEventMenu.classList.remove('slideIn');
        newEventMenu.classList.add('slideOut');
        const eventName = document.getElementById('e-name');
        const eventStatus = document.getElementById('e-status');
        const eventDesc = document.getElementById('e-desc');
        const eventImg = document.getElementById("e-image");
        const eName = eventName.value;
        const eStatus = eventStatus.checked;
        const eImg = eventImg.value;
        const eDesc = eventDesc.value;
        addEvent(eName, eStatus, eImg, eDesc);
    })
    projectCancel.addEventListener('click', (e) => {
        e.preventDefault();
        newProjectMenu.classList.remove('slideIn');
        newProjectMenu.classList.add('slideOut');
    })
    eventCancel.addEventListener('click', (e) => {
        e.preventDefault();
        newEventMenu.classList.remove('slideIn');
        newEventMenu.classList.add('slideOut');
    })
    projectAdd.addEventListener('click', (e)=> {
        e.preventDefault();
        newProjectMenu.classList.add('slideIn');
        newProjectMenu.classList.remove('slideOut');
    })
    eventAdd.addEventListener('click', (e) => {
        e.preventDefault();
        newEventMenu.classList.add('slideIn');
        newEventMenu.classList.remove('slideOut');
    })
    async function checkAuth() {
        const response = await fetch('/admin/me', {
            credentials: "include"
        })
        //console.log("Status:", response.status);
        //console.log("Content-Type:", response.headers.get('content-type'));
        const result = await response.json();
        //console.log("SERVER RESPONSE:", result);
        if (result.authenticated) {
            authenticated = true;
        } else {
            authenticated = false;
        }
        return authenticated;
    }
    async function addProject(name, tags, desc, img) {
        if (await checkAuth()) {
            tags = sliceTags(tags);
            const response = await fetch('/admin/projects/add', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    tags,
                    img,
                    desc,
                    adding: true
                })
            })
            if (!response.ok) {
                console.error("Failed to add project:", response.status);
                return;
            }
            await populateProjs();
        }
    }
    async function addEvent(name, status, img, desc) {
        if (await checkAuth()) {
            const response = await fetch("/admin/events/add", {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    status,
                    img, 
                    desc
                })
            })
            if (!response.ok) {
                console.error('Failed to add event: ', response.status)
                return;
            }
            console.log('Event add response', response);
            await populateEvents();
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
    const projTemplate = document.getElementById('project-template');
    async function populateProjs() {
        const request = await fetch('/admin/projects', {
            cache: 'no-store'
        });
        const response = await request.json();
        const projectsDiv = document.querySelector('.cards');
        projectsDiv.innerHTML = ' ';
        if (response.length === 0) {
            const clone = projTemplate.content.cloneNode(true);
            clone.querySelector(".project-title").textContent = "No Projects yet";
            clone.querySelector(".project-img").src = "https://images.pexels.com/photos/2882552/pexels-photo-2882552.jpeg";
            clone.querySelector(".project-info").textContent = "DB is empty, add project to show here!";
            projectsDiv.appendChild(clone);
        } else {
            for (let i = 0; i < response.length; i++) {
                const project = response[i];
                const clone = projTemplate.content.cloneNode(true);
                clone.querySelector(".project-title").textContent = project.name;
                clone.querySelector(".project-img").src = project.image;
                clone.querySelector(".project-info").innerHTML = project.description;
                if (project.tags.includes("HTML" || project.tags.includes("html"))) {
                    clone.querySelector(".project-type").innerHTML += "";
                }
                projectsDiv.appendChild(clone);
            }
        }
    }
    const eventTemplate = document.getElementById('event-template');
    async function populateEvents() {
        const request = await fetch('/admin/events', {
            cache: 'no-store'
        });
        const response = await request.json();
        const eventsDiv = document.querySelector('.e-cards');
        eventsDiv.innerHTML = ' ';
        if (response.length === 0) {
            const clone = eventTemplate.content.cloneNode(true);
            clone.querySelector(".event-title").textContent = "No events yet";
            clone.querySelector(".event-img").src = "https://images.pexels.com/photos/2882552/pexels-photo-2882552.jpeg";
            clone.querySelector(".event-info").textContent = "DB is empty, add a new project via Supabase website, or from menu here."
            clone.querySelector("span").classList.add('status-ended');
            clone.querySelector("span").textContent = "N/A";
            eventsDiv.appendChild(clone);
        } else {
            for (let i = 0; i < response.length; i++ ) {
                const event = response[i];
                const clone = eventTemplate.content.cloneNode(true);
                clone.querySelector(".event-title").textContent = event.name;
                clone.querySelector(".event-img").src = event.image || "https://images.pexels.com/photos/2882552/pexels-photo-2882552.jpeg" ;
                clone.querySelector(".event-info").innerHTML = event.description;
                if (event.active) {
                    clone.querySelector("span").classList.add('status-active');
                    clone.querySelector("span").textContent = "Active";
                } else {
                    clone.querySelector("span").classList.add('status-ended');
                    clone.querySelector("span").textContent = "Ended";
                }
                eventsDiv.appendChild(clone);
            }
        }
    }
    const projectsDiv = document.querySelector('.cards');
    projectsDiv.addEventListener('click', async (e) => {
        const deleteButton = e.target.closest(".project-delete");
        if (!deleteButton) return;
        if (!await checkAuth()){
            alert("Oops! Not allowed to perfom action!");
            return;
        }
        const buttonsDiv = deleteButton.parentElement;
        const card = buttonsDiv.parentElement;
        const projToDel = card.querySelector(".project-title").textContent;
        console.log(`projtodelstored ${projToDel}`);
        let confirmDelete = prompt(`You are deleting ${projToDel}. \nType sudo delete ${projToDel} to confirm`);
        if (confirmDelete.trim() === `sudo delete ${projToDel}`) {
            console.log(confirmDelete.trim());
            if (await deleteProj(projToDel)) {
                populateProjs();
            };
            console.log('del called');
        } else {
            alert('Please repeat the action, you mistyped something');
        }
    })
    const eventsDiv = document.querySelector('.e-cards');
    eventsDiv.addEventListener('click', async (e)=> {
        const eDeleteButton = e.target.closest(".event-delete");
        if (!eDeleteButton) return;
        if (!await checkAuth()){
            alert("Oops! Not allowed to perfom action!");
            return;
        }
        const eButtonsDiv = eDeleteButton.parentElement;
        const eCard = eButtonsDiv.parentElement;
        const eventToDel = eCard.querySelector(".event-title").textContent;
        console.log(`eventodelstored ${eventToDel}`);
        let confirmDelete = prompt(`You are deleting ${eventToDel}. \nType sudo delete ${eventToDel} to confirm`);
        if (confirmDelete.trim() === `sudo delete ${eventToDel}`) {
            console.log(confirmDelete.trim());
            if (await eventDel(eventToDel)) {
                populateEvents();
            };
            console.log('del called');
        } else {
            alert('Please repeat the action, you mistyped something');
        }
    })
    async function deleteProj(name) {
        const request = await fetch('/admin/projects/delete', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                name: name
            }),
            credentials: 'include'
        })
        const response = await request.json();
        if (response.deleted) {
            return {deleted: true}
        } else {
            console.log(response);
        }
    }
    async function eventDel(name) {
        const request = await fetch('/admin/events/delete', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                name: name
            }),
            credentials: 'include'
        })
        const response = await request.json();
        if (response.deleted) {
            return {deleted: true}
        } else {
            console.log(response);
        }
    }
    populateProjs();
    populateEvents();
})