let adminSessionTimeoutToken = null;

window.addEventListener('DOMContentLoaded', () => {
    fetchLiveMandiRates();
    fetchAutomatedKisaanWeather();
    orchestrateDataSyncPipeline();
    setInterval(orchestrateDataSyncPipeline, 4000); 
    setupAdminInteractionsTracker();
});

// 🌦️ WEATHER FETCH ENGINE
async function fetchAutomatedKisaanWeather() {
    try {
        const res = await fetch('/api/weather-advisory');
        const info = await res.json();
        document.getElementById('liveTempDisplay').innerText = `${info.temp}°C`;
        document.getElementById('cropAdvisoryText').innerText = info.advice;
    } catch (err) { console.log("Weather tracking failed."); }
}

async function fetchLiveMandiRates() {
    try {
        const res = await fetch('/api/live-mandi');
        const list = await res.json();
        const container = document.getElementById('mandiContainer');
        container.innerHTML = '';
        list.forEach(item => {
            container.innerHTML += `<tr><td><b>${item.crop}</b></td><td>${item.gov}</td><td><span style="color:var(--primary); font-weight:700;">${item.market}</span></td></tr>`;
        });
    } catch(err) { console.log("Mandi sync fault."); }
}

// 🔄 CENTRAL PIPELINE SYNCHRONIZATION
async function orchestrateDataSyncPipeline() {
    try {
        const res = await fetch('/api/hub');
        const elements = await res.json();
        renderSystemViews(elements);
    } catch(err) { console.log("Pipeline synchronization error."); }
}

