const globalWhatsAppNumber = "393297697888";

window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
        document.getElementById('themeBtn').innerHTML = "☀️ Light Mode";
    }
    renderSite();
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
    try {
        const res = await fetch(`/api/${endpoint}`);
        return await res.json();
    } catch (err) {
        console.error(`Error fetching ${endpoint}:`, err);
        return [];
    }
}

// ---------------------- RENDERING ENGINE ----------------------
async function renderSite() {
    // Top Ticker Notice Loader
    try {
        const noticeRes = await fetch('/api/notice');
        const noticeData = await noticeRes.json();
        document.getElementById('liveNotice').innerText = noticeData.notice || "Welcome to Kohlowala Portal";
        if (document.getElementById('adminNoticeInput')) {
            document.getElementById('adminNoticeInput').value = noticeData.notice || "";
        }
    } catch (e) { console.error(e); }

    // Announcements
    const activeAilaans = await fetchAPI('announcements');
    const ailaanDiv = document.getElementById('activeAilaanContainer');
    ailaanDiv.innerHTML = activeAilaans.length === 0 ? '<div class="info-card">Abhi koi naya ailaan nahi hai.</div>' : '';
    activeAilaans.forEach(a => {
        ailaanDiv.innerHTML += `
            <div class="info-card">
                <span style="background: var(--accent); color:#111; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:bold; display:inline-block; margin-bottom:5px;">${a.type}</span>
                <p style="font-weight: 500;">${a.msg}</p>
                <small style="opacity: 0.7; display:block; margin-top:5px;">Murasil: <strong>${a.sender}</strong></small>
            </div>`;
    });

    // Livestock Mandi
    const animals = await fetchAPI('livestock');
    const livestockDiv = document.getElementById('livestockContainer');
    livestockDiv.innerHTML = animals.length === 0 ? '<p>Mandi khali hai.</p>' : '';
    animals.forEach(an => {
        livestockDiv.innerHTML += `
            <div class="info-card" style="border-left-color: brown;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <h4 style="color:var(--primary);">${an.type} (${an.breed})</h4>
                    <span class="badge-blood">${an.price}</span>
                </div>
                <p style="margin:5px 0; font-size:14px; opacity:0.8;">${an.desc || 'No descriptions.'}</p>
                <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                    <small>Owner: <strong>${an.owner}</strong></small>
                    <a href="https://wa.me/${an.contact.replace(/[^0-9]/g, '')}?text=Salam, janwar ke silsile mein rabta kia hai." target="_blank" class="btn btn-wa" style="padding:4px 10px; font-size:12px;">WhatsApp</a>
                </div>
            </div>`;
    });

    // Doctors Schedulers
    const docs = await fetchAPI('doctors');
    const dt = document.getElementById('doctorTable').getElementsByTagName('tbody')[0];
    dt.innerHTML = '';
    docs.forEach(d => {
        dt.innerHTML += `<tr>
            <td><strong>${d.name}</strong></td>
            <td>${d.spec}</td>
            <td>${d.time}</td>
            <td><span class="badge-gender">${d.fees}</span></td>
            <td><a href="https://wa.me/${d.contact.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-wa" style="padding:4px 8px; font-size:12px;">Book</a></td>
        </tr>`;
    });

    // Rent Tools
    const rent = await fetchAPI('rent');
    const rt = document.getElementById('rentTable').getElementsByTagName('tbody')[0];
    rt.innerHTML = '';
    rent.forEach(r => {
        rt.innerHTML += `<tr>
            <td><strong>${r.owner}</strong></td>
            <td>${r.item}</td>
            <td><span class="badge-blood">${r.price}</span></td>
            <td><a href="https://wa.me/${r.contact.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-wa" style="padding:4px 8px; font-size:12px;">Rent It</a></td>
        </tr>`;
    });

    // Cargo loader
    const cargoList = await fetchAPI('cargo');
    const ct = document.getElementById('cargoTable').getElementsByTagName('tbody')[0];
    ct.innerHTML = '';
    cargoList.forEach(c => {
        ct.innerHTML += `<tr>
            <td><strong>${c.owner}</strong></td>
            <td>${c.vehicle}</td>
            <td><span class="badge-gender">${c.rates}</span></td>
            <td>${c.route}</td>
            <td><a href="https://wa.me/${c.contact.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-wa" style="padding:4px 8px; font-size:12px;">Book</a></td>
        </tr>`;
    });

    // Tubewell
    const tubewells = await fetchAPI('tubewells');
    const tt = document.getElementById('tubewellTable').getElementsByTagName('tbody')[0];
    tt.innerHTML = '';
    tubewells.forEach(t => {
        tt.innerHTML += `<tr>
            <td><strong>${t.zone}</strong></td>
            <td>${t.time}</td>
            <td><span style="color: green; font-weight: bold;">● ${t.status}</span></td>
        </tr>`;
    });

    // Blood Donors
    const blood = await fetchAPI('blood');
    const bt = document.getElementById('bloodTable').getElementsByTagName('tbody')[0];
    bt.innerHTML = '';
    blood.forEach(b => {
        bt.innerHTML += `<tr>
            <td><strong>${b.name}</strong></td>
            <td><span class="badge-blood">${b.group}</span></td>
            <td>${b.age}</td>
            <td><a href="https://wa.me/${b.contact.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-wa" style="padding:4px 8px; font-size:12px;">WhatsApp</a></td>
        </tr>`;
    });

    // Rishta
    const rishtas = await fetchAPI('rishta');
    const rst = document.getElementById('rishtaTable').getElementsByTagName('tbody')[0];
    rst.innerHTML = '';
    rishtas.forEach(r => {
        rst.innerHTML += `<tr>
            <td><strong>${r.name}</strong></td>
            <td><span class="badge-gender">${r.gender}</span></td>
            <td>${r.age}</td>
            <td>${r.caste}</td>
            <td>${r.job}</td>
            <td><a href="https://wa.me/${r.contact.replace(/[^0-9]/g, '')}" target="_blank" class="btn btn-wa" style="padding:4px 8px; font-size:12px;">Chat</a></td>
        </tr>`;
    });

    // Mandi Rates
    const mandiData = await fetchAPI('mandi');
    const mt = document.getElementById('mandiTable').getElementsByTagName('tbody')[0];
    mt.innerHTML = '';
    mandiData.forEach(m => {
        mt.innerHTML += `<tr>
            <td><strong>${m.crop}</strong></td>
            <td><span class="badge-gender">${m.gov}</span></td>
            <td><span class="badge-blood">${m.market}</span></td>
        </tr>`;
    });

    // Weather Advice
    try {
        const weatherRes = await fetch('/api/weather');
        const weatherData = await weatherRes.json();
        document.getElementById('weatherAdviceBox').innerText = weatherData.weather;
    } catch (e) { console.error(e); }

    // Handi-Craft Store
    const products = await fetchAPI('products');
    const storeDiv = document.getElementById('storeContainer');
    storeDiv.innerHTML = '';
    products.forEach(p => {
        storeDiv.innerHTML += `
            <div class="store-card">
                <div class="store-img" style="background-image: url('${p.img}');"></div>
                <div class="store-info">
                    <h4>${p.title}</h4>
                    <span class="store-price">${p.price}</span>
                    <a href="https://wa.me/${globalWhatsAppNumber}?text=Salam, mujhe ye kapra pasand aya hai: ${p.title}" target="_blank" class="btn btn-wa" style="font-size:13px; padding:6px 12px;">WhatsApp Order</a>
                </div>
            </div>`;
    });
}

