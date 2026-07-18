window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-theme');
    }
    loadDataPipeline();
});

function toggleDarkMode() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

// Global state fetcher
async function loadDataPipeline() {
    try {
        const res = await fetch('/api/all-data');
        const data = await res.json();
        renderFrontend(data);
    } catch (err) { console.log("Engine pipe error: ", err); }
}

function renderFrontend(items) {
    const mandi = document.getElementById('mandiContainer');
    const market = document.getElementById('marketContainer');
    const tubewell = document.getElementById('tubewellContainer');
    const doctor = document.getElementById('doctorContainer');
    const blood = document.getElementById('bloodContainer');
    const rishta = document.getElementById('rishtaContainer');
    const admDel = document.getElementById('adminDeleteList');

    // Reset Containers
    mandi.innerHTML = ''; market.innerHTML = ''; tubewell.innerHTML = '';
    doctor.innerHTML = ''; blood.innerHTML = ''; rishta.innerHTML = ''; admDel.innerHTML = '';

    items.forEach(item => {
        const id = item._id;
        const d = item.data;

        if (item.type === 'mandi') {
            mandi.innerHTML += `<tr><td><b>${d.crop}</b></td><td>${d.gov}</td><td><span class="badge-blood">${d.market}</span></td></tr>`;
        }
        else if (item.type === 'livestock') {
            market.innerHTML += `<div class="store-card"><div class="store-info"><h4>${d.breed} (${d.livestockType})</h4><p class="badge-blood">${d.price}</p><p>Owner: ${d.owner}</p></div></div>`;
        }
        else if (item.type === 'complaint') {
            admDel.innerHTML += `<tr><td><b>[${d.cat}]</b> ${d.desc}</td><td><button class="admin-btn-del" onclick="deleteRecord('${id}')">Resolve / Delete</button></td></tr>`;
        }
        // Admin Dynamic Management mapping entries inside the loop
        if(document.getElementById('adminPanel').style.display === 'block') {
            if(item.type !== 'complaint') {
                admDel.innerHTML += `<tr><td>${item.type.toUpperCase()}: ${d.crop || d.breed || 'Listing'}</td><td><button class="admin-btn-del" onclick="deleteRecord('${id}')">Remove</button></td></tr>`;
            }
        }
    });
}

// Form Submission Subroutines
async function addMandiData() {
    const crop = document.getElementById('adCrop').value;
    const gov = document.getElementById('adGovRate').value;
    const market = document.getElementById('adMktRate').value;
    await fetch('/api/add-entry', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ type: 'mandi', data: { crop, gov, market } })
    });
    alert("Mandi rate broadcasted successfully!"); loadDataPipeline();
}

async function addLivestockData() {
    const livestockType = document.getElementById('adLvType').value;
    const price = document.getElementById('adLvPrice').value;
    const owner = document.getElementById('adLvOwner').value;
    await fetch('/api/add-entry', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ type: 'livestock', data: { livestockType, breed: livestockType, price, owner } })
    });
    alert("Livestock added to active market!"); loadDataPipeline();
}

async function submitComplaint(e) {
    e.preventDefault();
    const cat = document.getElementById('compCat').value;
    const desc = document.getElementById('compDesc').value;
    await fetch('/api/add-entry', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ type: 'complaint', data: { cat, desc } })
    });
    alert("Shikayat darj ho chuki hai!"); e.target.reset(); loadDataPipeline();
}

async function deleteRecord(id) {
    await fetch(`/api/delete-entry/${id}`, { method: 'DELETE' });
    alert("Record erased!"); loadDataPipeline();
}

// Secure Login Shell
function loginAdmin() {
    const email = prompt("Admin Login ID:");
    if (email === "Juttsarkar7466@gmail.com") {
        if (prompt("Secure Key:") === 'ZAQ!"wsx£$RFVCDE') {
            document.getElementById('adminPanel').style.display = "block";
            loadDataPipeline();
        } else alert("Access Blocked!");
    }
}
function logoutAdmin() {
    document.getElementById('adminPanel').style.display = "none";
}
