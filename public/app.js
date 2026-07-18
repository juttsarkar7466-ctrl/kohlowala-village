window.addEventListener('DOMContentLoaded', () => {
    fetchMandiRates();
    loadCoreDataPipeline();
    setInterval(loadCoreDataPipeline, 6000); 
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
    } catch(err) { console.log("Engine sync delay."); }
}

function renderLayoutLayers(logs) {
    const market = document.getElementById('marketplaceList');
    const carpool = document.getElementById('carpoolContainer');
    const masjids = document.getElementById('masjidContainer');
    const doctors = document.getElementById('doctorContainer');
    const dairies = document.getElementById('dairyRatesContainer');
    const blood = document.getElementById('bloodContainer');
    const chat = document.getElementById('chatBox');
    const adminSheet = document.getElementById('adminActionRegistrySheet');
    
    // Set static government tracking schemes templates for users
    document.getElementById('schemesTrackerList').innerHTML = `
        <div class="info-card" style="border-left-color:var(--accent);"><h4>🌾 Kisaan Card Scheme 2026</h4><p>Status: <b>Forms Active</b> (Apply at Markaz)</p></div>
        <div class="info-card" style="border-left-color:var(--primary);"><h4>🚜 Tractor Subsidy Verification</h4><p>Status: <b>Balloting Next Week</b></p></div>
    `;

    // Clear operational lists
    market.innerHTML = ''; carpool.innerHTML = ''; masjids.innerHTML = ''; 
    doctors.innerHTML = ''; dairies.innerHTML = ''; blood.innerHTML = ''; 
    chat.innerHTML = ''; adminSheet.innerHTML = '';

    // Initialize analytics counters variables
    let counts = { market: 0, donors: 0, complaints: 0 };

    logs.forEach(record => {
        const id = record._id;
        const d = record.data;

        if (record.type === 'emergency') {
            const el = document.getElementById('emergencyAlertBox');
            if(d.msg) { el.innerText = `🚨 EMERGENCY WARNING: ${d.msg}`; el.style.display = 'block'; }
            else { el.style.display = 'none'; }
        }
        else if (record.type === 'poll') {
            document.getElementById('activePollQuestion').innerText = d.question;
            document.getElementById('countYes').innerText = d.yesCount || 0;
            document.getElementById('countNo').innerText = d.noCount || 0;
        }
        else if (record.type === 'marketplace') {
            counts.market++;
            market.innerHTML += `<div class="store-card" style="padding:15px;"><h4 style="color:var(--primary);">${d.item}</h4><b style="color:var(--accent);">${d.price}</b><p style="font-size:13px; margin:5px 0;">${d.desc}</p><a href="https://wa.me/${d.contact.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-wa" style="padding:4px 8px; font-size:11px; text-decoration:none;">WhatsApp</a></div>`;
        }
        else if (record.type === 'carpool') {
            carpool.innerHTML += `<div class="info-card" style="border-left-color:var(--primary);"><h4>📍 Rasta: ${d.route}</h4><small>Gari: <b>${d.vehicle}</b> | Seats: <b>${d.seats}</b> | Time: <b>${d.time}</b></small><br><a href="https://wa.me/${d.contact.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-wa" style="padding:3px 8px; font-size:11px; text-decoration:none; margin-top:5px;">Book Free Seat Lift</a></div>`;
        }
        else if (record.type === 'masjid') {
            masjids.innerHTML += `<div class="info-card" style="border-left-color:var(--accent);"><h4>🕌 ${d.name}</h4><p style="font-size:13px; color:var(--text-muted);">${d.timings}</p>${d.elaan ? `<div style="background:rgba(255,77,109,0.15); color:var(--danger); font-size:12px; padding:5px; border-radius:4px; margin-top:5px;"><b>Elaan:</b> ${d.elaan}</div>` : ''}</div>`;
        }
        else if (record.type === 'doctor') {
            doctors.innerHTML += `<div class="info-card" style="border-left-color:#fff;"><h4>Dr. ${d.name} (${d.spec})</h4><small>Hours: ${d.time} | Fees: ${d.fees}</small><br><a href="tel:${d.contact}" class="btn" style="padding:3px 8px; font-size:11px; margin-top:5px;">Call Appointment</a></div>`;
        }
        else if (record.type === 'dairy') {
            dairies.innerHTML += `<tr><td><b>${d.name}</b></td><td>Rs. ${d.milk}</td><td>Rs. ${d.dahi}</td><td><span class="badge-blood">Rs. ${d.khoya}</span></td></tr>`;
        }
        else if (record.type === 'blood') {
            counts.donors++;
            blood.innerHTML += `<div style="display:flex; justify-content:space-between; margin-bottom:5px; background:rgba(0,0,0,0.2); padding:5px; border-radius:4px;"><span><b>${d.name}</b> [${d.group}]</span><a href="tel:${d.contact}" style="color:var(--primary); font-size:12px;">Call</a></div>`;
        }
        else if (record.type === 'complaint') {
            counts.complaints++;
        }
        else if (record.type === 'chat') {
            chat.innerHTML += `<p style="font-size:14px; margin-bottom:4px;"><strong style="color:var(--primary);">${d.user}:</strong> ${d.msg}</p>`;
        }

        if (document.getElementById('adminPanel').style.display === 'block') {
            adminSheet.innerHTML += `<tr><td><b>[${record.type.toUpperCase()}]</b> ${d.item || d.name || d.user || d.question || 'Log Node'}</td><td><button class="admin-btn-del" onclick="purgeRegistryItem('${id}')">Purge Document</button></td></tr>`;
        }
    });

    document.getElementById('analyticsCounters').innerText = `🎁 System Audit -> Listings: ${counts.market} | Donors: ${counts.donors} | Pending Claims: ${counts.complaints}`;
}

