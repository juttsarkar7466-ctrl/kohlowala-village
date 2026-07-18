// 1. PURANI FUNCTION KO IS SE REPLACE KAREIN
async function updateAdminAnnouncement(type) {
    const inputElement = type === 'announcement' ? document.getElementById('adAnnounceText') : document.getElementById('adEmergencyText');
    const text = inputElement.value.trim();
    
    // Send data to engine and strictly wait for verification status
    const success = await executeGlobalPayloadPost(type, { text });
    
    if (success) {
        if (text === "") {
            alert(`${type === 'announcement' ? 'General Ticker' : 'Emergency Alert'} ko kamyaabi se hata (clear) diya gaya hai.`);
        } else {
            alert(`${type === 'announcement' ? 'General Ticker' : 'Emergency Alert'} poore pind ke liye live ho gaya hai!`);
        }
        inputElement.value = ''; // Input area ko clean kar dein
    }
}

// 2. RENDER SYSTEM VIEWS KE ANDAR TICKER SECTIONS KO IS SE SECURE KAREIN
// (Yeh line renderSystemViews function ke shuruat mein jahan tickers check hotay hain wahan lagayein)
const emergencyDoc = logs.find(l => l.type === 'emergency');
const alertBox = document.getElementById('emergencyAlertBox');
if (emergencyDoc && emergencyDoc.data && emergencyDoc.data.text) {
    alertBox.innerText = emergencyDoc.data.text;
    alertBox.style.display = 'block';
} else { 
    alertBox.style.display = 'none'; 
}

const announceDoc = logs.find(l => l.type === 'announcement');
const announceBox = document.getElementById('dynamicAnnouncementBar');
if (announceDoc && announceDoc.data && announceDoc.data.text) {
    announceBox.innerText = announceDoc.data.text;
    announceBox.style.display = 'block';
} else { 
    announceBox.style.display = 'none'; 
}