// ---------------------- SUBMISSION HANDLERS ----------------------
async function submitAnnouncement(event) {
    event.preventDefault();
    const type = document.getElementById('aType').value;
    const sender = document.getElementById('aSender').value;
    const msg = document.getElementById('aMsg').value;

    await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, sender, msg })
    });
    document.getElementById('aSender').value = '';
    document.getElementById('aMsg').value = '';
    alert("Ailaan admin approval ke liye bhej diya gaya!");
}

async function addLivestock(event) {
    event.preventDefault();
    const type = document.getElementById('lType').value;
    const breed = document.getElementById('lBreed').value;
    const price = document.getElementById('lPrice').value;
    const owner = document.getElementById('lOwner').value;
    const contact = document.getElementById('lContact').value;
    const desc = document.getElementById('lDesc').value;

    await fetch('/api/livestock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, breed, price, owner, contact, desc })
    });
    renderSite();
    alert("Maweshi register ho gaya!");
}

async function addDoctor(event) {
    event.preventDefault();
    const name = document.getElementById('docName').value;
    const spec = document.getElementById('docSpec').value;
    const time = document.getElementById('docTime').value;
    const fees = document.getElementById('docFees').value;
    const contact = document.getElementById('docContact').value;

    await fetch('/api/doctors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, spec, time, fees, contact })
    });
    renderSite();
    alert("Doctor add ho gaye!");
}

