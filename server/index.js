const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Mock Database for Subscribers (In a real app, this would be SQLite/Postgres)
// For now, we'll just log or use an attractive dummy response
let subscribers = [
    { id: 1, name: 'ישראל ישראלי', email: 'test@example.com', phone: '972500000000', channels: ['email', 'whatsapp'] }
];

// Twilio Client Setup
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

// Email Transporter Setup
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail', // e.g., 'gmail', 'SendGrid'
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// --- API Endpoints ---

// 1. Send Email
app.post('/api/send-email', async (req, res) => {
    const { to, subject, html } = req.body;

    if (!process.env.EMAIL_USER) {
        return res.status(503).json({ success: false, message: 'שרת האימייל לא מוגדר (חסרים פרטים ב-.env)' });
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: Array.isArray(to) ? to.join(', ') : to,
            subject: subject,
            html: html
        });
        console.log('Email sent: %s', info.messageId);
        res.json({ success: true, message: 'אימייל נשלח בהצלחה', messageId: info.messageId });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'שגיאה בשליחת האימייל', error: error.message });
    }
});

// 2. Send SMS
app.post('/api/send-sms', async (req, res) => {
    const { to, body } = req.body;

    if (!twilioClient) {
        return res.status(503).json({ success: false, message: 'שירות SMS לא מוגדר (חסרים מפתחות Twilio)' });
    }

    try {
        // Twilio expects 'to' to be a single number. For bulk, we'd need to loop or use Messaging Service.
        // Assuming 'to' is a single number for this simple implementation.
        const message = await twilioClient.messages.create({
            body: body,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: to
        });
        res.json({ success: true, message: 'SMS נשלח', sid: message.sid });
    } catch (error) {
        console.error('Error sending SMS:', error);
        res.status(500).json({ success: false, message: 'שגיאה בשליחת SMS', error: error.message });
    }
});

// 3. Send WhatsApp
app.post('/api/send-whatsapp', async (req, res) => {
    const { to, body } = req.body; // 'to' should include country code e.g. +972...

    if (!twilioClient) {
        return res.status(503).json({ success: false, message: 'שירות וואטסאפ לא מוגדר' });
    }

    try {
        const message = await twilioClient.messages.create({
            body: body,
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`, // e.g. 'whatsapp:+14155238886'
            to: `whatsapp:${to}`
        });
        res.json({ success: true, message: 'וואטסאפ נשלח', sid: message.sid });
    } catch (error) {
        console.error('Error sending WhatsApp:', error);
        res.status(500).json({ success: false, message: 'שגיאה בשליחת וואטסאפ', error: error.message });
    }
});

// 4. Subscribe (Mock)
app.post('/api/subscribe', (req, res) => {
    const { name, email, phone } = req.body;
    // In a real app, save to DB
    console.log('New subscriber:', { name, email, phone });
    res.json({ success: true, message: 'נרשמת בהצלחה!' });
});

// --- DEV PERSISTENCE ENDPOINTS (Local Only) ---

// 5. Save Page (Local File)
app.post('/api/dev/save-page', (req, res) => {
    try {
        const pageData = req.body;
        const filePath = path.join(__dirname, '..', 'src', 'data', 'pages_db.json');

        // Read current file
        const fileContent = fs.readFileSync(filePath, 'utf8');
        let pages = JSON.parse(fileContent);

        // Update or Add
        const idx = pages.findIndex(p => p.slug === pageData.slug);
        if (idx !== -1) {
            pages[idx] = pageData;
        } else {
            pages.push(pageData);
        }

        // Write back
        fs.writeFileSync(filePath, JSON.stringify(pages, null, 2), 'utf8');

        console.log(`DEV SERVER: Saved page ${pageData.slug} to disk`);
        res.json({ success: true });
    } catch (error) {
        console.error('DEV SERVER error saving page:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 5b. Get Pages (Local File)
app.get('/api/dev/get-pages', (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'src', 'data', 'pages_db.json');
        const fileContent = fs.readFileSync(filePath, 'utf8');
        res.json(JSON.parse(fileContent));
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 6. Save Menu (Local File)
app.post('/api/dev/save-menu', (req, res) => {
    try {
        const menuData = req.body;
        const filePath = path.join(__dirname, '..', 'src', 'data', 'menu_structure.json');

        // Write directly
        fs.writeFileSync(filePath, JSON.stringify(menuData, null, 2), 'utf8');

        console.log('DEV SERVER: Saved menu structure to disk');
        res.json({ success: true });
    } catch (error) {
        console.error('DEV SERVER error saving menu:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 6b. Get Menu (Local File)
app.get('/api/dev/get-menu', (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'src', 'data', 'menu_structure.json');
        const fileContent = fs.readFileSync(filePath, 'utf8');
        res.json(JSON.parse(fileContent));
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 7. Save Settings (Local File)
app.post('/api/dev/save-settings', (req, res) => {
    try {
        const settingsData = req.body;
        const filePath = path.join(__dirname, '..', 'src', 'data', 'siteConfig.json');

        fs.writeFileSync(filePath, JSON.stringify(settingsData, null, 2), 'utf8');

        console.log('DEV SERVER: Saved site settings to disk');
        res.json({ success: true });
    } catch (error) {
        console.error('DEV SERVER error saving settings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 7b. Get Settings (Local File)
app.get('/api/dev/get-settings', (req, res) => {
    try {
        const filePath = path.join(__dirname, '..', 'src', 'data', 'siteConfig.json');
        const fileContent = fs.readFileSync(filePath, 'utf8');
        res.json(JSON.parse(fileContent));
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health Check
app.get('/api/dev/health', (req, res) => {
    res.json({
        status: 'ok',
        persistence: true,
        services: {
            email: !!process.env.EMAIL_USER,
            twilio: !!twilioClient
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