function renderSystemViews(logs) {
    const newsPub = document.getElementById('newsPublicContainer');
    const cricketPub = document.getElementById('cricketMatchesPublicList');
    const rozgarPub = document.getElementById('rozgarDeskPublicContainer');
    const lostFoundPub = document.getElementById('lostFoundPublicContainer');
    const marketPub = document.getElementById('marketplaceList');
    const carpoolPub = document.getElementById('carpoolContainer');
    const pharmacyPub = document.getElementById('pharmacyPublicContainer');
    const donorPub = document.getElementById('donorList');
    const tubewellPub = document.getElementById('tubewellList');
    const masjidPub = document.getElementById('masjidList');
    const marqueePub = document.getElementById('sportsMarqueeContent');
    const eventsPub = document.getElementById('eventsPublicContainer');
    const chatBox = document.getElementById('chatBox');
    
    const adminQueue = document.getElementById('adminApprovalQueueContainer');
    const adminSheet = document.getElementById('adminActionRegistrySheet');
    const adminBanContainer = document.getElementById('adminBlacklistRenderContainer');

    newsPub.innerHTML = ''; cricketPub.innerHTML = ''; lostFoundPub.innerHTML = '';
    marketPub.innerHTML = ''; carpoolPub.innerHTML = ''; pharmacyPub.innerHTML = '';
    donorPub.innerHTML = ''; tubewellPub.innerHTML = ''; masjidPub.innerHTML = '';
    eventsPub.innerHTML = ''; adminQueue.innerHTML = ''; adminSheet.innerHTML = '';
    adminBanContainer.innerHTML = ''; chatBox.innerHTML = '';

    let marqueeHtmlAccumulator = '';
    const isAdminModeActive = document.getElementById('adminPanel').style.display === 'block';

    // Parse Tickers Dynamic Visual Modules (Fixed Real-time checks)
    const emergencyDoc = logs.find(l => l.type === 'emergency');
    const alertBox = document.getElementById('emergencyAlertBox');
    if (emergencyDoc && emergencyDoc.data && emergencyDoc.data.text && emergencyDoc.data.text.trim() !== "") {
        alertBox.innerText = emergencyDoc.data.text;
        alertBox.style.display = 'block';
    } else { alertBox.style.display = 'none'; }

    const announceDoc = logs.find(l => l.type === 'announcement');
    const announceBox = document.getElementById('dynamicAnnouncementBar');
    if (announceDoc && announceDoc.data && announceDoc.data.text && announceDoc.data.text.trim() !== "") {
        announceBox.innerText = announceDoc.data.text;
        announceBox.style.display = 'block';
    } else { announceBox.style.display = 'none'; }

    const festivalDoc = logs.find(l => l.type === 'festival');
    if (festivalDoc) {
        document.getElementById('mainHeader').className = festivalDoc.data.theme;
        if(festivalDoc.data.theme === 'theme-eid') document.getElementById('heroGreeting').innerText = "🌙 Eid Mubarak - Kohlowala Hub";
        else if(festivalDoc.data.theme === 'theme-14aug') document.getElementById('heroGreeting').innerText = "🇵🇰 Jashn-e-Azadi Mubarak";
        else if(festivalDoc.data.theme === 'theme-match') document.getElementById('heroGreeting').innerText = "🏏 Tournament Mode Activated";
        else document.getElementById('heroGreeting').innerText = "Kohlowala Portal";
    }

    logs.forEach(entry => {
        const id = entry._id;
        const d = entry.data;

        if (entry.type === 'blacklist') {
            adminBanContainer.innerHTML += `<div>🚫 Banned: ${d.number} <button class="btn-danger" style="padding:2px 5px; font-size:10px;" onclick="purgeDocumentEntry('${id}')">Unban</button></div>`;
            return;
        }

        if (entry.type === 'news') {
            if (d.status === 'approved') {
                newsPub.innerHTML += `<div class="info-card" style="border-left:3px solid var(--primary);"><h4>${d.title}</h4><p style="font-size:13px; color:var(--text-muted); margin-top:5px;">${d.content}</p></div>`;
            } else if (d.status === 'pending' && isAdminModeActive) {
                adminQueue.innerHTML += `<div class="info-card"><b>[NEWS] ${d.title}</b><br><button class="btn-approve" onclick="approveDocumentLog('${id}')">Approve News</button></div>`;
            }
        }
        else if (entry.type === 'cricket') {
            if (d.status === 'approved') {
                cricketPub.innerHTML += `<div class="info-card" style="border-left:3px solid var(--accent);"><h4>🏏 ${d.teamA} VS ${d.teamB}</h4><small>🗓️ ${d.time} | 📍 ${d.ground}</small><br><a href="tel:${d.contact}" class="btn" style="padding:2px 8px; font-size:10px; margin-top:5px; display:inline-block;">Call Organizer</a></div>`;
            } else if (d.status === 'pending' && isAdminModeActive) {
                adminQueue.innerHTML += `<div class="info-card"><b>[MATCH] ${d.teamA} vs ${d.teamB}</b><br><button class="btn-approve" onclick="approveDocumentLog('${id}')">Approve Match</button></div>`;
            }
        }
        else if (entry.type === 'pharmacy') {
            if (d.status === 'approved') {
                pharmacyPub.innerHTML += `<div class="info-card" style="border-left:4px solid var(--danger);"><h4>${d.type.toUpperCase()}: ${d.name}</h4><b style="color:var(--accent); font-size:14px;">📞 Contact: ${d.contact}</b></div>`;
            } else if (d.status === 'pending' && isAdminModeActive) {
                adminQueue.innerHTML += `<div class="info-card"><b>[MEDICAL] ${d.name}</b><br><button class="btn-approve" onclick="approveDocumentLog('${id}')">Approve Medical</button></div>`;
            }
        }
        else if (entry.type === 'rozgar') {
            const badgeColor = d.type === 'employer' ? 'var(--accent)' : 'var(--primary)';
            const badgeText = d.type === 'employer' ? 'Zaroorat Hai' : 'Available';
            rozgarPub.innerHTML += `
                <div class="info-card rozgar-card" data-keyword="${d.role.toLowerCase()}">
                    <span style="background:${badgeColor}; color:black; padding:2px 6px; font-size:10px; font-weight:bold; border-radius:4px;">${badgeText}</span>
                    <h4 style="margin-top:5px;">${d.role}</h4><p>Dihri/Wages: <b>${d.wages}</b></p>
                    <a href="tel:${d.contact}" class="btn" style="padding:3px 8px; font-size:11px; margin-top:5px; display:inline-block;">Contact Directly</a>
                </div>`;
        }
        else if (entry.type === 'lostfound') {
            const tag = d.status === 'lost' ? '<span style="color:var(--danger); font-weight:bold;">[GUMSHUDA]</span>' : '<span style="color:var(--success); font-weight:bold;">[MILA HAI]</span>';
            lostFoundPub.innerHTML += `<div class="info-card">${tag} <b>${d.item}</b><br><small style="color:var(--text-muted);">Rabta: <b>${d.contact}</b></small></div>`;
        }
        else if (entry.type === 'marketplace') {
            marketPub.innerHTML += `<div class="info-card"><h4>${d.item}</h4><b style="color:var(--accent);">${d.price}</b><p style="font-size:12px;">${d.desc}</p><a href="https://wa.me/${d.contact.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-wa" style="padding:3px 8px; font-size:11px; text-decoration:none; display:inline-block; margin-top:5px;">WhatsApp</a></div>`;
        }
        else if (entry.type === 'carpool') {
            carpoolPub.innerHTML += `<div class="info-card"><h4>📍 Rasta: ${d.route}</h4><small>Vehicle: ${d.vehicle} | Seats: ${d.seats} | Time: ${d.time}</small><br><a href="https://wa.me/${d.contact.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-wa" style="padding:3px 8px; font-size:11px; text-decoration:none; display:inline-block; margin-top:5px;">Book Lift</a></div>`;
        }
        else if (entry.type === 'chat') {
            chatBox.innerHTML += `<p style="margin-bottom:6px; font-size:14px;"><strong style="color:var(--primary);">${d.user}:</strong> ${d.msg}</p>`;
        }
        else if (entry.type === 'donor') {
            donorPub.innerHTML += `<div style="font-size:13px; margin-bottom:4px;">🩸 <b>${d.group}</b> - ${d.name} (${d.contact})</div>`;
        }
        else if (entry.type === 'tubewell') {
            tubewellPub.innerHTML += `<div style="font-size:13px; margin-bottom:4px;">⚡ <b>${d.name}</b>: ${d.status}</div>`;
        }
        else if (entry.type === 'masjid') {
            masjidPub.innerHTML += `<div style="font-size:13px; margin-bottom:4px;">🕌 <b>${d.name}</b> - Fajr: ${d.fajr} | Juma: ${d.juma}</div>`;
        }
        else if (entry.type === 'eventlog') {
            eventsPub.innerHTML += `<div class="info-card" style="border-left:3px solid var(--primary);">🏁 <b>${d.title}</b><br><small>Scheduled Timeline: ${d.date}</small></div>`;
        }
        else if (entry.type === 'galleryhero') {
            marqueeHtmlAccumulator += `<div class="gallery-card">🌟 <b style="color:var(--accent);">${d.name}</b><p style="font-size:12px; margin-top:3px;">${d.record}</p></div>`;
        }

        if (isAdminModeActive && !['emergency', 'announcement', 'festival'].includes(entry.type)) {
            adminSheet.innerHTML += `<tr><td><b>[${entry.type.toUpperCase()}]</b></td><td>${d.item || d.title || d.role || d.user || d.name || 'System Entry'}</td><td><button class="btn btn-danger" style="padding:4px 8px; font-size:11px;" onclick="purgeDocumentEntry('${id}')">Purge/Delete</button></td></tr>`;
        }
    });

    if(marqueeHtmlAccumulator !== '') {
        marqueePub.innerHTML = marqueeHtmlAccumulator + marqueeHtmlAccumulator;
    } else {
        marqueePub.innerHTML = `<div class="gallery-card">No records updated yet on the board.</div>`;
    }
}