async function addRentItem(event) {
    event.preventDefault();
    const owner = document.getElementById('rentOwner').value;
    const item = document.getElementById('rentItem').value;
    const price = document.getElementById('rentPrice').value;
    const contact = document.getElementById('rentContact').value;

    await fetch('/api/rent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, item, price, contact })
    });
    renderSite();
    alert("Tool rent list mein shamil ho gaya!");
}

async function addCargo(event) {
    event.preventDefault();
    const owner = document.getElementById('cOwner').value;
    const vehicle = document.getElementById('cVehicle').value;
    const rates = document.getElementById('cRates').value;
    const route = document.getElementById('cRoute').value;
    const contact = document.getElementById('cContact').value;

    await fetch('/api/cargo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owner, vehicle, rates, route, contact })
    });
    renderSite();
    alert("Cargo list ho gaya!");
}

async function submitShikayat(event) {
    event.preventDefault();
    const cat = document.getElementById('shikayatCategory').value;
    const desc = document.getElementById('shikayatDesc').value;

    await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cat, desc })
    });
    document.getElementById('shikayatDesc').value = '';
    alert("🔒 Gumnaam Shikayat Panchayat ko bhej di gayi!");
}

async function addUserBlood(event) {
    event.preventDefault();
    const name = document.getElementById('bName').value;
    const group = document.getElementById('bGroup').value;
    const age = document.getElementById('bAge').value;
    const contact = document.getElementById('bContact').value;

    await fetch('/api/blood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, group, age, contact })
    });
    renderSite();
    alert("Donor successfully added!");
}

async function addUserRishta(event) {
    event.preventDefault();
    const name = document.getElementById('rName').value;
    const gender = document.getElementById('rGender').value;
    const age = document.getElementById('rAge').value;
    const caste = document.getElementById('rCaste').value;
    const job = document.getElementById('rJob').value;
    const contact = document.getElementById('rContact').value;

    await fetch('/api/rishta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, gender, age, caste, job, contact })
    });
    renderSite();
    alert("Rishta profile created!");
}

// ---------------------- ADMIN DASHBOARD WORKFLOWS ----------------------
function loginAdmin() {
    const email = prompt("Admin Gmail enter karein:");
    if (email === "Juttsarkar7466@gmail.com") {
        const password = prompt("Admin Password enter karein:");
        if (password === 'ZAQ!"wsx£$RFVCDE') {
            document.getElementById('adminPanel').style.display = "block";
            renderAdminPanelLists();
            document.getElementById('adminPanel').scrollIntoView();
            alert("Admin Panel successfully unlocked.");
        } else { alert("Ghalat Password!"); }
    } else { alert("Ghalat Gmail ID!"); }
}

function logoutAdmin() {
    document.getElementById('adminPanel').style.display = "none";
}

async function updateNotice() {
    const newNotice = document.getElementById('adminNoticeInput').value;
    if (!newNotice) return alert("Notice khali nahi ho sakta!");
    
    await fetch('/api/notice', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notice: newNotice })
    });
    alert("Ticker Notice Update Ho Gaya!");
    renderSite();
}

