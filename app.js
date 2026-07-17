const globalWhatsAppNumber = "393297697888";

// Page Load Event Listener
window.addEventListener('DOMContentLoaded', async () => {
    // Check if browser already has initialized data, if not fetch from data.json
    if (!localStorage.getItem('notice')) {
        try {
            const response = await fetch('data.json');
            const defaultData = await response.json();
            
            // Seed all keys to localStorage
            localStorage.setItem('notice', defaultData.notice);
            localStorage.setItem('weather', defaultData.weather);
            localStorage.setItem('doctors', JSON.stringify(defaultData.doctors));
            localStorage.setItem('rent', JSON.stringify(defaultData.rent));
            localStorage.setItem('tubewells', JSON.stringify(defaultData.tubewells));
            localStorage.setItem('complaints', JSON.stringify(defaultData.complaints));
            localStorage.setItem('blood', JSON.stringify(defaultData.blood));
            localStorage.setItem('rishta', JSON.stringify(defaultData.rishta));
            localStorage.setItem('mandi', JSON.stringify(defaultData.mandi));
            localStorage.setItem('products', JSON.stringify(defaultData.products));
            localStorage.setItem('activeAnnouncements', JSON.stringify(defaultData.activeAnnouncements));
            localStorage.setItem('pendingAnnouncements', JSON.stringify(defaultData.pendingAnnouncements));
            localStorage.setItem('livestock', JSON.stringify(defaultData.livestock));
            localStorage.setItem('cargo', JSON.stringify(defaultData.cargo));
        } catch (error) {
            console.error("Default data load error: ", error);
        }
    }
    
    // Apply theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
        document.getElementById('themeBtn').innerHTML = "☀️ Light Mode";
    }
    
    renderSite();
});

// Helper function to safe load lists
function getSavedList(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
}

// Dark Mode Switcher
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

