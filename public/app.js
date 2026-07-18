window.addEventListener('DOMContentLoaded', () => {
    fetchMandiRates();
    loadMainRegistry();
    setInterval(loadMainRegistry, 5000); // Reactive update matrix
});

async function fetchMandiRates() {
    try {
        const res = await fetch('/api/live-mandi');
        const data = await res.json();
        const container = document.getElementById('mandiRatesList');
        container.innerHTML = '';
        data.forEach(item => {
            container.innerHTML += `<tr><td><b>${item.crop}</b></td><td>${item.gov}</td><td><span style="color:var(--primary); font-weight:bold;">${item.market}</span></td></tr>`;
        });
    } catch(err) { console.log("Mandi stream down."); }
}

async function loadMainRegistry() {
    try {
        const res = await fetch('/api/records');
        const items = await res.json();
        processLayoutRender(items);
    } catch(err) { console.log("Registry pipe block."); }
}

function processLayoutRender(records) {
    const market = document.getElementById('marketplaceList');
    const doctors = document.getElementById('doctorsList');
    const blood = document.getElementById('bloodDonorsList');
    const chat = document.getElementById('chatBox');
    const adminPanel = document.getElementById('adminActionConsole');

    // Wipe states
    market.innerHTML = ''; doctors.innerHTML = ''; blood.innerHTML = ''; chat.innerHTML = ''; adminPanel.innerHTML = '';

    records.forEach(record => {
        const id = record._id;
        const d = record.data;

        if (record.type === 'marketplace') {
            market.innerHTML += `<div class="store-card" style="padding:15px; background:rgba(0,0,0,0.2);"><h4 style="color:var(--primary);">${d.item}</h4><b style="color:var(--accent);">${d.price}</b><p style="font-size:13px; color:var(--text-muted); margin:5px 0;">${d.desc}</p><a href="https://wa.me/${d.contact.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-wa" style="padding:4px 8px; font-size:12px; display:inline-block; text-decoration:none;">Contact Seller</a></div>`;
        }
        else if (record.type === 'doctor') {
            doctors.innerHTML += `<div class="info-card" style="border-left:4px solid var(--accent); margin-bottom:10px; padding:12px;"><h4 style="color:#fff;">${d.name}</h4><small style="color:var(--text-muted);">Timings: ${d.time} | Fees: <b>${d.fees}</b></small><br><a href="tel:${d.contact}" class="btn" style="padding:3px 8px; font-size:12px; background:var(--primary);">Call Appointment</a></div>`;
        }
        else if (record.type === 'blood') {
            blood.innerHTML += `<div class="info-card" style="border-left:4px solid var(--danger); margin-bottom:10px; padding:10px; display:flex; justify-content:space-between; align-items:center;"><div><strong>${d.name}</strong> <span style="background:var(--danger); color:white; padding:2px 6px; border-radius:4px; font-size:12px; margin-left:8px;">${d.group}</span></div><a href="https://wa.me/${d.contact.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-wa" style="padding:3px 8px; font-size:12px; text-decoration:none;">Contact</a></div>`;
        }
        else if (record.type === 'chat') {
            chat.innerHTML += `<p style="font-size:14px; margin-bottom:6px; border-bottom:1px solid rgba(255,255,255,0.02); padding-bottom:3px;"><strong style="color:var(--primary);">${d.user}:</strong> <span>${d.msg}</span></p>`;
        }

        // Admin interface generation mapping
        if(document.getElementById('adminPanel').style.display === 'block') {
            adminPanel.innerHTML += `<tr><td><b>[${record.type.toUpperCase()}]</b> ${d.item || d.name || d.user || 'Entry'}</td><td><button class="admin-btn-del" onclick="deleteRegistryItem('${id}')">Ban User / Erase</button></td></tr>`;
        }
    });
}

// Submissions Pipeline Handling
async function submitMarketplace(e) {
    e.preventDefault();
    await fetch('/api/records', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ type: 'marketplace', data: { item: document.getElementById('mkItem').value, price: document.getElementById('mkPrice').value, contact: document.getElementById('mkContact').value, desc: document.getElementById('mkDesc').value } })
    });
    alert("Marketplace listing added successfully!"); e.target.reset(); loadMainRegistry();
}

async function submitDoctor(e) {
    e.preventDefault();
    await fetch('/api/records', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ type: 'doctor', data: { name: document.getElementById('docName').value, time: document.getElementById('docTime').value, fees: document.getElementById('docFees').value, contact: document.getElementById('docContact').value } })
    });
    alert("Doctor schedule logged into registry!"); e.target.reset(); loadMainRegistry();
}

async function submitBlood(e) {
    e.preventDefault();
    await fetch('/api/records', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ type: 'blood', data: { name: document.getElementById('blName').value, group: document.getElementById('blGroup').value, contact: document.getElementById('blContact').value } })
    });
    alert("You have been listed as an emergency blood donor!"); e.target.reset(); loadMainRegistry();
}

async function sendChat() {
    const user = document.getElementById('chUser').value || "Pindwasi";
    const msg = document.getElementById('chMsg').value;
    if(!msg) return;
    await fetch('/api/records', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ type: 'chat', data: { user, msg } })
    });
    document.getElementById('chMsg').value = ''; loadMainRegistry();
}

async function submitComplaint(e) {
    e.preventDefault();
    await fetch('/api/records', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ type: 'complaint', data: { cat: document.getElementById('cpCat').value, desc: document.getElementById('cpDesc').value } })
    });
    alert("Complaint routed safely to administration desk."); e.target.reset(); loadMainRegistry();
}

async function deleteRegistryItem(id) {
    if(confirm("Are you sure you want to ban/delete this item record completely?")) {
        await fetch(`/api/records/${id}`, { method: 'DELETE' });
        loadMainRegistry();
    }
}

function loginAdmin() {
    const email = prompt("Admin System ID:");
    if(email === "Juttsarkar7466@gmail.com") {
        if(prompt("Secure Passcode Token:") === 'ZAQ!"wsx£$RFVCDE') {
            document.getElementById('adminPanel').style.display = "block";
            loadMainRegistry();
            document.getElementById('adminPanel').scrollIntoView({ behavior: 'smooth' });
        }
    }
}
function logoutAdmin() {
    document.getElementById('adminPanel').style.display = "none";
}