async function renderAdminPanelLists() {
    const pending = await fetchAPI('admin/pending');
    const act = document.getElementById('adminAnnouncementsTable').getElementsByTagName('tbody')[0];
    act.innerHTML = '';
    pending.forEach(p => {
        act.innerHTML += `<tr>
            <td><strong>${p.type}</strong></td>
            <td>${p.msg}</td>
            <td>${p.sender}</td>
            <td>
                <button class="admin-btn-approve" onclick="approveAnnouncement('${p._id}')">Approve</button>
                <button class="admin-btn-del" onclick="deleteItem('pendingAnnouncements', '${p._id}')">Reject</button>
            </td>
        </tr>`;
    });

    const complaints = await fetchAPI('admin/complaints');
    const acc = document.getElementById('adminComplaintsTable').getElementsByTagName('tbody')[0];
    acc.innerHTML = '';
    complaints.forEach(c => {
        acc.innerHTML += `<tr>
            <td><strong>${c.cat}</strong></td>
            <td>${c.desc}</td>
            <td><button class="admin-btn-del" onclick="deleteItem('complaints', '${c._id}')">Delete</button></td>
        </tr>`;
    });

    const tubewells = await fetchAPI('tubewells');
    const att = document.getElementById('adminTubewellTable').getElementsByTagName('tbody')[0];
    att.innerHTML = '';
    tubewells.forEach(t => {
        att.innerHTML += `<tr>
            <td><strong>${t.zone}</strong> (${t.time})</td>
            <td><button class="admin-btn-del" onclick="deleteItem('tubewells', '${t._id}')">Remove</button></td>
        </tr>`;
    });

    const docs = await fetchAPI('doctors');
    const adt = document.getElementById('adminDoctorTable').getElementsByTagName('tbody')[0];
    adt.innerHTML = '';
    docs.forEach(d => {
        adt.innerHTML += `<tr>
            <td><strong>${d.name}</strong></td>
            <td><button class="admin-btn-del" onclick="deleteItem('doctors', '${d._id}')">Delete</button></td>
        </tr>`;
    });

    const rent = await fetchAPI('rent');
    const art = document.getElementById('adminRentTable').getElementsByTagName('tbody')[0];
    art.innerHTML = '';
    rent.forEach(r => {
        art.innerHTML += `<tr>
            <td><strong>${r.item}</strong></td>
            <td><button class="admin-btn-del" onclick="deleteItem('rent', '${r._id}')">Remove</button></td>
        </tr>`;
    });

    const cargo = await fetchAPI('cargo');
    const acg = document.getElementById('adminCargoTable').getElementsByTagName('tbody')[0];
    acg.innerHTML = '';
    cargo.forEach(c => {
        acg.innerHTML += `<tr>
            <td><strong>${c.owner}</strong> (${c.vehicle})</td>
            <td><button class="admin-btn-del" onclick="deleteItem('cargo', '${c._id}')">Delete</button></td>
        </tr>`;
    });

    const animals = await fetchAPI('livestock');
    const amg = document.getElementById('adminLivestockTable').getElementsByTagName('tbody')[0];
    amg.innerHTML = '';
    animals.forEach(a => {
        amg.innerHTML += `<tr>
            <td><strong>${a.type}</strong> (${a.price})</td>
            <td><button class="admin-btn-del" onclick="deleteItem('livestock', '${a._id}')">Delete</button></td>
        </tr>`;
    });

    const blood = await fetchAPI('blood');
    const abt = document.getElementById('adminBloodRegTable').getElementsByTagName('tbody')[0];
    abt.innerHTML = '';
    blood.forEach(b => {
        abt.innerHTML += `<tr><td><strong>${b.name}</strong></td><td><button class="admin-btn-del" onclick="deleteItem('blood', '${b._id}')">Delete</button></td></tr>`;
    });

    const rishta = await fetchAPI('rishta');
    const arr = document.getElementById('adminRishtaRegTable').getElementsByTagName('tbody')[0];
    arr.innerHTML = '';
    rishta.forEach(r => {
        arr.innerHTML += `<tr><td><strong>${r.name}</strong></td><td><button class="admin-btn-del" onclick="deleteItem('rishta', '${r._id}')">Delete</button></td></tr>`;
    });
}

async function approveAnnouncement(id) {
    await fetch(`/api/admin/approve/${id}`, { method: 'PUT' });
    renderSite();
    renderAdminPanelLists();
}

async function addTubewellSchedule() {
    const zone = document.getElementById('tZone').value;
    const time = document.getElementById('tTime').value;
    const status = document.getElementById('tStatus').value || 'Active';

    await fetch('/api/tubewells', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone, time, status })
    });

    document.getElementById('tZone').value = '';
    document.getElementById('tTime').value = '';
    document.getElementById('tStatus').value = '';

    renderSite();
    renderAdminPanelLists();
}

async function deleteItem(collection, id) {
    await fetch(`/api/admin/${collection}/${id}`, { method: 'DELETE' });
    renderSite();
    renderAdminPanelLists();
}
