document.addEventListener('DOMContentLoaded', async (e)=> {
    const projectSubmit = document.getElementById('paf-submit');
    const projectCancel = document.getElementById('paf-cancel');
    const projectAdd = document.getElementById('project-add');
    const newProjectMenu = document.getElementById('pa-menu');
    const eventSubmit = document.getElementById('eaf-submit');
    const eventCancel = document.getElementById('eaf-cancel');
    const eventAdd = document.getElementById('e-add');
    const newEventMenu = document.getElementById('ea-menu');
    const projectsDiv = document.querySelector('.project-grid');
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
        const projectUEmail = document.getElementById('p-email');
        const name = projectName.value;
        const tags = projectTags.value;
        const img = projectImg.value;
        const desc = projectDesc.value;
        const email = projectUEmail.value;
        addProject(name, tags, desc, img, email);
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
    async function addProject(name, tags, desc, img, email) {
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
                    email,
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
                // if (project.tags.includes("HTML" || project.tags.includes("html"))) {
                //     clone.querySelector(".project-type").innerHTML += "";
                // }
                const projLangTag = document.createElement("p");
                projLangTag.classList.add("project-lang");
                projLangTag.textContent = project.tags[0];
                const projCategory = document.createElement("p");
                projCategory.classList.add("project-category");
                projCategory.textContent = project.tags[1];
                clone.querySelector(".project-type").innerHTML = "";
                clone.querySelector(".project-type").appendChild(projLangTag);
                clone.querySelector(".project-type").appendChild(projCategory);
                clone.querySelector(".proj-email-part").textContent = project.email;
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
    projectsDiv.addEventListener('click', async (e) => {
        if (e.target.closest(".project-delete")) {
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
        } else if (e.target.closest(".project-edit")) {
            console.log("project edit pressed");
            const editButton = e.target.closest(".project-edit");
            if (!editButton) return;
            if (!await checkAuth()) {
                alert("Not allowed to perform action!");
            }
            const buttonsDiv = editButton.parentElement;
            const card = buttonsDiv.parentElement;
            const projToEdit = card.querySelector(".project-title").textContent;
            const projImg = card.querySelector(".project-img").src;
            const projTagsDiv = card.querySelector(".project-type");
            const projTags = Array.from(projTagsDiv.children).map(child => child.textContent);
            const projDesc = card.querySelector(".project-info").innerHTML;
            const projUEmail = card.querySelector(".proj-email-part").textContent;
            console.log(projUEmail);
            const projectEditWindow = document.getElementById("pe-menu");
            projectEditWindow.classList.remove("slideOut");
            projectEditWindow.classList.add("slideIn");
            projectEditWindow.querySelector("#pe-name").value = projToEdit;
            projectEditWindow.querySelector("#pe-tags").value = projTags.toString();
            projectEditWindow.querySelector('#pe-image').value = projImg;
            projectEditWindow.querySelector("#pe-img-prev").src = projImg;
            projectEditWindow.querySelector("#pe-desc").textContent = projDesc;
            projectEditWindow.querySelector("#pe-email").value = projUEmail;
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
            method: 'DELETE',
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
            method: 'DELETE',
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
    async function editProject(name, tags, img, desc, email) {
        if (await checkAuth()) {
            tags = sliceTags(tags);
            const response = await fetch('/admin/projects/edit', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    project_name: name,
                    project_tags: tags,
                    project_img: img,
                    project_info: desc,
                    project_uemail: email
                })
            })
            const reply = await response.json();
            if (!reply.success) {
                console.error("Failed to edit project:", response.error);
                console.log(response);
                return;
            }
            await populateProjs();
        }
    }
    // project edit closing & opening
    const projectEditWindow = document.getElementById("pe-menu");
    const projEditSubmit = document.getElementById("pef-submit");
    const projEditCancel = document.getElementById("pef-cancel");

    projEditCancel.addEventListener('click', (e)=> {
        e.preventDefault();
        projectEditWindow.classList.add('slideOut');
        projectEditWindow.classList.remove('slideIn');
        projectEditWindow.querySelectorAll('form').forEach(form => form.reset());
        projectEditWindow.querySelector('#pe-img-prev').src = "https://cdn.hackclub.com/01a07c4c-1f24-758b-9aa0-9416c522e697/pexels-balazsimon-13128922.jpg";
        projectEditWindow.querySelector('textarea').textContent = "";
    })

    projEditSubmit.addEventListener('click', async (e) => {
        e.preventDefault();
        projectEditWindow.classList.add('slideOut');
        projectEditWindow.classList.remove('slideIn');
        const projName = projectEditWindow.querySelector("#pe-name").value;
        const projImg = projectEditWindow.querySelector("#pe-image").value;
        const projTags = projectEditWindow.querySelector("#pe-tags").value;
        const projDesc = projectEditWindow.querySelector("#pe-desc").value;
        const projectUEmail = projectEditWindow.querySelector("#pe-email").value;
        editProject(projName, projTags, projImg, projDesc, projectUEmail);
    } )

    // loading announcements
    const newAnnouncement = document.getElementById("new-announcement");
    const announcementMenu = document.getElementById("a-menu");
    const announcementTemplate = document.getElementById("announcement-template");
    const pastAnnHolder = document.getElementById("pa-holder")
    newAnnouncement.addEventListener("click", async(e) => {
        announcementMenu.classList.remove("slideOut");
        announcementMenu.classList.add("slideIn");
        const request = await fetch('/admin/announcements');
        const reply = await request.json();
        if (reply) {
            pastAnnHolder.innerHTML = "";
            for (let i = 0; i < reply.data.length; i++) {
                const announcement = reply.data[i];
                const clone = announcementTemplate.content.cloneNode(true);
                clone.querySelector(".pann-msg").textContent = announcement.announcement;
                const dateAdded = new Date(`${announcement.created_at}T00:00:00`);
                const formattedDate = new Intl.DateTimeFormat('en-GB').format(dateAdded);
                clone.querySelector(".pann-date-part").textContent = formattedDate;
                pastAnnHolder.appendChild(clone);
            }
        }
        console.log(reply);
    })
    const announcementCancel = document.querySelector('.a-cancel');
    const announcementSubmit = document.querySelector('.a-submit');
    const announcement = document.getElementById("announcement");
    announcementCancel.addEventListener('click', (e)=> {
        e.preventDefault();
        announcementMenu.classList.remove('slideIn');
        announcementMenu.classList.add('slideOut');
    })
    announcementSubmit.addEventListener('click', async(e)=>{
        e.preventDefault();
        const request = await fetch('/admin/announcements/add', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                announcement: announcement.value
            }),
            credentials: 'include'
        })
        const reply = await request.json();
        if (reply.success) {
            announcementMenu.classList.remove('slideIn');
            announcementMenu.classList.add('slideOut');
        }
    })
    pastAnnHolder.addEventListener('click', async (e) => {
        if (e.target.closest(".pann-delete")) {
            const deleteButton = e.target.closest(".pann-delete");
            if (!deleteButton) return;
            if (!await checkAuth()) {
                alert('Not allowed to perform action');
                return;
            }
            const buttonParent = deleteButton.parentElement;
            const card = buttonParent.parentElement;
            const anncToDel = card.querySelector(".pann-msg").textContent;
            const request = await fetch('/admin/announcements/delete', {
                method: 'DELETE',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    announcement: anncToDel
                }),
                credentials: 'include'
            })
            const response = await request.json();
            if (response.success) {
                alert("yay deleted");
            } else {
                alert("oh no");
                console.log(response);
            }
        }
    })

    // member panel - the heavy work
    const memberCardTemplate = document.getElementById("membercard-template");
    const memberProjectTemplate = document.getElementById("memberproject-template");
    const memberList = document.getElementById("m-list");
    const refresh = document.getElementById("refresh");
    refresh.addEventListener('click', async (e)=> {
        e.preventDefault();
        populateMembers();
    })
    async function populateMembers() {
        memberList.innerHTML = "";
        const request = await fetch('/admin/members');
        const response = await request.json();
        for (let i = 0; i < response.data.length; i++) {
            const user = response.data[i];
            const clone = memberCardTemplate.content.cloneNode(true);
            clone.querySelector(".m-name").textContent = user.name;
            clone.querySelector(".m-email").textContent = user.email;
            memberList.appendChild(clone);
        }
        const firstCard = memberList.querySelector(".membercard");
        firstCard.classList.add("active");
        populateMainCard(firstCard.querySelector(".m-email").textContent);
    }
    const memberProjList = document.getElementById("mip-list");
    const memberInfoPanel = document.getElementById("m-info");
    async function populateMainCard(email) {
        const request = await fetch(`/admin/members/${email}`)
        const reply = await request.json();
        if (reply.success) {
            const projReq = await fetch(`/admin/projects/${email}`);
            const projRes = await projReq.json();
            if (projRes.data.length === 0) {
                memberProjList.innerHTML = '';
            } else {
                memberProjList.innerHTML = ''
                for (let i = 0; i < projRes.data.length; i++) {
                    const project = projRes.data[i];
                    const clone = memberProjectTemplate.content.cloneNode(true);
                    clone.querySelector(".mip-name").textContent = project.name;
                    clone.querySelector(".mip-desc").innerHTML = project.description;
                    memberProjList.appendChild(clone);
                }
            }
            memberInfoPanel.querySelector("#mi-name").textContent = reply.data[0].name;
            memberInfoPanel.querySelector("#mi-email").textContent = reply.data[0].email;
        }
    }
    populateMembers();
    memberList.addEventListener('click', async(e)=> {
        console.log(e.target)
        let card;
        if (e.target.matches(".membercard")) {
            card = e.target.closest(".membercard");
        } else {
            card = e.target.parentElement;
        }
        console.log(card)
        const emailToDisp = card.querySelector(".m-email").textContent;
        populateMainCard(emailToDisp);
        Array.from(memberList.children).forEach((element) => {
            element.classList.remove("active")
        })
        card.classList.add("active");
    })
    // send message
    const msgToSend = document.getElementById('f-info').value;
})