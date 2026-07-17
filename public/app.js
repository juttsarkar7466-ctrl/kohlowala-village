window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
        document.getElementById('themeBtn').innerHTML = "☀️ Light";
    }
    renderSite();
    setInterval(loadChatMessages, 4000); // 4 Seconds lag-free chat pipeline
});

function toggleDarkMode() {
    const body = document.body;
    body.classList.toggle('dark-theme');
    const themeBtn = document.getElementById('themeBtn');
    themeBtn.innerHTML = body.classList.contains('dark-theme') ? "☀️ Light" : "🌙 Dark";
    localStorage.setItem('theme', body.classList.contains('dark-theme') ? 'dark' : 'light');
}

async function fetchAPI(endpoint) {
    try { const res = await fetch(`/api/${endpoint}`); return await res.json(); }
    catch (err) { console.error(`Error context ${endpoint}:`, err); return []; }
}

// ---------------------- CORE SITE RENDERING ENGINE ----------------------
async function renderSite() {
    // Ticker Notice
    const noticeData = await fetchAPI('notice');
    document.getElementById('liveNotice').innerText = noticeData.notice || "Welcome to Kohlowala Portal";

    // Photo Gallery
    const photos = await fetchAPI('gallery');
    const galDiv = document.getElementById('galleryContainer');
    galDiv.innerHTML = photos.length === 0 ? '<p>Gallery khali hai.</p>' : '';
    photos.forEach(p => {
        galDiv.innerHTML += `<div class="store-card"><div class="store-img" style="background-image: url('${p.imgUrl}'); height:230px;"></div><div class="store-info"><h4>${p.title}</h4></div></div>`;
    });

    // Masajid Panel Rendering
    const masjids = await fetchAPI('masjids');
    const masDiv = document.getElementById('masjidContainer');
    masDiv.innerHTML = masjids.length === 0 ? '<p>Koi Masjid data mapped nahi hai.</p>' : '';
    masjids.forEach(m => {
        masDiv.innerHTML += `
            <div class="info-card" style="border-left-color: var(--primary);">
                <div style="display:flex; justify-content:between; align-items:center; flex-wrap:wrap; gap:10px;">
                    <h3>🕌 ${m.name}</h3>
                    <span class="badge-gender">Juma: ${m.juma}</span>
                </div>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap:5px; margin:10px 0; font-size:13px; text-align:center;">
                    <div style="background:var(--body-bg); padding:5px; border-radius:4px;"><b>Fajar</b><br>${m.fajar}</div>
                    <div style="background:var(--body-bg); padding:5px; border-radius:4px;"><b>Zuhar</b><br>${m.zuhar}</div>
                    <div style="background:var(--body-bg); padding:5px; border-radius:4px;"><b>Asar</b><br>${m.asar}</div>
                    <div style="background:var(--body-bg); padding:5px; border-radius:4px;"><b>Maghrib</b><br>${m.maghrib}</div>
                    <div style="background:var(--body-bg); padding:5px; border-radius:4px;"><b>Isha</b><br>${m.isha}</div>
                </div>
                ${m.elaan ? `<div style="background:rgba(217,83,79,0.1); color:var(--danger); padding:8px; border-radius:4px; font-size:13px; border-left:3px solid var(--danger)"><strong>📢 Elaan:</strong> ${m.elaan}</div>` : ''}
            </div>`;
    });

    // Dairies Table Rendering
    const dairies = await fetchAPI('dairies');
    const dbt = document.getElementById('dairyTable').getElementsByTagName('tbody')[0];
    dbt.innerHTML = '';
    dairies.forEach(d => {
        dbt.innerHTML += `<tr><td><strong>${d.name}</strong></td><td><span class="badge-blood">${d.milk}</span></td><td><span class="badge-gender">${d.khoya}</span></td><td>${d.morning}</td><td>${d.evening}</td></tr>`;
    });

    // Carpool Rendering
    const carpools = await fetchAPI('carpools');
    const cpDiv = document.getElementById('carpoolContainer');
    cpDiv.innerHTML = carpools.length === 0 ? '<p>Abhi koi active lift available nahi hai.</p>' : '';
    carpools.forEach(c => {
        cpDiv.innerHTML += `
            <div class="info-card" style="border-left-color: var(--accent);">
                <h4>📍 ${c.route}</h4>
                <p style="font-size:14px; margin:5px 0;">🚗 Gari: <b>${c.vehicle}</b> | ⏰ Time: <b>${c.time}</b></p>
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:5px;">
                    <small>Driver: <b>${c.driver}</b> (${c.seats} Gunjaish)</small>
                    <a href="https://wa.me/${c.contact.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-wa" style="padding:4px 8px; font-size:12px;">Lift Lain</a>
                </div>
            </div>`;
    });

    // Emergency Contacts
    const emes = await fetchAPI('emergency');
    const emt = document.getElementById('emergencyTable').getElementsByTagName('tbody')[0];
    emt.innerHTML = '';
    emes.forEach(e => {
        emt.innerHTML += `<tr><td><strong>${e.name}</strong></td><td><span class="badge-gender">${e.role}</span></td><td><a href="tel:${e.contact}" class="btn" style="padding:4px 10px; background-color:var(--danger)">📞 Call</a></td></tr>`;
    });

    // Kisaan OLX Ads
    const ads = await fetchAPI('olx');
    const olxDiv = document.getElementById('olxContainer');
    olxDiv.innerHTML = ads.length === 0 ? '<p>Bazaar khali hai.</p>' : '';
    ads.forEach(ad => {
        olxDiv.innerHTML += `<div class="info-card" style="border-left-color: var(--accent);"><div style="display:flex; justify-content:space-between;"><h4>${ad.title}</h4><span class="badge-blood">${ad.price}</span></div><p style="font-size:13px; margin:5px 0;">${ad.desc}</p><small>By: <b>${ad.owner}</b></small><div style="margin-top:8px;"><a href="https://wa.me/${ad.contact.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-wa" style="padding:4px 8px; font-size:12px;">WhatsApp</a></div></div>`;
    });

    // Poll Engine Setup
    const poll = await fetchAPI('polls');
    document.getElementById('pollQuestion').innerText = poll.question;
    document.getElementById('yesCount').innerText = poll.yesVotes || 0;
    document.getElementById('noCount').innerText = poll.noVotes || 0;

    loadChatMessages();
}

