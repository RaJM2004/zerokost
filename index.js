const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Ensure the data directory exists
const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'cookie-consents.json');

async function ensureDataDirectory() {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Initialize empty JSON file if it doesn't exist
async function initializeDataFile() {
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, '[]', 'utf8');
  }
}

// Cookie consent endpoint
app.post('/api/cookie-consent', async (req, res) => {
  try {
    const { timestamp, userAgent, policyAccepted, policyText } = req.body;
    const ipAddress = req.ip;

    const consentData = {
      ipAddress,
      timestamp,
      userAgent,
      policyAccepted,
      policyText,
      consentVersion: '1.0'
    };

    // Read existing data
    const data = JSON.parse(await fs.readFile(dataFile, 'utf8'));
    
    // Add new consent
    data.push(consentData);

    // Save updated data
    await fs.writeFile(dataFile, JSON.stringify(data, null, 2), 'utf8');

    res.status(200).json({ message: 'Cookie consent saved successfully' });
  } catch (error) {
    console.error('Error saving cookie consent:', error);
    res.status(500).json({ error: 'Failed to save cookie consent' });
  }
});

// Initialize the server
async function startServer() {
  await ensureDataDirectory();
  await initializeDataFile();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);