// 📤 GLOBAL PAYLOAD POST
async function executeGlobalPayloadPost(type, data) {
    const res = await fetch('/api/hub', { 
        method: 'POST', 
        headers: {'Content-Type': 'application/json'}, 
        body: JSON.stringify({ type, data }) 
    });
    if (!res.ok) {
        const errData = await res.json();
        alert(errData.error || "Submission rejected by system.");
        return false;
    }
    orchestrateDataSyncPipeline();
    return true;
}

// USER DRIVEN SUBMISSIONS ARCHITECTURE
function submitNewsItem(e) {
    e.preventDefault();
    executeGlobalPayloadPost('news', {
        title: document.getElementById('newsTitle').value,
        content: document.getElementById('newsContent').value,
        status: 'pending'
    });
    e.target.reset();
    alert("Khabar register ho gayi hai! Admin verification ke baad live hogi.");
}

function submitCricketMatch(e) {
    e.preventDefault();
    executeGlobalPayloadPost('cricket', {
        teamA: document.getElementById('ckTeamA').value,
        teamB: document.getElementById('ckTeamB').value,
        time: document.getElementById('ckDateTime').value,
        ground: document.getElementById('ckGround').value,
        contact: document.getElementById('ckContact').value,
        status: 'pending'
    });
    e.target.reset();
    alert("Match update submitted into approval pipes!");
}

