import fs from 'fs/promises';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const dataFile = path.join(dataDir, 'cookie-consents.json');

async function ensureDataDirectory() {
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function initializeDataFile() {
  try {
    await fs.access(dataFile);
  } catch {
    await fs.writeFile(dataFile, '[]', 'utf8');
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await ensureDataDirectory();
      await initializeDataFile();

      const { timestamp, userAgent, policyAccepted, policyText } = req.body;
      const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

      const consentData = {
        ipAddress,
        timestamp,
        userAgent,
        policyAccepted,
        policyText,
        consentVersion: '1.0'
      };

      const data = JSON.parse(await fs.readFile(dataFile, 'utf8'));
      data.push(consentData);
      await fs.writeFile(dataFile, JSON.stringify(data, null, 2), 'utf8');

      res.status(200).json({ message: 'Cookie consent saved successfully' });
    } catch (error) {
      console.error('Error saving consent:', error);
      res.status(500).json({ error: 'Failed to save cookie consent' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