// ---------------------- RENDER ENGINE ----------------------
function renderSite() {
    // 1. Top Notice Ticker
    document.getElementById('liveNotice').innerText = localStorage.getItem('notice') || "Welcome to Kohlowala Portal!";

    // 2. Announcements Renderer
    const activeAilaans = getSavedList('activeAnnouncements');
    const ailaanDiv = document.getElementById('activeAilaanContainer');
    ailaanDiv.innerHTML = '';
    if (activeAilaans.length === 0) {
        ailaanDiv.innerHTML = '<div class="info-card">Abhi koi naya ailaan jari nahi kiya gaya.</div>';
    } else {
        activeAilaans.forEach(a => {
            ailaanDiv.innerHTML += `
                <div class="info-card">
                    <span style="background: var(--accent); color:#111; padding:2px 8px; border-radius:4px; font-size:11px; font-weight:bold; display:inline-block; margin-bottom:5px;">${a.type}</span>
                    <p style="font-weight: 500;">${a.msg}</p>
                    <small style="opacity: 0.7; display:block; margin-top:5px;">Murasil: <strong>${a.sender}</strong></small>
                </div>
            `;
        });
    }

    // 3. Livestock Mandi Renderer
    const animals = getSavedList('livestock');
    const livestockDiv = document.getElementById('livestockContainer');
    livestockDiv.innerHTML = '';
    if (animals.length === 0) {
        livestockDiv.innerHTML = '<p>Mandi mein abhi koi janwar dastyab nahi hai.</p>';
    } else {
        animals.forEach(an => {
            livestockDiv.innerHTML += `
                <div class="info-card" style="border-left-color: brown;">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <h4 style="color:var(--primary);">${an.type} (${an.breed})</h4>
                        <span class="badge-blood" style="font-size:15px;">${an.price}</span>
                    </div>
                    <p style="margin:5px 0; font-size:14px; opacity:0.8;">${an.desc || 'No descriptions provided.'}</p>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
                        <small>Malik: <strong>${an.owner}</strong></small>
                        <a href="https://wa.me/${an.contact.replace(/[^0-9]/g, '')}?text=Salam, mein aap ka janwar (${an.type}) khareedne mein interested hoon. Details de dain." target="_blank" class="btn btn-wa" style="padding:4px 10px; font-size:12px;">Ghar Baithay Rabta</a>
                    </div>
                </div>
            `;
        });
    }

    // 4. Doctors Scheduler Renderer
    const docs = getSavedList('doctors');
    const dt = document.getElementById('doctorTable').getElementsByTagName('tbody')[0];
    dt.innerHTML = '';
    docs.forEach(d => {
        dt.innerHTML += `<tr>
            <td><strong>${d.name}</strong></td>
            <td>${d.spec}</td>
            <td>${d.time}</td>
            <td><span class="badge-gender">${d.fees}</span></td>
            <td><a href="https://wa.me/${d.contact.replace(/[^0-9]/g, '')}?text=Salam, mein doctor ${d.name} ke sath appointment book karna chahta hoon." target="_blank" class="btn btn-wa" style="padding:4px 8px; font-size:12px;">Book Timing</a></td>
        </tr>`;
    });

    // 5. Rent marketplace
    const rent = getSavedList('rent');
    const rt = document.getElementById('rentTable').getElementsByTagName('tbody')[0];
    rt.innerHTML = '';
    rent.forEach(r => {
        rt.innerHTML += `<tr>
            <td><strong>${r.owner}</strong></td>
            <td>${r.item}</td>
            <td><span class="badge-blood">${r.price}</span></td>
            <td><a href="https://wa.me/${r.contact.replace(/[^0-9]/g, '')}?text=Salam, mujhe rent par aapka tool chahiye: ${r.item}" target="_blank" class="btn btn-wa" style="padding:4px 8px; font-size:12px;">Rent It</a></td>
        </tr>`;
    });

    // 6. Cargo Directory Renderer
    const cargoList = getSavedList('cargo');
    const ct = document.getElementById('cargoTable').getElementsByTagName('tbody')[0];
    ct.innerHTML = '';
    cargoList.forEach(c => {
        ct.innerHTML += `<tr>
            <td><strong>${c.owner}</strong></td>
            <td>${c.vehicle}</td>
            <td><span class="badge-gender">${c.rates}</span></td>
            <td>${c.route}</td>
            <td><a href="https://wa.me/${c.contact.replace(/[^0-9]/g, '')}?text=Salam, mujhe cargo ke liye load booking karwani hai." target="_blank" class="btn btn-wa" style="padding:4px 8px; font-size:12px;">Book Cargo</a></td>
        </tr>`;
    });

    // 7. Tubewell Schedule Renderer
    const tubewells = getSavedList('tubewells');
    const tt = document.getElementById('tubewellTable').getElementsByTagName('tbody')[0];
    tt.innerHTML = '';
    tubewells.forEach(t => {
        tt.innerHTML += `<tr>
            <td><strong>${t.zone}</strong></td>
            <td>${t.time}</td>
            <td><span style="color: green; font-weight: bold;">● ${t.status}</span></td>
        </tr>`;
    });

    // 8. Blood Donation Registry
    const blood = getSavedList('blood');
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

    // 9. Rishta Registry
    const rishtas = getSavedList('rishta');
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

    // 10. Mandi Daily Rates
    const mandi = getSavedList('mandi');
    const mt = document.getElementById('mandiTable').getElementsByTagName('tbody')[0];
    mt.innerHTML = '';
    mandi.forEach(m => {
        mt.innerHTML += `<tr>
            <td><strong>${m.crop}</strong></td>
            <td style="color:var(--primary); font-weight:bold;">${m.gov}</td>
            <td style="color:var(--danger); font-weight:bold;">${m.market}</td>
        </tr>`;
    });
    document.getElementById('weatherAdviceBox').innerText = localStorage.getItem('weather') || "";

    // 11. Store Products (Embroidered Clothes)
    const prods = getSavedList('products');
    const sc = document.getElementById('storeContainer');
    sc.innerHTML = '';
    prods.forEach(p => {
        sc.innerHTML += `
            <div class="store-card">
                <div class="store-img" style="background-image:url('${p.img}')"></div>
                <div class="store-info">
                    <h4>${p.title}</h4>
                    <span class="store-price">${p.price}</span>
                    <a href="https://wa.me/${globalWhatsAppNumber}?text=Salam, mujhe ye kapra khareedna hai: ${p.title}" target="_blank" class="btn btn-wa" style="font-size:13px; width:100%;">Buy on WhatsApp</a>
                </div>
            </div>
        `;
    });
}

// ---------------------- SUBMISSION FUNCTIONS ----------------------