function submitJobRegistry(e) {
    e.preventDefault();
    executeGlobalPayloadPost('rozgar', {
        type: document.getElementById('rjType').value,
        role: document.getElementById('rjRole').value,
        wages: document.getElementById('rjWages').value,
        contact: document.getElementById('rjContact').value
    });
    e.target.reset();
    alert("Rozgar entry published to live job desk!");
}

function submitLostFound(e) {
    e.preventDefault();
    executeGlobalPayloadPost('lostfound', {
        status: document.getElementById('lfStatus').value,
        item: document.getElementById('lfItem').value,
        contact: document.getElementById('lfContact').value
    });
    e.target.reset();
    alert("Lost & Found entry logged successfully.");
}

function submitMarketplace(e) {
    e.preventDefault();
    executeGlobalPayloadPost('marketplace', { item: document.getElementById('mkItem').value, price: document.getElementById('mkPrice').value, contact: document.getElementById('mkContact').value, desc: document.getElementById('mkDesc').value });
    e.target.reset();
}

function submitCarpool(e) {
    e.preventDefault();
    executeGlobalPayloadPost('carpool', { route: document.getElementById('cpRoute').value, vehicle: document.getElementById('cpVehicle').value, time: document.getElementById('cpTime').value, seats: document.getElementById('cpSeats').value, contact: document.getElementById('cpContact').value });
    e.target.reset();
}

function submitPharmacyAmbulance(e) {
    e.preventDefault();
    executeGlobalPayloadPost('pharmacy', {
        type: document.getElementById('paType').value,
        name: document.getElementById('paName').value,
        contact: document.getElementById('paContact').value,
        status: 'pending'
    });
    e.target.reset();
    alert("Medical facility profile sent to admin verification.");
}

function submitDonor(e) {
    e.preventDefault();
    executeGlobalPayloadPost('donor', { name: document.getElementById('dnName').value, group: document.getElementById('dnGroup').value, contact: document.getElementById('dnContact').value });
    e.target.reset();
}

function submitTubewell(e) {
    e.preventDefault();
    executeGlobalPayloadPost('tubewell', { name: document.getElementById('twName').value, status: document.getElementById('twStatus').value });
    e.target.reset();
}

function submitMasjid(e) {
    e.preventDefault();
    executeGlobalPayloadPost('masjid', { name: document.getElementById('msName').value, fajr: document.getElementById('msFajr').value, juma: document.getElementById('msJuma').value });
    e.target.reset();
}

function submitGalleryHero(e) {
    e.preventDefault();
    executeGlobalPayloadPost('galleryhero', { name: document.getElementById('glName').value, record: document.getElementById('glRecord').value });
    e.target.reset();
}

function submitEventLog(e) {
    e.preventDefault();
    executeGlobalPayloadPost('eventlog', { title: document.getElementById('evTitle').value, date: document.getElementById('evDate').value });
    e.target.reset();
}

function sendChat() {
    const user = document.getElementById('chUser').value || "Pindwasi";
    const msg = document.getElementById('chMsg').value;
    if(!msg) return;
    executeGlobalPayloadPost('chat', { user, msg });
    document.getElementById('chMsg').value = '';
}

