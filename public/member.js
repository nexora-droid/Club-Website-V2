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
    } else {
        window.location.href = "/404";
    }
    populateAnnouncements();
})
const mCard1 = document.getElementById('meetingCard1');
const mCard2 = document.getElementById('meetingCard2');
const mCard3 = document.getElementById('meetingCard3');
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
                break;
            default:
                break;
        }  
    } else {
        alert("Loading events lead to an error: " + reply.error);
    }
}
async function populateEvents() {
    
}