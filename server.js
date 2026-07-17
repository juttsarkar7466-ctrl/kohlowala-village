const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Static Files Serve karein (public folder se HTML/CSS/JS uthayega)
app.use(express.static('public'));

// MongoDB Connection Link (.env se aayega)
const mongoURI = process.env.MONGO_URI;
mongoose.connect(mongoURI)
  .then(() => console.log("MongoDB connected successfully!"))
  .catch(err => console.error("Database connection error:", err));

// --- MONGOOSE SCHEMAS & MODELS ---
const AnnouncementSchema = new mongoose.Schema({
  type: String, sender: String, msg: String, approved: { type: Boolean, default: false }
});
const Announcement = mongoose.model('Announcement', AnnouncementSchema);

const ComplaintSchema = new mongoose.Schema({
  cat: String, desc: String, date: { type: Date, default: Date.now }
});
const Complaint = mongoose.model('Complaint', ComplaintSchema);

const DoctorSchema = new mongoose.Schema({ name: String, spec: String, time: String, fees: String, contact: String });
const Doctor = mongoose.model('Doctor', DoctorSchema);

const RentSchema = new mongoose.Schema({ owner: String, item: String, price: String, contact: String });
const RentItem = mongoose.model('RentItem', RentSchema);

const CargoSchema = new mongoose.Schema({ owner: String, vehicle: String, rates: String, route: String, contact: String });
const Cargo = mongoose.model('Cargo', CargoSchema);

const LivestockSchema = new mongoose.Schema({ type: String, breed: String, price: String, owner: String, contact: String, desc: String });
const Livestock = mongoose.model('Livestock', LivestockSchema);

const BloodSchema = new mongoose.Schema({ name: String, group: String, age: Number, contact: String });
const BloodDonor = mongoose.model('BloodDonor', BloodSchema);

const RishtaSchema = new mongoose.Schema({ name: String, gender: String, age: Number, caste: String, job: String, contact: String });
const Rishta = mongoose.model('Rishta', RishtaSchema);

const TubewellSchema = new mongoose.Schema({ zone: String, time: String, status: String });
const Tubewell = mongoose.model('Tubewell', TubewellSchema);

// --- API ROUTES (GET & POST) ---

// Generic Helper to setup Routes
const setupModelRoutes = (routePath, Model) => {
  app.get(`/api/${routePath}`, async (req, res) => {
    try { res.json(await Model.find()); } catch (err) { res.status(500).json({ error: err.message }); }
  });
  app.post(`/api/${routePath}`, async (req, res) => {
    try { const doc = new Model(req.body); await doc.save(); res.json(doc); } catch (err) { res.status(500).json({ error: err.message }); }
  });
};

setupModelRoutes('doctors', Doctor);
setupModelRoutes('rent', RentItem);
setupModelRoutes('cargo', Cargo);
setupModelRoutes('livestock', Livestock);
setupModelRoutes('blood', BloodDonor);
setupModelRoutes('rishta', Rishta);
setupModelRoutes('tubewells', Tubewell);

// Announcements Special Routes (Approval system ke liye)
app.get('/api/announcements', async (req, res) => {
  try { res.json(await Announcement.find({ approved: true })); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.post('/api/announcements', async (req, res) => {
  try { const ann = new Announcement(req.body); await ann.save(); res.json({ message: "Pending Approval" }); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/admin/pending', async (req, res) => {
  try { res.json(await Announcement.find({ approved: false })); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/admin/approve/:id', async (req, res) => {
  try { await Announcement.findByIdAndUpdate(req.params.id, { approved: true }); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); }
});

// Complaints (Admin Only)
app.post('/api/complaints', async (req, res) => {
  try { const comp = new Complaint(req.body); await comp.save(); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.get('/api/admin/complaints', async (req, res) => {
  try { res.json(await Complaint.find()); } catch (err) { res.status(500).json({ error: err.message }); }
});

// Admin Global Delete API
app.delete('/api/admin/:collection/:id', async (req, res) => {
  const { collection, id } = req.params;
  try {
    let Model;
    if (collection === 'pendingAnnouncements' || collection === 'activeAnnouncements') Model = Announcement;
    else if (collection === 'complaints') Model = Complaint;
    else if (collection === 'doctors') Model = Doctor;
    else if (collection === 'rent') Model = RentItem;
    else if (collection === 'cargo') Model = Cargo;
    else if (collection === 'livestock') Model = Livestock;
    else if (collection === 'blood') Model = BloodDonor;
    else if (collection === 'rishta') Model = Rishta;
    else if (collection === 'tubewells') Model = Tubewell;

    if (!Model) return res.status(400).json({ error: "Invalid collection" });
    await Model.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Port configuration
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));