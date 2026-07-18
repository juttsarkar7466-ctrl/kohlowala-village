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
            // TOGGLE OFF FEATURE: Agar admin ne khali text bheja hai toh ticker database se remove ho chuka hai, mazeed save na karein
            if (data && data.text === "") {
                return res.json({ success: true, cleared: true });
            }
        }

        const entry = new VillageRegistry({ type, data });
        await entry.save();
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});