// Chatroom Runtime
async function loadChatMessages() {
    const messages = await fetchAPI('chat');
    const chatBox = document.getElementById('chatBox');
    if (!chatBox) return;
    chatBox.innerHTML = '';
    messages.reverse().forEach(m => {
        chatBox.innerHTML += `<p style="margin-bottom:6px; font-size:14px;"><strong>${m.username}:</strong> <span>${m.msg}</span></p>`;
    });
}

async function sendChatMessage() {
    const username = document.getElementById('chatUser').value || "Pindwasi";
    const msg = document.getElementById('chatMsg').value;
    if (!msg) return;
    await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, msg }) });
    document.getElementById('chatMsg').value = ''; loadChatMessages();
}

async function castVote(voteType) {
    const res = await fetch('/api/polls/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: voteType }) });
    const updated = await res.json();
    document.getElementById('yesCount').innerText = updated.yesVotes;
    document.getElementById('noCount').innerText = updated.noVotes;
    alert("Vote Registered!");
}

async function submitCarpool(e) {
    e.preventDefault();
    await fetch('/api/carpools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            driver: document.getElementById('cDriver').value, vehicle: document.getElementById('cVehicle').value,
            route: document.getElementById('cRoute').value, time: document.getElementById('cTime').value,
            seats: document.getElementById('cSeats').value, contact: document.getElementById('cContact').value
        })
    });
    alert("Lift Offer Uploaded!"); e.target.reset(); renderSite();
}

async function submitOlx(e) {
    e.preventDefault();
    await fetch('/api/olx', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: document.getElementById('oTitle').value, price: document.getElementById('oPrice').value, owner: document.getElementById('oOwner').value, contact: document.getElementById('oContact').value, desc: document.getElementById('oDesc').value }) });
    alert("Ad Live!"); e.target.reset(); renderSite();
}

// ---------------------- ADMIN LOGIC CONTROL PANEL ----------------------
function loginAdmin() {
    const email = prompt("Admin Gmail:");
    if (email === "Juttsarkar7466@gmail.com") {
        if (prompt("Admin Password:") === 'ZAQ!"wsx£$RFVCDE') {
            document.getElementById('adminPanel').style.display = "block";
            renderAdminLists();
            document.getElementById('adminPanel').scrollIntoView();
        } else alert("Invalid Password!");
    } else alert("Unauthorized Access!");
}
function logoutAdmin() { document.getElementById('adminPanel').style.display = "none"; }

async function addMasjidRecord() {
    await fetch('/api/masjids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: document.getElementById('adMName').value, fajar: document.getElementById('adMFaj').value, zuhar: document.getElementById('adMZuh').value, asar: document.getElementById('adMAsr').value, maghrib: document.getElementById('adMMag').value, isha: document.getElementById('adMIsh').value, juma: document.getElementById('adMJum').value, elaan: document.getElementById('adMElaan').value })
    });
    alert("Masjid Details Synced!"); renderSite(); renderAdminLists();
}

async function addDairyRecord() {
    await fetch('/api/dairies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: document.getElementById('adDName').value, milk: document.getElementById('adDMilk').value, khoya: document.getElementById('adDKhoya').value, morning: document.getElementById('adDMorn').value, evening: document.getElementById('adDEve').value })
    });
    alert("Dairy Rates Logged!"); renderSite(); renderAdminLists();
}

async function addGalleryPhoto() {
    await fetch('/api/gallery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: document.getElementById('admGalTitle').value, imgUrl: document.getElementById('admGalUrl').value }) });
    alert("Photo Uploaded!"); renderSite(); renderAdminLists();
}

async function startNewPoll() {
    await fetch('/api/admin/polls', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: document.getElementById('admPollQuestion').value }) });
    alert("Poll Activated!"); renderSite();
}

async function renderAdminLists() {
    const setupAdminDelList = async (endpoint, elementId) => {
        const items = await fetchAPI(endpoint);
        const tbl = document.getElementById(elementId);
        tbl.innerHTML = '';
        items.forEach(i => {
            tbl.innerHTML += `<tr><td>${i.name || i.title || i.route || 'Log'}</td><td><button class="admin-btn-del" onclick="deleteItem('${endpoint}','${i._id}')">Delete</button></td></tr>`;
        });
    };
    setupAdminDelList('masjids', 'admListMasjids');
    setupAdminDelList('dairies', 'admListDairies');
    setupAdminDelList('carpools', 'admListCarpools');
    setupAdminDelList('gallery', 'admListGallery');
    setupAdminDelList('olx', 'admListOlx');
}

async function deleteItem(collection, id) {
    await fetch(`/api/admin/${collection}/${id}`, { method: 'DELETE' });
    renderSite(); renderAdminLists();
}
