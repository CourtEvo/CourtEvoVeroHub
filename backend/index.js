const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json()); // <-- MOVE THIS ABOVE THE ROUTES!

app.use('/api/ai-insights', require('./routes/aiInsights'));

const athleteDevelopmentRoute = require('./routes/athleteDevelopment');
app.use('/api/athlete-development', athleteDevelopmentRoute);

app.get('/', (req, res) => {
    res.send('CourtEvo Vero Hub Backend');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`CourtEvo Vero Backend running on port ${PORT}`);
});