// Submit Announcement for Admin Verification
function submitAnnouncement(event) {
    event.preventDefault();
    const type = document.getElementById('aType').value;
    const sender = document.getElementById('aSender').value;
    const msg = document.getElementById('aMsg').value;

    const pending = getSavedList('pendingAnnouncements');
    pending.push({ id: Date.now(), type, sender, msg });
    localStorage.setItem('pendingAnnouncements', JSON.stringify(pending));

    document.getElementById('aSender').value = '';
    document.getElementById('aMsg').value = '';

    alert("Aapka ailaan safe tarike se admin ko bhej diya gaya hai. Approval ke baad live ho jaye ga!");
    
    if (document.getElementById('adminPanel').style.display === "block") {
        renderAdminPanelLists();
    }
}

// Add Animal to Maweshi Mandi
function addLivestock(event) {
    event.preventDefault();
    const type = document.getElementById('lType').value;
    const breed = document.getElementById('lBreed').value;
    const price = document.getElementById('lPrice').value;
    const owner = document.getElementById('lOwner').value;
    const contact = document.getElementById('lContact').value;
    const desc = document.getElementById('lDesc').value;

    const animals = getSavedList('livestock');
    animals.push({ id: Date.now(), type, breed, price, owner, contact, desc });
    localStorage.setItem('livestock', JSON.stringify(animals));

    document.getElementById('lType').value = '';
    document.getElementById('lBreed').value = '';
    document.getElementById('lPrice').value = '';
    document.getElementById('lOwner').value = '';
    document.getElementById('lContact').value = '';
    document.getElementById('lDesc').value = '';

    renderSite();
    alert("Janwar dastyab list mein shamil kar dia gya hai!");
}

// Add Doctor
function addDoctor(event) {
    event.preventDefault();
    const name = document.getElementById('docName').value;
    const spec = document.getElementById('docSpec').value;
    const time = document.getElementById('docTime').value;
    const fees = document.getElementById('docFees').value;
    const contact = document.getElementById('docContact').value;

    const docs = getSavedList('doctors');
    docs.push({ id: Date.now(), name, spec, time, fees, contact });
    localStorage.setItem('doctors', JSON.stringify(docs));

    document.getElementById('docName').value = '';
    document.getElementById('docSpec').value = '';
    document.getElementById('docTime').value = '';
    document.getElementById('docFees').value = '';
    document.getElementById('docContact').value = '';

    renderSite();
    alert("Doctor registration successful!");
}

// Add Rent Item
function addRentItem(event) {
    event.preventDefault();
    const owner = document.getElementById('rentOwner').value;
    const item = document.getElementById('rentItem').value;
    const price = document.getElementById('rentPrice').value;
    const contact = document.getElementById('rentContact').value;

    const rent = getSavedList('rent');
    rent.push({ id: Date.now(), owner, item, price, contact });
    localStorage.setItem('rent', JSON.stringify(rent));

    document.getElementById('rentOwner').value = '';
    document.getElementById('rentItem').value = '';
    document.getElementById('rentPrice').value = '';
    document.getElementById('rentContact').value = '';

    renderSite();
    alert("Aap ka item Rent list mein add ho gya hai!");
}

// Add Cargo Loader
function addCargo(event) {
    event.preventDefault();
    const owner = document.getElementById('cOwner').value;
    const vehicle = document.getElementById('cVehicle').value;
    const rates = document.getElementById('cRates').value;
    const route = document.getElementById('cRoute').value;
    const contact = document.getElementById('cContact').value;

    const cargo = getSavedList('cargo');
    cargo.push({ id: Date.now(), owner, vehicle, rates, route, contact });
    localStorage.setItem('cargo', JSON.stringify(cargo));

    document.getElementById('cOwner').value = '';
    document.getElementById('cVehicle').value = '';
    document.getElementById('cRates').value = '';
    document.getElementById('cRoute').value = '';
    document.getElementById('cContact').value = '';

    renderSite();
    alert("Cargo service database mein save kar di gayi hai!");
}

// Anonymous Complaint
function submitShikayat(event) {
    event.preventDefault();
    const cat = document.getElementById('shikayatCategory').value;
    const desc = document.getElementById('shikayatDesc').value;

    const complaints = getSavedList('complaints');
    complaints.push({ id: Date.now(), cat, desc });
    localStorage.setItem('complaints', JSON.stringify(complaints));

    document.getElementById('shikayatDesc').value = '';
    alert("🔒 Gumnaam Shikayat Panchayat ko bhej di gayi hai. Safe reporting!");
}

