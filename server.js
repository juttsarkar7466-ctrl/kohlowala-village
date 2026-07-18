const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 🛡️ CRASH PREVENTION: MongoDB Secure Connection Logic
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error("⚠️ WARNING: MONGO_URI is missing inside Environment Variables!");
    console.log("👉 Server is running in LOCAL mode without database connectivity.");
} else {
    mongoose.connect(mongoURI)
    .then(() => console.log("🔥 Connected successfully to MongoDB Atlas!"))
    .catch((err) => {
        console.error("❌ MongoDB Connection Failure: ", err.message);
        console.log("💡 Tip: Check your IP Whitelist status on MongoDB Atlas dashboard.");
    });
}

// Basic Live Route Check
app.get('/api/status', (req, res) => {
    res.json({ 
        status: "online", 
        engine: "Kohlowala High-Performance Engine v2",
        theme: "Shahi Dark Mode" 
    });
});

// App Engine Initialization
app.listen(PORT, () => {
    console.log(`🚀 Kohlowala Engine online and running smoothly on port ${PORT}`);
});
