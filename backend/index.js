const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Render assigns a dynamic port, so we must use process.env.PORT
const PORT = process.env.PORT || 5000;

const SPREADSHEET_ID = '1Vm162mhbLlqAcuxXldczUtJQ1neFQTBw_AnQNhqefCg'; 

// --- AUTHENTICATION LOGIC CHANGED FOR RENDER ---
let auth;
if (process.env.GOOGLE_CREDENTIALS) {
    // PRODUCTION: Read from Environment Variable
    auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS),
        scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });
} else {
    // LOCAL DEVELOPMENT: Read from file
    auth = new google.auth.GoogleAuth({
        keyFile: 'secrets.json',
        scopes: 'https://www.googleapis.com/auth/spreadsheets',
    });
}

const calculateTraitScore = (responses, startId, endId) => {
    let sum = 0;
    let count = 0;
    for (let i = startId; i <= endId; i++) {
        sum += (responses[i] || 0);
        count++;
    }
    return (sum / count).toFixed(1);
};

app.post('/api/submit', async (req, res) => {
    try {
        const { user, responses } = req.body;

        const openness = calculateTraitScore(responses, 1, 6);
        const conscientiousness = calculateTraitScore(responses, 7, 12);
        const extraversion = calculateTraitScore(responses, 13, 18);
        const agreeableness = calculateTraitScore(responses, 19, 24);
        const stability = calculateTraitScore(responses, 25, 30);

        const rowData = [
            new Date().toLocaleString(),
            user.name,
            user.cnic,
            user.dealership,
            user.city,
            openness,
            conscientiousness,
            extraversion,
            agreeableness,
            stability
        ];

        const client = await auth.getClient();
        const googleSheets = google.sheets({ version: 'v4', auth: client });

        await googleSheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A:J',
            valueInputOption: 'USER_ENTERED',
            resource: { values: [rowData] },
        });

        console.log("Data saved for:", user.name);
        res.status(200).json({ message: "Success" });

    } catch (error) {
        console.error("Error saving to sheet:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});