// Add Blood Donor
function addUserBlood(event) {
    event.preventDefault();
    const name = document.getElementById('bName').value;
    const group = document.getElementById('bGroup').value;
    const age = document.getElementById('bAge').value;
    const contact = document.getElementById('bContact').value;

    const blood = getSavedList('blood');
    blood.push({ id: Date.now(), name, group, age, contact });
    localStorage.setItem('blood', JSON.stringify(blood));

    document.getElementById('bName').value = '';
    document.getElementById('bAge').value = '';
    document.getElementById('bContact').value = '';

    renderSite();
    alert("Shukriya! Name register ho gaya.");
}

// Add Shadi Profile
function addUserRishta(event) {
    event.preventDefault();
    const name = document.getElementById('rName').value;
    const gender = document.getElementById('rGender').value;
    const age = document.getElementById('rAge').value;
    const caste = document.getElementById('rCaste').value;
    const job = document.getElementById('rJob').value;
    const contact = document.getElementById('rContact').value;

    const rishta = getSavedList('rishta');
    rishta.push({ id: Date.now(), name, gender, age, caste, job, contact });
    localStorage.setItem('rishta', JSON.stringify(rishta));

    document.getElementById('rName').value = '';
    document.getElementById('rAge').value = '';
    document.getElementById('rCaste').value = '';
    document.getElementById('rJob').value = '';
    document.getElementById('rContact').value = '';

    renderSite();
    alert("Shadi profile safe tarike se save ho gayi.");
}

// ---------------------- ADMIN DASHBOARD WORKFLOWS ----------------------

function loginAdmin() {
    const email = prompt("Admin Gmail enter karein:");
    if (email === "Juttsarkar7466@gmail.com") {
        const password = prompt("Admin Password enter karein:");
        // Naya Password Yahan Set Kiya Hai
        if (password === 'ZAQ!"wsx£$RFVCDE') {
            document.getElementById('adminPanel').style.display = "block";
            renderAdminPanelLists();
            document.getElementById('adminPanel').scrollIntoView();
            alert("Admin Panel successfully unlocked.");
        } else {
            alert("Ghalat Password!");
        }
    } else {
        alert("Ghalat Gmail ID!");
    }
}

function logoutAdmin() {
    document.getElementById('adminPanel').style.display = "none";
    alert("Admin Logout ho chuka hai.");
}