function filterRozgarDesk() {
    const query = document.getElementById('jobSearchInput').value.toLowerCase();
    const cards = document.querySelectorAll('#rozgarDeskPublicContainer .rozgar-card');
    cards.forEach(card => {
        const text = card.getAttribute('data-keyword');
        if (text.includes(query)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// 🔒 ADMIN CONTROLS INTERFACES
function loginAdmin() {
    if (prompt("Admin Identity Matrix ID:") === "Juttsarkar7466@gmail.com") {
        if (prompt("Security Passcode Chain:") === 'ZAQ!"wsx£$RFVCDE') {
            document.getElementById('adminPanel').style.display = "block";
            document.getElementById('adminCalendarFormBox').style.opacity = "1";
            document.getElementById('adminCalendarFormBox').style.pointerEvents = "auto";
            resetAdminSecurityTimeoutTracker();
            orchestrateDataSyncPipeline();
            alert("Admin Access Authorized. 10-Min Security Counter Active.");
        }
    }
}

function logoutAdmin() {
    document.getElementById('adminPanel').style.display = "none";
    document.getElementById('adminCalendarFormBox').style.opacity = "0.6";
    document.getElementById('adminCalendarFormBox').style.pointerEvents = "none";
    if(adminSessionTimeoutToken) clearTimeout(adminSessionTimeoutToken);
    orchestrateDataSyncPipeline();
}

function resetAdminSecurityTimeoutTracker() {
    if (document.getElementById('adminPanel').style.display === "block") {
        if(adminSessionTimeoutToken) clearTimeout(adminSessionTimeoutToken);
        adminSessionTimeoutToken = setTimeout(() => {
            alert("Security Alert: 10 Minutes Idle Timeout Reached. System Locking Down Automatically!");
            logoutAdmin();
        }, 600000);
    }
}

function setupAdminInteractionsTracker() {
    ['click', 'mousemove', 'keypress', 'touchstart'].forEach(eventName => {
        document.addEventListener(eventName, resetAdminSecurityTimeoutTracker);
    });
}

async function approveDocumentLog(id) {
    await fetch(`/api/hub/approve/${id}`, { method: 'PUT' });
    orchestrateDataSyncPipeline();
}

async function purgeDocumentEntry(id) {
    if (confirm("Kya aap waqai is entry ko platform se delete karna chahte hain?")) {
        await fetch(`/api/hub/${id}`, { method: 'DELETE' });
        orchestrateDataSyncPipeline();
    }
}

// 🚀 FIXED & OPERATIONAL ANNOUNCEMENT EDITOR ACTIONS
async function updateAdminAnnouncement(type) {
    const inputElement = type === 'announcement' ? document.getElementById('adAnnounceText') : document.getElementById('adEmergencyText');
    const textVal = inputElement.value;
    
    // Direct operational request without complex wrappers
    const success = await executeGlobalPayloadPost(type, { text: textVal });
    if(success) {
        alert("System broadcast update deployed successfully!");
        inputElement.value = '';
    }
}

async function blacklistUserNumber() {
    const rawNum = document.getElementById('adBanNumber').value;
    const cleanNum = rawNum.replace(/[^0-9]/g, '');
    if(!cleanNum) return alert("Sahi Mobile number enter karein!");
    await executeGlobalPayloadPost('blacklist', { number: cleanNum });
    document.getElementById('adBanNumber').value = '';
    alert(`Number ${cleanNum} ko platform se permanently black-list kar diya gaya hai.`);
}

async function changeFestivalThemeOverlay() {
    const theme = document.getElementById('adFestivalThemeSelector').value;
    await executeGlobalPayloadPost('festival', { theme });
    alert("Global Special Interface Framework Applied.");
}

async function triggerFlashDatabaseClean() {
    if(confirm("Master Warning: Kya aap 30 din se purani tamam entries saaf karna chahte hain?")) {
        const res = await fetch('/api/hub/clear-expired', { method: 'POST' });
        if(res.ok) {
            alert("Database Flash Cleanup complete!");
            orchestrateDataSyncPipeline();
        }
    }
}