// Submissions Interface Handlers
async function pushPostRequest(type, data) {
    await fetch('/api/hub', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ type, data }) });
    loadCoreDataPipeline();
}

async function castVote(voteType) {
    await fetch('/api/hub', { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ type: 'vote', voteType }) });
    alert("Shukriya! Aapka vote count ho chuka hai."); loadCoreDataPipeline();
}

function submitMarketplace(e) {
    e.preventDefault();
    pushPostRequest('marketplace', { item: document.getElementById('mkItem').value, price: document.getElementById('mkPrice').value, contact: document.getElementById('mkContact').value, desc: document.getElementById('mkDesc').value });
    e.target.reset(); alert("Janwar/Cargo listing added live!");
}

function submitCarpool(e) {
    e.preventDefault();
    pushPostRequest('carpool', { route: document.getElementById('cpRoute').value, vehicle: document.getElementById('cpVehicle').value, time: document.getElementById('cpTime').value, seats: document.getElementById('cpSeats').value, contact: document.getElementById('cpContact').value });
    e.target.reset(); alert("Lift offer shared inside village grid!");
}

function submitDoctor(e) {
    e.preventDefault();
    pushPostRequest('doctor', { name: document.getElementById('docName').value, spec: document.getElementById('docSpec').value, time: document.getElementById('docTime').value, fees: document.getElementById('docFees').value, contact: document.getElementById('docContact').value });
    e.target.reset(); alert("Doctor mapped into appointments layer!");
}

function submitBlood(e) {
    e.preventDefault();
    pushPostRequest('blood', { name: document.getElementById('blName').value, group: document.getElementById('blGroup').value, contact: document.getElementById('blContact').value });
    e.target.reset(); alert("Listed under village emergencies registry.");
}

function submitComplaint(e) {
    e.preventDefault();
    pushPostRequest('complaint', { user: document.getElementById('cpName').value, cat: document.getElementById('cpCat').value, desc: document.getElementById('cpDesc').value });
    e.target.reset(); alert("Grievance routing complete.");
}

function sendChat() {
    const user = document.getElementById('chUser').value || "Pindwasi";
    const msg = document.getElementById('chMsg').value;
    if(!msg) return;
    pushPostRequest('chat', { user, msg });
    document.getElementById('chMsg').value = '';
}

// Admin Commands Desk Execution
function triggerEmergencyAlert() { pushPostRequest('emergency', { msg: document.getElementById('admAlertMsg').value }); }
function clearEmergencyAlert() { pushPostRequest('emergency', { msg: '' }); }
function deployNewPoll() { pushPostRequest('poll', { question: document.getElementById('admPollQ').value, yesCount: 0, noCount: 0 }); }
function addMasjidRecord() { pushPostRequest('masjid', { name: document.getElementById('adMsName').value, timings: document.getElementById('adMsTimings').value, elaan: document.getElementById('adMsElaan').value }); }
function addDairyRecord() { pushPostRequest('dairy', { name: document.getElementById('adDyName').value, milk: document.getElementById('adDyMilk').value, dahi: document.getElementById('adDyDahi').value, khoya: document.getElementById('adDyKhoya').value }); }

async function purgeRegistryItem(id) {
    if(confirm("Confirm action deployment to erase record?")) {
        await fetch(`/api/hub/${id}`, { method: 'DELETE' });
        loadCoreDataPipeline();
    }
}

function loginAdmin() {
    if(prompt("Admin System ID:") === "Juttsarkar7466@gmail.com") {
        if(prompt("Secure Passcode Token:") === 'ZAQ!"wsx£$RFVCDE') {
            document.getElementById('adminPanel').style.display = "block";
            loadCoreDataPipeline();
            document.getElementById('adminPanel').scrollIntoView({ behavior: 'smooth' });
        }
    }
}
function logoutAdmin() { document.getElementById('adminPanel').style.display = "none"; }
