const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Render ka system assigned port auto-pick karega, koi 3000 ka jhanjhat nahi
const PORT = process.env.PORT || 8080; 

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 🗄️ MONGODB CONNECTIVITY LOCK (Data Save Hota Rahega)
const mongoURI = process.env.MONGO_URI;
if (mongoURI) {
    mongoose.connect(mongoURI)
        .then(() => console.log("🔥 MongoDB Atlas Database connected successfully!"))
        .catch(err => console.log("⚠️ Database connection delayed but server kept running: ", err.message));
} else {
    console.log("💡 Running in fallback mode. Please add MONGO_URI in Render Environment Variables.");
}

// Live Status Endpoint
app.get('/api/status', (req, res) => {
    res.json({ 
        status: "online", 
        database: mongoose.connection.readyState === 1 ? "Connected" : "Connecting..." 
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Binds perfectly to Render's internal network routing
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Kohlowala Cloud Engine is now active on Render!`);
});
