const nav = document.getElementById('nav');
const memberName = document.getElementById('memberName');

    function checkScroll () {
        if(window.scrollY>40){
            nav.classList.add("scrolled");
        } else{
            nav.classList.remove("scrolled");
        }
    }

    window.addEventListener('scroll', checkScroll);
    checkScroll();


document.addEventListener('DOMContentLoaded', async (e)=> {
    const request = await fetch('/members/me', {
        credentials: 'include'
    })
    const response = await request.json();
    if (response.authenticated) {
        memberName.textContent = response.user.user_metadata.display_name;
        localStorage.setItem("name", response.user.user_metadata.display_name);
    } else {
        window.location.href = "/404";
    }
    populateAnnouncements();
    populateEvents();
    populateProjects();
})
const mCard1 = document.getElementById('meetingCard1');
const mCard2 = document.getElementById('meetingCard2');
const mCard3 = document.getElementById('meetingCard3');
const eCard1 = document.getElementById('eventCard1');
const eCard2 = document.getElementById('eventCard2');
const pCard1 = document.getElementById('projectCard1');
const pCard2 = document.getElementById('projectCard2');
async function populateAnnouncements() {
    const request = await fetch('/members/meetings');
    const reply = await request.json();
    if (reply.success) {
        const meeting1 = reply.data[0]?.name || null;
        const meeting2 = reply.data[1]?.name || null;
        const meeting3 = reply.data[2]?.name || null;
        const m1Desc = reply.data[0]?.description || null;
        const m2Desc = reply.data[1]?.description || null;
        const m3Desc = reply.data[2]?.description || null;
        let m1Date = reply.data[0]?.date || null;
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        if (m1Date !== null) {
            const dateObj1 = new Date(m1Date.replace(/-/g, '\/'));
            m1Date = dateObj1.toLocaleDateString("en-US", options);
        }
        let m2Date = reply.data[1]?.date || null;
        if (m2Date !== null) {
            const dateObj2 = new Date(m2Date.replace(/-/g, '\/'));
            m2Date = dateObj2.toLocaleDateString("en-US", options);
        }
        let m3Date = reply.data[2]?.date || null;
        if (m3Date !== null) {
            const dateObj3 = new Date(m3Date.replace(/-/g, '\/'));
            m3Date = dateObj3.toLocaleDateString("en-US", options);
        }
        const options2 = { timeStyle: 'short' };
        let m1Time = reply.data[0]?.time.split(":")[0] || null;
        if (m1Time !== null) {
            const dateObj = new Date();
            dateObj.setHours(m1Time, "00", "00");
            m1Time = dateObj.toLocaleTimeString("en-US", options2);
        }
        let m2Time = reply.data[1]?.time.split(":")[0] || null;
        if (m2Time !== null) {
            const dateObj = new Date();
            dateObj.setHours(m2Time, "00", "00");
            m2Time = dateObj.toLocaleTimeString("en-US", options2);
        }
        let m3Time = reply.data[2]?.time.split(":")[0] || null;
        if (m3Time !== null) {
            const dateObj = new Date();
            dateObj.setHours(m3Time, "00", "00");
            m3Time = dateObj.toLocaleTimeString("en-US", options2);
        }
        switch (reply.data.length) {
            case 3:
                mCard1.querySelector('.cardtitle').textContent = meeting1;
                mCard2.querySelector('.cardtitle').textContent = meeting2;
                mCard3.querySelector('.cardtitle').textContent = meeting3;
                mCard1.querySelector('.carddesc').textContent = m1Desc;
                mCard2.querySelector('.carddesc').textContent = m2Desc;
                mCard3.querySelector('.carddesc').textContent = m3Desc;
                mCard1.querySelector('.carddate').textContent = m1Date;
                mCard2.querySelector('.carddate').textContent = m2Date;
                mCard3.querySelector('.carddate').textContent = m3Date;
                mCard1.querySelector(".cardtime").textContent = m1Time;
                mCard2.querySelector(".cardtime").textContent = m2Time;
                mCard3.querySelector(".cardtime").textContent = m3Time;
                break;
            case 2:
                mCard1.querySelector('.cardtitle').textContent = meeting1;
                mCard2.querySelector('.cardtitle').textContent = meeting2;
                mCard3.querySelector('.cardtitle').textContent = "No more meetings!";
                mCard1.querySelector('.carddesc').textContent = m1Desc;
                mCard2.querySelector('.carddesc').textContent = m2Desc;
                mCard3.querySelector('.carddesc').textContent = "Check back later for new meetings!";
                mCard1.querySelector('.carddate').textContent = m1Date;
                mCard2.querySelector('.carddate').textContent = m2Date;
                mCard3.querySelector('.carddate').textContent = "N/A";
                mCard1.querySelector(".cardtime").textContent = m1Time;
                mCard2.querySelector(".cardtime").textContent = m2Time;
                mCard3.querySelector(".cardtime").textContent = "N/A";
                break;
            case 1:
                mCard1.querySelector('.cardtitle').textContent = meeting1;
                mCard2.querySelector('.cardtitle').textContent = "No more meetings!";
                mCard3.querySelector('.cardtitle').textContent = "No more meetings!";
                mCard1.querySelector('.carddesc').textContent = m1Desc;
                mCard2.querySelector('.carddesc').textContent = "Check back later for new meetings!";
                mCard3.querySelector('.carddesc').textContent = "Check back later for new meetings!";
                mCard1.querySelector('.carddate').textContent = m1Date;
                mCard2.querySelector('.carddate').textContent = "N/A";
                mCard3.querySelector('.carddate').textContent = "N/A";
                mCard1.querySelector(".cardtime").textContent = m1Time;
                mCard2.querySelector(".cardtime").textContent = "N/A";
                mCard3.querySelector(".cardtime").textContent = "N/A";
                break;
            case 0:
                mCard1.querySelector('.cardtitle').textContent = "No more meetings!";;
                mCard2.querySelector('.cardtitle').textContent = "No more meetings!";
                mCard3.querySelector('.cardtitle').textContent = "No more meetings!";
                mCard1.querySelector('.carddesc').textContent = "Check back later for new meetings!";
                mCard2.querySelector('.carddesc').textContent = "Check back later for new meetings!";
                mCard3.querySelector('.carddesc').textContent = "Check back later for new meetings!";
                mCard1.querySelector('.carddate').textContent = "N/A";
                mCard2.querySelector('.carddate').textContent = "N/A";
                mCard3.querySelector('.carddate').textContent = "N/A";
                mCard1.querySelector(".cardtime").textContent = "N/A";
                mCard2.querySelector(".cardtime").textContent = "N/A";
                mCard3.querySelector(".cardtime").textContent = "N/A";
                break;
            default:
                break;
        }  
    } else {
        alert("Loading meetings lead to an error: " + reply.error);
    }
}
async function populateEvents() {
    const request = await fetch('/members/events');
    const reply = await request.json();
    if (reply.success) {
        const event1 = reply.data[0]?.name || null;
        const event2 = reply.data[1]?.name || null;
        const e1Desc = reply.data[0]?.description || null;
        const e2Desc = reply.data[1]?.description || null;
        const e1Status = reply.data[0]?.active || null;
        const e2Status = reply.data[1]?.active || null;
        let e1sDate = reply.data[0]?.start_date || null;
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        if (e1sDate !== null) {
            const dateObj1 = new Date(e1sDate.replace(/-/g, '\/'));
            e1sDate = dateObj1.toLocaleDateString('en-US', options);
        }
        let e2sDate = reply.data[1]?.start_date || null;
        if (e2sDate !== null) {
            const dateObj2 = new Date(e2sDate.replace(/-/g, '\/'));
            e2sDate = dateObj2.toLocaleDateString('en-US', options);
        }
        let e1eDate = reply.data[0]?.end_date || null;
        if (e1eDate !== null) {
            const dateObj3 = new Date(e1eDate.replace(/-/g, '\/'));
            e1eDate = dateObj3.toLocaleDateString('en-US', options);
        }
        let e2eDate = reply.data[0]?.end_date || null;
        if (e2eDate !== null) {
            const dateObj4 = new Date(e2eDate.replace(/-/g, '\/'));
            e2eDate = dateObj4.toLocaleDateString('en-US', options);
        }
        const e1Img = reply.data[0]?.image || null;
        const e2Img = reply.data[1]?.image || null;
        const today = new Date().toISOString().split('T')[0];
        switch (reply.data.length) {
            case 2:
                eCard1.querySelector(".event-title").textContent = event1;
                eCard1.querySelector(".eventdesc").textContent = e1Desc;
                eCard1.querySelector(".event-start-date").textContent = "Started: " + e1sDate;
                if (e1eDate === null) {
                    eCard1.querySelector(".event-end-date").textContent = "Ending: N/A";
                    eCard1.querySelector(".event-status").textContent = e1Status ? "Active" : "Ended";
                } else {
                    if (e1eDate >= today) {
                        eCard1.querySelector(".event-end-date").textContent = "Ending: " + e1eDate;
                        eCard1.querySelector(".event-status").textContent = e1Status ? "Active" : "Ended";
                    } else {
                        eCard1.querySelector(".event-end-date").textContent = "Ended: " + e1eDate;
                        eCard1.querySelector(".event-status").textContent = e1Status ? "Active" : "Ended";
                    }
                }
                eCard1.querySelector(".eventimg").src = e1Img === null ? "https://images.pexels.com/photos/2882552/pexels-photo-2882552.jpeg" : e1Img;
                eCard2.querySelector(".event-title").textContent = event2;
                eCard2.querySelector(".eventdesc").textContent = e2Desc;
                eCard2.querySelector(".event-start-date").textContent = "Started: " + e2sDate;
                if (e2eDate === null) {
                    eCard2.querySelector(".event-end-date").textContent = "Ending: N/A";
                    eCard2.querySelector(".event-status").textContent = e2Status ? "Active" : "Ended";
                } else {
                    if (e2eDate >= today) {
                        eCard2.querySelector(".event-end-date").textContent = "Ending: " + e1eDate;
                        eCard2.querySelector(".event-status").textContent = e2Status ? "Active" : "Ended";
                    } else {
                        eCard2.querySelector(".event-end-date").textContent = "Ended: " + e1eDate;
                        eCard2.querySelector(".event-status").textContent = e2Status ? "Active" : "Ended";
                    }
                }
                eCard2.querySelector(".eventimg").src = e2Img === null ? "https://images.pexels.com/photos/2882552/pexels-photo-2882552.jpeg" : e2Img;
                break;
            case 1:
                eCard1.querySelector(".event-title").textContent = event1;
                eCard1.querySelector(".eventdesc").textContent = e1Desc;
                eCard1.querySelector(".event-start-date").textContent = "Started: " + e1sDate;
                if (e1eDate === null) {
                    eCard1.querySelector(".event-end-date").textContent = "Ending: N/A";
                    eCard1.querySelector(".event-status").textContent = e1Status ? "Active" : "Ended";
                } else {
                    if (e1eDate >= today) {
                        eCard1.querySelector(".event-end-date").textContent = "Ending: " + e1eDate;
                        eCard1.querySelector(".event-status").textContent = e1Status ? "Active" : "Ended";
                    } else {
                        eCard1.querySelector(".event-end-date").textContent = "Ended: " + e1eDate;
                        eCard1.querySelector(".event-status").textContent = e1Status ? "Active" : "Ended";
                    }
                }
                eCard1.querySelector(".eventimg").src = e1Img === null ? "https://images.pexels.com/photos/2882552/pexels-photo-2882552.jpeg" : e1Img;
                eCard2.querySelector(".event-title").textContent = "No event/workshops!";
                eCard2.querySelector(".eventdesc").textContent = "Check back later for new workshops!";
                eCard2.querySelector(".event-start-date").textContent = "Started: N/A";
                eCard2.querySelector(".event-end-date").textContent = "Ended: N/A";
                eCard2.querySelector(".event-status").textContent = "N/A";
                eCard2.querySelector(".eventimg").src = "https://images.pexels.com/photos/2882552/pexels-photo-2882552.jpeg";
                break;
            case 0:
                eCard1.querySelector(".event-title").textContent = "No event/workshops!";
                eCard1.querySelector(".eventdesc").textContent = "Check back later for new workshops!";
                eCard1.querySelector(".event-start-date").textContent = "Started: N/A";
                eCard1.querySelector(".event-end-date").textContent = "Ended: N/A";
                eCard1.querySelector(".event-status").textContent = "N/A";
                eCard1.querySelector(".eventimg").src = "https://images.pexels.com/photos/2882552/pexels-photo-2882552.jpeg";
                eCard2.querySelector(".event-title").textContent = "No event/workshops!";
                eCard2.querySelector(".eventdesc").textContent = "Check back later for new workshops!";
                eCard2.querySelector(".event-start-date").textContent = "Started: N/A";
                eCard2.querySelector(".event-end-date").textContent = "Ended: N/A";
                eCard2.querySelector(".event-status").textContent = "N/A";
                eCard2.querySelector(".eventimg").src = "https://images.pexels.com/photos/2882552/pexels-photo-2882552.jpeg";
                break;
            default:
                break;
        }
    } else {
        alert('Error loading events: ' + reply.error);
    }
}
async function populateProjects() {
    let memberName = localStorage.getItem('name');
    memberName.replace(/ /g, '%20');
    const request = await fetch(`/members/projects?member=${memberName}`);
    const reply = await request.json();
    if (reply.success) {
        const p1Name = reply.data[0]?.name || null;
        const p2Name = reply.data[1]?.name || null;
        const p1Desc = reply.data[0]?.description || null;
        const p2Desc = reply.data[1]?.description || null;
        const p1Tags = reply.data[0]?.tags || null;
        const p2Tags = reply.data[1]?.tags || null;
        switch (reply.data.length) {
            case 2:
                pCard1.querySelector(".project-title").innerHTML = p1Name;
                pCard2.querySelector(".project-title").innerHTML = p2Name;
                pCard1.querySelector(".projectdesc").innerHTML = p1Desc;
                pCard2.querySelector(".projectdesc").innerHTML = p2Desc;
                break;
            case 1:
                pCard1.querySelector(".project-title").innerHTML = p1Name;
                pCard2.querySelector(".project-title").innerHTML = "No project yet!";
                pCard1.querySelector(".projectdesc").innerHTML = p1Desc;
                pCard2.querySelector(".projectdesc").innerHTML = "Submit a project for it to show up here, or contact an admin to add an existing project";
                break;
            case 0:
                pCard1.querySelector(".project-title").innerHTML = "No project yet!";
                pCard2.querySelector(".project-title").innerHTML = "No project yet!";
                pCard1.querySelector(".projectdesc").innerHTML = "Submit a project for it to show up here, or contact an admin to add an existing project";
                pCard2.querySelector(".projectdesc").innerHTML = "Submit a project for it to show up here, or contact an admin to add an existing project";
                break;
            default:
                break;
        }
    } else {
        alert("Error loading projects: " + reply.error);
    }
}