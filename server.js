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
        .then(() => console.log("🔥 Kohlowala Cluster Database Active Connected."))
        .catch(err => console.log("⚠️ DB Error: ", err.message));
}

const GlobalRegistrySchema = new mongoose.Schema({
    type: String,
    data: Object,
    createdAt: { type: Date, default: Date.now }
}, { strict: false });

const VillageRegistry = mongoose.model('KohlowalaFinalRegistry', GlobalRegistrySchema);

// 🛡️ Chat Smart Filter List (Manners Mode)
const bannedWords = [/kamina/gi, /bakwas/gi, /jhoot/gi, /dhoka/gi, /fraud/gi, /unpadh/gi, /kutta/gi];

// 🧹 15 Days Auto Chat Eraser Engine
setInterval(async () => {
    try {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() - 15);
        await VillageRegistry.deleteMany({ type: 'chat', createdAt: { $lt: expiry } });
    } catch(err) { console.log("Cleaner active status logs."); }
}, 300000);

// Live Mandi Simulation Route
app.get('/api/live-mandi', (req, res) => {
    res.json([
        { crop: "🌾 Gandum (Wheat) 40KG", gov: "Rs. 3,900", market: "Rs. 4,180" },
        { crop: "🌾 Basmati Paddy (Chawal)", gov: "Rs. 7,200", market: "Rs. 7,490" },
        { crop: "🍅 Tamatar Gujranwala Mandi", gov: "Rs. 120", market: "Rs. 140" },
        { crop: "🌻 Premium Cooking Oil 1Ltr", gov: "Rs. 450", market: "Rs. 485" }
    ]);
});

// 🌦️ Kisaan Automated Weather Proxy Interface Engine
app.get('/api/weather-advisory', async (req, res) => {
    try {
        const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=32.1617&longitude=74.1883&current=temperature_2m,rain,weather_code');
        const data = await response.json();
        
        const temp = data.current.temperature_2m;
        const isRaining = data.current.rain > 0;
        let advice = "🌾 Fasal ki aam dekh-bhaal karein. Paani time par lagayein.";

        if (isRaining) {
            advice = "🌧️ Kohlowala Alert: Gujranwala region mein barish ho rahi hai! Fasal ko abhi paani mat lagayein aur spray rok dain.";
        } else if (temp > 35) {
            advice = "☀️ Shadeed Garmi: Temperature zizada hai. Gandum/Chawal ki fasal ko shaam ke waqt paani dain taake nami barkarar rahe.";
        } else if (temp < 15) {
            advice = "❄️ Dhund aur Sardi: Fasal ko Kora (frost) se bachane ke liye haseeb-e-zaroorat halka paani lagayein.";
        }

        res.json({ temp, advice, code: data.current.weather_code });
    } catch (err) {
        res.json({ temp: "N/A", advice: "🌾 Mandi updates check karein aur fasal ko sahi waqt par khad dain.", code: 0 });
    }
});

// GET Global Data Pipeline
app.get('/api/hub', async (req, res) => {
    try {
        const logs = await VillageRegistry.find({});
        res.json(logs);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST Global Handling Data Hub (Fixed Singletons for Announcements & Emergency Tickers)
app.post('/api/hub', async (req, res) => {
    try {
        const { type, data } = req.body;

        // 🚫 Fraud Control: Blacklist Number Verification Engine
        if (data && data.contact) {
            const cleanNum = data.contact.replace(/[^0-9]/g, '');
            const isBanned = await VillageRegistry.findOne({ type: 'blacklist', 'data.number': cleanNum });
            if (isBanned) {
                return res.status(403).json({ error: "BLOCKED: Aapka number system se ban kiya gaya hai." });
            }
        }

        // 🛡️ Manners Mode Filter Execution
        if (type === 'chat') {
            let cleanMsg = data.msg;
            bannedWords.forEach(pattern => {
                cleanMsg = cleanMsg.replace(pattern, "***");
            });
            data.msg = cleanMsg;
        }

        // Handle structural singletons (Announcement/Festival/Emergency)
        if (['emergency', 'announcement', 'festival'].includes(type)) {
            await VillageRegistry.deleteMany({ type });
            // Agar text empty bheja jaye to data clear ho chuka hai, save na karein
            if (data && data.text === "") {
                return res.json({ success: true, cleared: true });
            }
        }

        const entry = new VillageRegistry({ type, data });
        await entry.save();
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT Document Approvals Route Engine
app.put('/api/hub/approve/:id', async (req, res) => {
    try {
        const doc = await VillageRegistry.findById(req.params.id);
        if (doc) {
            doc.data.status = 'approved';
            doc.markModified('data');
            await doc.save();
            res.json({ success: true });
        } else {
            res.status(404).json({ error: "Document log not found" });
        }
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE Entry Action Trigger
app.delete('/api/hub/:id', async (req, res) => {
    try {
        await VillageRegistry.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 🧹 Master Admin Clean Trigger Router
app.post('/api/hub/clear-expired', async (req, res) => {
    try {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() - 30);
        await VillageRegistry.deleteMany({ 
            type: { $in: ['marketplace', 'carpool', 'lostfound'] }, 
            createdAt: { $lt: targetDate } 
        });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Kohlowala Core Hub Online: ${PORT}`));
