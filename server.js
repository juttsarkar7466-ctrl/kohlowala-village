const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const mongoURI = process.env.MONGO_URI;
if (mongoURI) {
    mongoose.connect(mongoURI)
        .then(() => console.log("🔥 Kohlowala Database Sync Active."))
        .catch(err => console.log("⚠️ Database Error: ", err.message));
}

const UltimateSchema = new mongoose.Schema({
    type: String,
    data: Object,
    createdAt: { type: Date, default: Date.now }
}, { strict: false });

const VillageRegistry = mongoose.model('VillageRegistryV3', UltimateSchema);

// 🧹 15 Days Auto Chat Eraser Engine
setInterval(async () => {
    try {
        const expiryLimit = new Date();
        expiryLimit.setDate(expiryLimit.getDate() - 15);
        await VillageRegistry.deleteMany({ type: 'chat', createdAt: { $lt: expiryLimit } });
    } catch(err) { console.log("Cleaner active status."); }
}, 300000);

// Live Mandi
app.get('/api/live-mandi', (req, res) => {
    res.json([
        { crop: "🌾 Gandum (Wheat) 40KG", gov: "Rs. 3,900", market: "Rs. 4,180" },
        { crop: "🌾 Basmati Paddy (Chawal)", gov: "Rs. 7,200", market: "Rs. 7,490" },
        { crop: "🍅 Tamatar Gujranwala Mandi", gov: "Rs. 120", market: "Rs. 140" },
        { crop: "🌻 Premium Cooking Oil 1Ltr", gov: "Rs. 450", market: "Rs. 485" }
    ]);
});

// CRICKET TOURNAMENT APPROVAL ENDPOINT
app.put('/api/hub/approve/:id', async (req, res) => {
    try {
        const match = await VillageRegistry.findById(req.params.id);
        if (match) {
            match.data.status = 'approved';
            match.markModified('data');
            await match.save();
            res.json({ success: true });
        } else {
            res.status(404).json({ error: "Match log entry not found" });
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/hub', async (req, res) => {
    try {
        const logs = await VillageRegistry.find({});
        res.json(logs);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/hub', async (req, res) => {
    try {
        if (req.body.type === 'vote') {
            const poll = await VillageRegistry.findOne({ type: 'poll' });
            if (poll) {
                if (req.body.voteType === 'yes') poll.data.yesCount = (poll.data.yesCount || 0) + 1;
                if (req.body.voteType === 'no') poll.data.noCount = (poll.data.noCount || 0) + 1;
                poll.markModified('data'); await poll.save();
                return res.json({ success: true });
            }
        }
        if (req.body.type === 'emergency' || req.body.type === 'poll') {
            await VillageRegistry.deleteMany({ type: req.body.type });
        }
        const entry = new VillageRegistry(req.body);
        await entry.save();
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/hub/:id', async (req, res) => {
    try {
        await VillageRegistry.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Node operational on port ${PORT}`));
