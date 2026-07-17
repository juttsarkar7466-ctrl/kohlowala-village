const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 🔌 MongoDB Connection
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log('🔥 Connected to MongoDB Atlas!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// 📝 --- EXISTING & NEW MONGOOSE SCHEMAS ---
const Notice = mongoose.model('Notice', new mongoose.Schema({ notice: String }));
const Doctor = mongoose.model('Doctor', new mongoose.Schema({ name: String, spec: String, time: String, fees: String, contact: String }));
const Rent = mongoose.model('Rent', new mongoose.Schema({ owner: String, item: String, price: String, contact: String }));
const Cargo = mongoose.model('Cargo', new mongoose.Schema({ owner: String, vehicle: String, rates: String, route: String, contact: String }));
const Livestock = mongoose.model('Livestock', new mongoose.Schema({ type: String, breed: String, price: String, owner: String, contact: String, desc: String }));
const Blood = mongoose.model('Blood', new mongoose.Schema({ name: String, group: String, age: String, contact: String }));
const Rishta = mongoose.model('Rishta', new mongoose.Schema({ name: String, gender: String, age: String, caste: String, job: String, contact: String }));
const Tubewell = mongoose.model('Tubewell', new mongoose.Schema({ zone: String, time: String, status: { type: String, default: 'Active' } }));
const Complaint = mongoose.model('Complaint', new mongoose.Schema({ cat: String, desc: String, date: { type: Date, default: Date.now } }));
const Announcement = mongoose.model('Announcement', new mongoose.Schema({ type: String, msg: String, sender: String, approved: { type: Boolean, default: false } }));

// 🌟 NEW SELECTED FEATURES SCHEMAS
const Gallery = mongoose.model('Gallery', new mongoose.Schema({ title: String, imgUrl: String, date: { type: Date, default: Date.now } }));
const Emergency = mongoose.model('Emergency', new mongoose.Schema({ name: String, role: String, contact: String }));
const Olx = mongoose.model('Olx', new mongoose.Schema({ title: String, price: String, owner: String, contact: String, desc: String }));
const Poll = mongoose.model('Poll', new mongoose.Schema({ question: String, yesVotes: { type: Number, default: 0 }, noVotes: { type: Number, default: 0 }, active: { type: Boolean, default: true } }));
const Event = mongoose.model('Event', new mongoose.Schema({ title: String, date: String, location: String }));
const Hunar = mongoose.model('Hunar', new mongoose.Schema({ name: String, skill: String, contact: String }));
const Job = mongoose.model('Job', new mongoose.Schema({ title: String, company: String, salary: String, contact: String }));
const Chat = mongoose.model('Chat', new mongoose.Schema({ username: String, msg: String, date: { type: Date, default: Date.now } }));
const Committee = mongoose.model('Committee', new mongoose.Schema({ name: String, total: String, monthly: String, winner: String }));

// 🚀 --- API ROUTES ---
const makeRoute = (path, Model) => {
  app.get(`/api/${path}`, async (req, res) => res.json(await Model.find()));
  app.post(`/api/${path}`, async (req, res) => res.json(await Model.create(req.body)));
};

// Auto Generating CRUD Endpoints
makeRoute('doctors', Doctor); makeRoute('rent', Rent); makeRoute('cargo', Cargo);
makeRoute('livestock', Livestock); makeRoute('blood', Blood); makeRoute('rishta', Rishta);
makeRoute('tubewells', Tubewell); makeRoute('gallery', Gallery); makeRoute('emergency', Emergency);
makeRoute('olx', Olx); makeRoute('events', Event); makeRoute('hunar', Hunar);
makeRoute('jobs', Job); makeRoute('committees', Committee);

// Notice Ticker
app.get('/api/notice', async (req, res) => res.json(await Notice.findOne() || { notice: "Welcome to Kohlowala Portal" }));
app.put('/api/notice', async (req, res) => {
  let data = await Notice.findOne();
  if (data) { data.notice = req.body.notice; await data.save(); }
  else { data = await Notice.create({ notice: req.body.notice }); }
  res.json({ success: true, notice: data.notice });
});

// Panchayat Voting Poll Logic
app.get('/api/polls', async (req, res) => res.json(await Poll.findOne({ active: true }) || { question: "Abhi koi poll active nahi hai.", yesVotes: 0, noVotes: 0 }));
app.post('/api/admin/polls', async (req, res) => {
  await Poll.updateMany({}, { active: false }); // Purane polls close
  res.json(await Poll.create({ question: req.body.question }));
});
app.post('/api/polls/vote', async (req, res) => {
  const { type } = req.body;
  const currentPoll = await Poll.findOne({ active: true });
  if (currentPoll) {
    if (type === 'yes') currentPoll.yesVotes += 1;
    else currentPoll.noVotes += 1;
    await currentPoll.save();
    return res.json(currentPoll);
  }
  res.status(400).json({ error: "No active poll" });
});

// Chatroom Logic (REST Polling for heavy performance optimization on Render)
app.get('/api/chat', async (req, res) => res.json(await Chat.find().sort({ date: -1 }).limit(15)));
app.post('/api/chat', async (req, res) => res.json(await Chat.create(req.body)));

// Announcements & Complaints
app.get('/api/announcements', async (req, res) => res.json(await Announcement.find({ approved: true })));
app.post('/api/announcements', async (req, res) => res.json(await Announcement.create({ ...req.body, approved: false })));
app.get('/api/admin/pending', async (req, res) => res.json(await Announcement.find({ approved: false })));
app.put('/api/admin/approve/:id', async (req, res) => res.json(await Announcement.findByIdAndUpdate(req.params.id, { approved: true })));
app.post('/api/complaints', async (req, res) => res.json(await Complaint.create(req.body)));
app.get('/api/admin/complaints', async (req, res) => res.json(await Complaint.find().sort({ date: -1 })));

// Mandi, Products & Weather Static Fallbacks
app.get('/api/mandi', (req, res) => res.json([{ crop: "Gandum", gov: "Rs. 3,900", market: "Rs. 4,100" }, { crop: "Basmati Paddy", gov: "Rs. 7,200", market: "Rs. 7,500" }]));
app.get('/api/products', (req, res) => res.json([{ title: "Dasti Karhai Suit", price: "Rs. 4,500", img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=300&q=80" }]));
app.get('/api/weather', (req, res) => res.json({ weather: "Kohlowala ka mosam agle do din tak bilkul saaf rahega." }));

// Global Delete Mapping for Dashboard Control
const modelsMap = {
  doctors: Doctor, rent: Rent, cargo: Cargo, livestock: Livestock, blood: Blood, rishta: Rishta,
  tubewells: Tubewell, complaints: Complaint, pendingAnnouncements: Announcement,
  gallery: Gallery, emergency: Emergency, olx: Olx, events: Event, hunar: Hunar, jobs: Job, committees: Committee
};
app.delete('/api/admin/:collection/:id', async (req, res) => {
  const Model = modelsMap[req.params.collection];
  if (Model) { await Model.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  else res.status(400).json({ error: "Invalid entity type" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Kohlowala Portal online on port ${PORT}`));
