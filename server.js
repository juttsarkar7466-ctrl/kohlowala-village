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

// MongoDB Connection
const mongoURI = process.env.MONGO_URI;
if (mongoURI) {
    mongoose.connect(mongoURI)
        .then(() => console.log("🔥 Connected to Kohlowala Core Database!"))
        .catch(err => console.log("⚠️ DB Engine Delay: ", err.message));
}

// ---- MONGOOSE SCHEMAS FOR 10 UPDATES ----
const CommonSchema = new mongoose.Schema({ type: String, data: Object }, { strict: false });
const DataModel = mongoose.model('VillageData', CommonSchema);

// Base API Routes
app.get('/api/all-data', async (req, res) => {
    try {
        const records = await DataModel.find({});
        res.json(records);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/add-entry', async (req, res) => {
    try {
        const newEntry = new DataModel(req.body);
        await newEntry.save();
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/delete-entry/:id', async (req, res) => {
    try {
        await DataModel.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Fallback routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Kohlowala Village Live on Port ${PORT}`);
});
