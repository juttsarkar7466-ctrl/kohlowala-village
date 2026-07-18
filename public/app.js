window.addEventListener('DOMContentLoaded', () => {
    fetchMandiRates();
    loadCoreDataPipeline();
    setInterval(loadCoreDataPipeline, 5000); 
});

async function fetchMandiRates() {
    try {
        const res = await fetch('/api/live-mandi');
        const list = await res.json();
        const box = document.getElementById('mandiContainer');
        box.innerHTML = '';
        list.forEach(i => {
            box.innerHTML += `<tr><td><b>${i.crop}</b></td><td>${i.gov}</td><td><span style="color:var(--primary); font-weight:700;">${i.market}</span></td></tr>`;
        });
    } catch(err) { console.log("Mandi stream down."); }
}

async function loadCoreDataPipeline() {
    try {
        const res = await fetch('/api/hub');
        const elements = await res.json();
        renderLayoutLayers(elements);
    } catch(err) { console.log("Data error."); }
}

function renderLayoutLayers(logs) {
    const cricketPublic = document.getElementById('cricketMatchesPublicList');
    const cricketAdmin = document.getElementById('adminCricketApprovalQueue');
    const market = document.getElementById('marketplaceList');
    const carpool = document.getElementById('carpoolContainer');
    const chat = document.getElementById('chatBox');
    const adminSheet = document.getElementById('adminActionRegistrySheet');
    
    cricketPublic.innerHTML = ''; cricketAdmin.innerHTML = ''; market.innerHTML = ''; 
    carpool.innerHTML = ''; chat.innerHTML = ''; adminSheet.innerHTML = '';

    logs.forEach(record => {
        const id = record._id;
        const d = record.data;

        // 1. CRICKET REGISTRY INTERFACE
        if (record.type === 'cricket') {
            if (d.status === 'approved') {
                cricketPublic.innerHTML += `
                    <div class="info-card" style="border-left:4px solid var(--primary); margin-bottom:12px; padding:15px;">
                        <h4 style="color:var(--accent); font-size:18px;">🏏 ${d.teamA} VS ${d.teamB}</h4>
                        <p style="font-size:13px; margin:4px 0; color:var(--text-muted);">🗓️ Timing: <b>${d.time}</b> | 📍 Ground: <b>${d.ground}</b></p>
                        <a href="tel:${d.contact}" class="btn" style="padding:4px 10px; font-size:11px;">Contact Organizer</a>
                    </div>`;
            } else if (d.status === 'pending' && document.getElementById('adminPanel').style.display === 'block') {
                cricketAdmin.innerHTML += `
                    <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
                        <div><strong>${d.teamA} vs ${d.teamB}</strong><br><small>${d.time} | ${d.ground}</small></div>
                        <button class="btn-approve" onclick="approveCricketMatch('${id}')">Approve Match</button>
                    </div>`;
            }
        }
        // 2. OTHER SYSTEM ELEMENTS
        else if (record.type === 'marketplace') {
            market.innerHTML += `<div class="store-card" style="padding:15px;"><h4>${d.item}</h4><b style="color:var(--accent);">${d.price}</b><p style="font-size:12px;">${d.desc}</p><a href="https://wa.me/${d.contact.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-wa" style="padding:4px 8px; font-size:11px; text-decoration:none;">WhatsApp</a></div>`;
        }
        else if (record.type === 'carpool') {
            carpool.innerHTML += `<div class="info-card" style="border-left-color:var(--primary);"><h4>📍 Rasta: ${d.route}</h4><small>Seats: ${d.seats} | Time: ${d.time}</small><br><a href="https://wa.me/${d.contact.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-wa" style="padding:3px 8px; font-size:11px; text-decoration:none; margin-top:5px;">Book Lift</a></div>`;
        }
        else if (record.type === 'chat') {
            chat.innerHTML += `<p style="font-size:14px; margin-bottom:4px;"><strong style="color:var(--primary);">${d.user}:</strong> ${d.msg}</p>`;
        }

        if (document.getElementById('adminPanel').style.display === 'block') {
            adminSheet.innerHTML += `<tr><td><b>[${record.type.toUpperCase()}]</b> ${d.item || d.teamA || d.user || 'Registry Log'}</td><td><button class="admin-btn-del" onclick="purgeRegistryItem('${id}')">Delete / Ban</button></td></tr>`;
        }
    });
}

async function pushPostRequest(type, data) {
    await fetch('/api/hub', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ type, data }) });
    loadCoreDataPipeline();
}

// User Submission for Cricket
function submitCricketMatch(e) {
    e.preventDefault();
    pushPostRequest('cricket', {
        teamA: document.getElementById('ckTeamA').value,
        teamB: document.getElementById('ckTeamB').value,
        time: document.getElementById('ckDateTime').value,
        ground: document.getElementById('ckGround').value,
        contact: document.getElementById('ckContact').value,
        status: 'pending' // Enforces admin approval requirement
    });
    e.target.reset();
    alert("Match schedule submitted successfully! It will show up after admin verification.");
}

// Admin Match Approval Action Trigger
async function approveCricketMatch(id) {
    await fetch(`/api/hub/approve/${id}`, { method: 'PUT' });
    alert("Cricket Match Live On Village Board!");
    loadCoreDataPipeline();
}

function submitMarketplace(e) {
    e.preventDefault();
    pushPostRequest('marketplace', { item: document.getElementById('mkItem').value, price: document.getElementById('mkPrice').value, contact: document.getElementById('mkContact').value, desc: document.getElementById('mkDesc').value });
    e.target.reset();
}

function submitCarpool(e) {
    e.preventDefault();
    pushPostRequest('carpool', { route: document.getElementById('cpRoute').value, vehicle: document.getElementById('cpVehicle').value, time: document.getElementById('cpTime').value, seats: document.getElementById('cpSeats').value, contact: document.getElementById('cpContact').value });
    e.target.reset();
}

function sendChat() {
    const user = document.getElementById('chUser').value || "Pindwasi";
    const msg = document.getElementById('chMsg').value;
    if(!msg) return;
    pushPostRequest('chat', { user, msg });
    document.getElementById('chMsg').value = '';
}

async function purgeRegistryItem(id) {
    if(confirm("Delete this entry entirely?")) {
        await fetch(`/api/hub/${id}`, { method: 'DELETE' });
        loadCoreDataPipeline();
    }
}

function loginAdmin() {
    if(prompt("Admin ID:") === "Juttsarkar7466@gmail.com") {
        if(prompt("Passcode:") === 'ZAQ!"wsx£$RFVCDE') {
            document.getElementById('adminPanel').style.display = "block";
            loadCoreDataPipeline();
        }
    }
}
function logoutAdmin() { document.getElementById('adminPanel').style.display = "none"; }