function renderAdminPanelLists() {
    // Top marquee input box loader
    document.getElementById('adminNoticeInput').value = localStorage.getItem('notice') || "";

    // 1. Announcements Queue Render (Approve/Reject)
    const pending = getSavedList('pendingAnnouncements');
    const act = document.getElementById('adminAnnouncementsTable').getElementsByTagName('tbody')[0];
    act.innerHTML = '';
    pending.forEach(p => {
        act.innerHTML += `
            <tr>
                <td><strong>${p.type}</strong></td>
                <td>${p.msg}</td>
                <td>${p.sender}</td>
                <td>
                    <button class="admin-btn-approve" onclick="approveAnnouncement(${p.id})">Approve & Show</button>
                    <button class="admin-btn-del" onclick="deleteItem('pendingAnnouncements', ${p.id})">Reject</button>
                </td>
            </tr>
        `;
    });

    // 2. Anonymous complaints manager (STRICT ACCESS)
    const complaints = getSavedList('complaints');
    const acc = document.getElementById('adminComplaintsTable').getElementsByTagName('tbody')[0];
    acc.innerHTML = '';
    complaints.forEach(c => {
        acc.innerHTML += `<tr>
            <td><strong>${c.cat}</strong></td>
            <td>${c.desc}</td>
            <td><button class="admin-btn-del" onclick="deleteItem('complaints', ${c.id})">Delete Complaint</button></td>
        </tr>`;
    });

    // 3. Solar Schedule Manager
    const tubewells = getSavedList('tubewells');
    const att = document.getElementById('adminTubewellTable').getElementsByTagName('tbody')[0];
    att.innerHTML = '';
    tubewells.forEach(t => {
        att.innerHTML += `<tr>
            <td><strong>${t.zone}</strong> (${t.time}) - Status: ${t.status}</td>
            <td><button class="admin-btn-del" onclick="deleteItem('tubewells', ${t.id})">Remove</button></td>
        </tr>`;
    });

    // 4. Doctors Manager
    const docs = getSavedList('doctors');
    const adt = document.getElementById('adminDoctorTable').getElementsByTagName('tbody')[0];
    adt.innerHTML = '';
    docs.forEach(d => {
        adt.innerHTML += `<tr>
            <td><strong>${d.name}</strong> - ${d.spec}</td>
            <td><button class="admin-btn-del" onclick="deleteItem('doctors', ${d.id})">Delete</button></td>
        </tr>`;
    });

    // 5. Rent Items Manager
    const rent = getSavedList('rent');
    const art = document.getElementById('adminRentTable').getElementsByTagName('tbody')[0];
    art.innerHTML = '';
    rent.forEach(r => {
        art.innerHTML += `<tr>
            <td><strong>${r.item}</strong> - Malik: ${r.owner}</td>
            <td><button class="admin-btn-del" onclick="deleteItem('rent', ${r.id})">Remove</button></td>
        </tr>`;
    });

    // 6. Cargo Services Manager
    const cargo = getSavedList('cargo');
    const acg = document.getElementById('adminCargoTable').getElementsByTagName('tbody')[0];
    acg.innerHTML = '';
    cargo.forEach(c => {
        acg.innerHTML += `<tr>
            <td><strong>${c.owner}</strong> (${c.vehicle})</td>
            <td><button class="admin-btn-del" onclick="deleteItem('cargo', ${c.id})">Delete</button></td>
        </tr>`;
    });

    // 7. Maweshi Mandi Manager
    const animals = getSavedList('livestock');
    const amg = document.getElementById('adminLivestockTable').getElementsByTagName('tbody')[0];
    amg.innerHTML = '';
    animals.forEach(a => {
        amg.innerHTML += `<tr>
            <td><strong>${a.type}</strong> - Breed: ${a.breed} (Price: ${a.price})</td>
            <td><button class="admin-btn-del" onclick="deleteItem('livestock', ${a.id})">Delete</button></td>
        </tr>`;
    });

    // 8. Blood and Rishta Registry
    const blood = getSavedList('blood');
    const abt = document.getElementById('adminBloodRegTable').getElementsByTagName('tbody')[0];
    abt.innerHTML = '';
    blood.forEach(b => {
        abt.innerHTML += `<tr><td><strong>${b.name}</strong> (Group: ${b.group})</td><td><button class="admin-btn-del" onclick="deleteItem('blood', ${b.id})">Delete</button></td></tr>`;
    });

    const rishta = getSavedList('rishta');
    const arr = document.getElementById('adminRishtaRegTable').getElementsByTagName('tbody')[0];
    arr.innerHTML = '';
    rishta.forEach(r => {
        arr.innerHTML += `<tr><td><strong>${r.name}</strong> (${r.gender})</td><td><button class="admin-btn-del" onclick="deleteItem('rishta', ${r.id})">Delete</button></td></tr>`;
    });
}

// Announcement approval pipeline
function approveAnnouncement(id) {
    let pending = getSavedList('pendingAnnouncements');
    let active = getSavedList('activeAnnouncements');
    
    const target = pending.find(p => p.id === id);
    if (target) {
        active.unshift(target); // Latest announcements show first
        pending = pending.filter(p => p.id !== id);
        
        localStorage.setItem('pendingAnnouncements', JSON.stringify(pending));
        localStorage.setItem('activeAnnouncements', JSON.stringify(active));
        
        renderSite();
        renderAdminPanelLists();
        alert("Ailaan live website par publish ho chuka hai!");
    }
}

// Add Solar/Tubewell timing
function addTubewellSchedule() {
    const zone = document.getElementById('tZone').value;
    const time = document.getElementById('tTime').value;
    const status = document.getElementById('tStatus').value || 'Active';

    if (!zone || !time) return alert("Sub parameters lazmi fill karein.");

    const tubewells = getSavedList('tubewells');
    tubewells.push({ id: Date.now(), zone, time, status });
    localStorage.setItem('tubewells', JSON.stringify(tubewells));

    document.getElementById('tZone').value = '';
    document.getElementById('tTime').value = '';
    document.getElementById('tStatus').value = '';

    renderSite();
    renderAdminPanelLists();
    alert("Timing schedule updated!");
}

// Change notice ticker from admin
function updateNotice() {
    const text = document.getElementById('adminNoticeInput').value;
    localStorage.setItem('notice', text);
    renderSite();
    alert("Top notices bar has been successfully updated!");
}

// Global deleter helper
function deleteItem(storageKey, id) {
    let list = getSavedList(storageKey);
    list = list.filter(item => item.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(list));
    renderSite();
    renderAdminPanelLists();
}
