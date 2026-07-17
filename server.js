const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Static Files Serve (public folder se HTML/CSS/JS uthayega)
app.use(express.static('public'));

// Local In-Memory Database (Taake bina MongoDB ke 100% error-free chale)
let db = {
  notice: "📢 Ailaan-e-Aam: Kal subah 9:00 baje se dopehar 12:00 baje tak pani ki supply band rahegi. Khasoosi Kisaan Card aur BISP ke naye forms aa chuke hain, jald apply karein!",
  weather: "Sunehri dhaan (Chawal) ki kasht ke liye pani ka munasib istamal karein. Agle do din barish ka koi imkaan nahi.",
  doctors: [
    { _id: "doc1", name: "Dr. Muhammad Yasir", spec: "General Physician", time: "Mon, Wed, Fri (4 PM - 7 PM)", fees: "Free", contact: "03001234567" },
    { _id: "doc2", name: "Dr. Amna Jutt", spec: "Gynecologist", time: "Daily (10 AM - 1 PM)", fees: "Rs. 300", contact: "03217654321" }
  ],
  rent: [
    { _id: "rent1", owner: "Sardar Ali Raza", item: "Massey Ferguson Tractor", price: "Rs. 1,500/hour", contact: "03123456789" },
    { _id: "rent2", owner: "Zafar Cheema", item: "Wheat Thresher", price: "Rs. 3,000/day", contact: "03019876543" }
  ],
  cargo: [
    { _id: "cargo1", owner: "Boota Loader", vehicle: "Chingchi Rickshaw (Loader)", rates: "Rs. 500 per trip (Shehar tak)", route: "Kohlowala se Gujranwala Mandi", contact: "03451234567" }
  ],
  livestock: [
    { _id: "live1", type: "Bakri (Goat)", breed: "Kamori", price: "Rs. 45,000", owner: "Karamat Ali", contact: "03001234567", desc: "Ghar ki pali hui bakri, bilkul tandurust hai." }
  ],
  blood: [
    { _id: "blood1", name: "Ali Raza Jutt", group: "O+", age: "24", contact: "+393297697888" }
  ],
  rishta: [
    { _id: "rish1", name: "Asif Jutt", gender: "Larka (Male)", age: "28", caste: "Jutt", job: "Business (Gujranwala)", contact: "+393297697888" }
  ],
  tubewells: [
    { _id: "tube1", zone: "Zone A (Mashriqi Khet)", time: "Solar: 9:00 AM - 1:00 PM", status: "Active" },
    { _id: "tube2", zone: "Zone B (Maghribi Arazi)", time: "Solar: 1:00 PM - 4:00 PM", status: "Active" }
  ],
  complaints: [
    { _id: "comp1", cat: "Bijli (Electricity)", desc: "Main Transformer se oil leak ho raha hai jis ki waja se light bar bar band ho rahi hai." }
  ],
  announcements: [
    { _id: "ann1", type: "Pani Bandish", msg: "Masjid ke bore ki murammat ki waja se aaj shaam ka paani thora dair se aayega.", sender: "Panchayat", approved: true }
  ],
  mandi: [
    { _id: "m1", crop: "Gandum (Wheat)", gov: "Rs. 3,900", market: "Rs. 4,100" },
    { _id: "m2", crop: "Chawal (Basmati Paddy)", gov: "Rs. 7,200", market: "Rs. 7,500" }
  ],
  products: [
    { _id: "p1", title: "Nafees Dasti Karhai Suit", price: "Rs. 4,500", img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80" }
  ]
};

// Unique ID Generator Helper
const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

// --- API ROUTES ---

// Notice & Weather APIs
app.get('/api/notice', (req, res) => res.json({ notice: db.notice }));
app.put('/api/notice', (req, res) => {
  db.notice = req.body.notice;
  res.json({ success: true, notice: db.notice });
});
app.get('/api/weather', (req, res) => res.json({ weather: db.weather }));
app.get('/api/mandi', (req, res) => res.json(db.mandi));
app.get('/api/products', (req, res) => res.json(db.products));

// Generic Routes Configuration
const setupRoutes = (routePath, collectionName) => {
  app.get(`/api/${routePath}`, (req, res) => res.json(db[collectionName]));
  app.post(`/api/${routePath}`, (req, res) => {
    const newItem = { _id: generateId(), ...req.body };
    db[collectionName].push(newItem);
    res.json(newItem);
  });
};

setupRoutes('doctors', 'doctors');
setupRoutes('rent', 'rent');
setupRoutes('cargo', 'cargo');
setupRoutes('livestock', 'livestock');
setupRoutes('blood', 'blood');
setupRoutes('rishta', 'rishta');
setupRoutes('tubewells', 'tubewells');

// Announcements Handling
app.get('/api/announcements', (req, res) => {
  res.json(db.announcements.filter(a => a.approved === true));
});
app.post('/api/announcements', (req, res) => {
  const newAnn = { _id: generateId(), ...req.body, approved: false };
  db.announcements.push(newAnn);
  res.json({ message: "Pending Approval" });
});
app.get('/api/admin/pending', (req, res) => {
  res.json(db.announcements.filter(a => a.approved === false));
});
app.put('/api/admin/approve/:id', (req, res) => {
  const ann = db.announcements.find(a => a._id === req.params.id);
  if (ann) ann.approved = true;
  res.json({ success: true });
});

// Complaints Handling
app.post('/api/complaints', (req, res) => {
  const newComp = { _id: generateId(), ...req.body, date: new Date() };
  db.complaints.push(newComp);
  res.json({ success: true });
});
app.get('/api/admin/complaints', (req, res) => res.json(db.complaints));

// Admin Global Delete API
app.delete('/api/admin/:collection/:id', (req, res) => {
  const { collection, id } = req.params;
  let target = collection;
  if (collection === 'pendingAnnouncements' || collection === 'activeAnnouncements') target = 'announcements';

  if (db[target]) {
    db[target] = db[target].filter(item => item._id !== id);
    res.json({ success: true });
  } else {
    res.status(400).json({ error: "Invalid collection" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running smoothly on port ${PORT}`));
