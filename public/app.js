window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
        document.getElementById('themeBtn').innerHTML = "☀️ Light Mode";
    }
    renderSite();
    // Chatroom interval configuration (Auto-Refresh Every 4 seconds)
    setInterval(loadChatMessages, 4000);
});

function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-theme');
    const themeBtn = document.getElementById('themeBtn');
    if (body.classList.contains('dark-theme')) {
        themeBtn.innerHTML = "☀️ Light Mode";
        localStorage.setItem('theme', 'dark');
    } else {
        themeBtn.innerHTML = "🌙 Dark Mode";
        localStorage.setItem('theme', 'light');
    }
}

async function fetchAPI(endpoint) {
    try { const res = await fetch(`/api/${endpoint}`); return await res.json(); }
    catch (err) { console.error(`Error ${endpoint}:`, err); return []; }
}

// ---------------------- RENDER CORE ENGINE ----------------------
async function renderSite() {
    // 1. Ticker Notice
    const noticeData = await fetchAPI('notice');
    document.getElementById('liveNotice').innerText = noticeData.notice || "Welcome to Kohlowala Portal";

    // 2. Photo Gallery (Admin uploads, Users view)
    const photos = await fetchAPI('gallery');
    const galDiv = document.getElementById('galleryContainer');
    galDiv.innerHTML = photos.length === 0 ? '<p>Gallery khali hai.</p>' : '';
    photos.forEach(p => {
        galDiv.innerHTML += `
            <div class="store-card">
                <div class="store-img" style="background-image: url('${p.imgUrl}'); height:250px;"></div>
                <div class="store-info"><h4>${p.title}</h4></div>
            </div>`;
    });

    // 3. Emergency Directory
    const emes = await fetchAPI('emergency');
    const emt = document.getElementById('emergencyTable').getElementsByTagName('tbody')[0];
    emt.innerHTML = '';
    emes.forEach(e => {
        emt.innerHTML += `<tr><td><strong>${e.name}</strong></td><td><span class="badge-gender">${e.role}</span></td><td><a href="tel:${e.contact}" class="btn" style="padding:4px 10px; background-color:var(--danger)">📞 Call Now</a></td></tr>`;
    });

    // 4. Kisaan OLX
    const ads = await fetchAPI('olx');
    const olxDiv = document.getElementById('olxContainer');
    olxDiv.innerHTML = ads.length === 0 ? '<p>Bazaar mein abhi koi samaan nahi hai.</p>' : '';
    ads.forEach(ad => {
        olxDiv.innerHTML += `
            <div class="info-card" style="border-left-color: var(--accent);">
                <div style="display:flex; justify-content:space-between;"><h4>${ad.title}</h4><span class="badge-blood">${ad.price}</span></div>
                <p style="font-size:14px; margin:5px 0;">${ad.desc}</p>
                <small>Bechne Wala: <strong>${ad.owner}</strong></small>
                <div style="margin-top:10px;"><a href="https://wa.me/${ad.contact.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-wa" style="padding:4px 8px; font-size:12px;">WhatsApp Contact</a></div>
            </div>`;
    });

    // 5. Panchayat Voting Polls Tracker
    const poll = await fetchAPI('polls');
    document.getElementById('pollQuestion').innerText = poll.question;
    document.getElementById('yesCount').innerText = poll.yesVotes || 0;
    document.getElementById('noCount').innerText = poll.noVotes || 0;

    // 6. Events Calendar
    const evts = await fetchAPI('events');
    const evtTbl = document.getElementById('eventsTable').getElementsByTagName('tbody')[0];
    evtTbl.innerHTML = '';
    evts.forEach(ev => {
        evtTbl.innerHTML += `<tr><td><strong>${ev.title}</strong></td><td><span class="badge-gender">${ev.date}</span></td><td>${ev.location}</td></tr>`;
    });

    // 7. Hunar Directory
    const hunars = await fetchAPI('hunar');
    const hnt = document.getElementById('hunarTable').getElementsByTagName('tbody')[0];
    hnt.innerHTML = '';
    hunars.forEach(h => {
        hnt.innerHTML += `<tr><td><strong>${h.name}</strong></td><td><span class="badge-blood">${h.skill}</span></td><td><a href="https://wa.me/${h.contact.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-wa" style="padding:4px 8px; font-size:12px;">Contact</a></td></tr>`;
    });

    // 8. Job Board Tracker
    const jobs = await fetchAPI('jobs');
    const jbt = document.getElementById('jobsTable').getElementsByTagName('tbody')[0];
    jbt.innerHTML = '';
    jobs.forEach(j => {
        jbt.innerHTML += `<tr><td><strong>${j.title}</strong></td><td>${j.company}</td><td><span class="badge-gender">${j.salary}</span></td><td><a href="https://wa.me/${j.contact.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-wa" style="padding:4px 8px; font-size:12px;">Apply</a></td></tr>`;
    });

    // 9. Committee Tracker
    const comms = await fetchAPI('committees');
    const cmt = document.getElementById('committeeTable').getElementsByTagName('tbody')[0];
    cmt.innerHTML = '';
    comms.forEach(c => {
        cmt.innerHTML += `<tr><td><strong>${c.name}</strong></td><td><span class="badge-blood">${c.total}</span></td><td>${c.monthly}</td><td><span class="badge-gender">${c.winner || 'Pending'}</span></td></tr>`;
    });

    loadChatMessages();
}

