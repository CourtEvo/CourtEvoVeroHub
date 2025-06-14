const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Example: reading static JSON from data_integration/processed_data
router.get('/', (req, res) => {
    const filePath = path.join(__dirname, '..', '..', 'data_integration', 'processed_data', 'athleteDevelopment.json');
    fs.readFile(filePath, (err, data) => {
        if (err) return res.status(500).json({ error: 'Data not found' });
        res.json(JSON.parse(data));
    });
});

module.exports = router;