// 💬 Chatroom Live Reloader Logic
async function loadChatMessages() {
    const messages = await fetchAPI('chat');
    const chatBox = document.getElementById('chatBox');
    if (!chatBox) return;
    chatBox.innerHTML = '';
    messages.reverse().forEach(m => {
        chatBox.innerHTML += `<p style="margin-bottom:8px;"><strong>${m.username}:</strong> <span style="opacity:0.9;">${m.msg}</span></p>`;
    });
}

async function sendChatMessage() {
    const username = document.getElementById('chatUser').value || "Gumnaam Pindwasi";
    const msg = document.getElementById('chatMsg').value;
    if (!msg) return;
    await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, msg })
    });
    document.getElementById('chatMsg').value = '';
    loadChatMessages();
}

// 🗳️ Vote Cast Engine
async function castVote(voteType) {
    const res = await fetch('/api/polls/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: voteType })
    });
    const updatedPoll = await res.json();
    document.getElementById('yesCount').innerText = updatedPoll.yesVotes;
    document.getElementById('noCount').innerText = updatedPoll.noVotes;
    alert("Aapka Vote Record Ho Gaya!");
}

// 🛒 Kisaan OLX submission
async function submitOlx(e) {
    e.preventDefault();
    await fetch('/api/olx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: document.getElementById('oTitle').value,
            price: document.getElementById('oPrice').value,
            owner: document.getElementById('oOwner').value,
            contact: document.getElementById('oContact').value,
            desc: document.getElementById('oDesc').value
        })
    });
    alert("Ad Bazaar mein live ho gaya!");
    renderSite();
}

// 🛠️ Hunar Submit
async function submitHunar(e) {
    e.preventDefault();
    await fetch('/api/hunar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: document.getElementById('hName').value, skill: document.getElementById('hSkill').value, contact: document.getElementById('hContact').value })
    });
    alert("Hunar register ho gaya!");
    renderSite();
}

// ---------------------- ADMIN DASHBOARD WRITERS ----------------------
function loginAdmin() {
    const email = prompt("Admin Gmail:");
    if (email === "Juttsarkar7466@gmail.com") {
        if (prompt("Admin Password:") === 'ZAQ!"wsx£$RFVCDE') {
            document.getElementById('adminPanel').style.display = "block";
            renderAdminLists();
            document.getElementById('adminPanel').scrollIntoView();
        } else alert("Wrong Password!");
    } else alert("Wrong Identity!");
}
function logoutAdmin() { document.getElementById('adminPanel').style.display = "none"; }

async function addGalleryPhoto() {
    await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: document.getElementById('admGalTitle').value, imgUrl: document.getElementById('admGalUrl').value })
    });
    alert("Photo live successfully!"); renderSite(); renderAdminLists();
}

async function startNewPoll() {
    await fetch('/api/admin/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: document.getElementById('admPollQuestion').value })
    });
    alert("New Panchayat Poll Launched!"); renderSite();
}

async function addEmergencyContact() {
    await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: document.getElementById('admEmeName').value, role: document.getElementById('admEmeRole').value, contact: document.getElementById('admEmeContact').value })
    });
    alert("Emergency contact loaded!"); renderSite(); renderAdminLists();
}

async function addCalendarEvent() {
    await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: document.getElementById('admEvtTitle').value, date: document.getElementById('admEvtDate').value, location: document.getElementById('admEvtLoc').value })
    });
    alert("Event Scheduled!"); renderSite(); renderAdminLists();
}

async function addNewJob() {
    await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: document.getElementById('admJobTitle').value, company: document.getElementById('admJobComp').value, salary: document.getElementById('admJobSal').value, contact: document.getElementById('admJobCont').value })
    });
    alert("Job Posted!"); renderSite(); renderAdminLists();
}

async function addCommitteeRecord() {
    await fetch('/api/committees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: document.getElementById('admComName').value, total: document.getElementById('admComTotal').value, monthly: document.getElementById('admComMonth').value, winner: document.getElementById('admComWin').value })
    });
    alert("Committee Logged!"); renderSite(); renderAdminLists();
}

async function renderAdminLists() {
    const setupAdminDelList = async (endpoint, elementId) => {
        const items = await fetchAPI(endpoint);
        const tbl = document.getElementById(elementId);
        tbl.innerHTML = '';
        items.forEach(i => {
            tbl.innerHTML += `<tr><td>${i.title || i.name || i.question || 'Item'}</td><td><button class="admin-btn-del" onclick="deleteItem('${endpoint}','${i._id}')">Remove</button></td></tr>`;
        });
    };
    setupAdminDelList('gallery', 'admListGallery');
    setupAdminDelList('emergency', 'admListEmergency');
    setupAdminDelList('olx', 'admListOlx');
    setupAdminDelList('events', 'admListEvents');
    setupAdminDelList('jobs', 'admListJobs');
    setupAdminDelList('committees', 'admListCommittees');
}

async function deleteItem(collection, id) {
    await fetch(`/api/admin/${collection}/${id}`, { method: 'DELETE' });
    renderSite(); renderAdminLists();
}
