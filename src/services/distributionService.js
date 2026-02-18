const API_URL = '/new/api/send-email.php'; // Relative path for direct access or full URL if needed

/**
 * Send an email
 * @param {string[]} to List of email addresses
 * @param {string} subject Subject of the email
 * @param {string} html HTML content of the email
 */
export const sendEmail = async (to, subject, html) => {
    try {
        // When using the PHP script, we post directly to the file
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ to, subject, html }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to send email');
        return data;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

/**
 * Send an SMS
 * @param {string} to Phone number (e.g. +972...)
 * @param {string} body Message body
 */
export const sendSMS = async (to, body) => {
    try {
        const response = await fetch(`${API_URL}/send-sms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ to, body }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to send SMS');
        return data;
    } catch (error) {
        console.error('Error sending SMS:', error);
        throw error;
    }
};

/**
 * Send a WhatsApp message
 * @param {string} to Phone number (e.g. +972...)
 * @param {string} body Message body
 */
export const sendWhatsApp = async (to, body) => {
    try {
        const response = await fetch(`${API_URL}/send-whatsapp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ to, body }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to send WhatsApp');
        return data;
    } catch (error) {
        console.error('Error sending WhatsApp:', error);
        throw error;
    }
};

/**
 * Subscribe a user to distribution lists
 * @param {Object} subscriber { name, email, phone, channels }
 */
export const subscribeUser = async (subscriber) => {
    try {
        const response = await fetch(`${API_URL}/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscriber),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to subscribe');
        return data;
    } catch (error) {
        console.error('Error subscribing user:', error);
        throw error;
    }
};

/**
 * Send a contact message (saves to DB + email)
 * @param {Object} data { name, email, phone, message, html }
 */
export const sendMessage = async (data) => {
    try {
        const response = await fetch('/new/api/save_message.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to send message');
        return result;
    } catch (error) {
        console.error('Error in sendMessage:', error);
        throw error;
    }
};

/**
 * Send a Kaddish request (saves to DB + email)
 * @param {Object} data Full form data
 */
export const sendKaddishRequest = async (data) => {
    try {
        const response = await fetch('/new/api/save_request.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || 'Failed to send request');
        return result;
    } catch (error) {
        console.error('Error in sendKaddishRequest:', error);
        throw error;
    }
};
/**
 * Send a newsletter (mass email)
 * @param {string} subject Subject
 * @param {string} html Body content
 * @param {string[]?} recipients Optional list of specific emails (for testing)
 */
export const sendNewsletter = async (subject, html, recipients = null) => {
    try {
        const payload = { subject, body: html };
        if (recipients) {
            payload.recipients = Array.isArray(recipients) ? recipients : [recipients];
        }

        const response = await fetch('/new/api/send_newsletter.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Failed to send newsletter');
        return data; // returns { success, message, details: { sent, failed } }
    } catch (error) {
        console.error('Error sending newsletter:', error);
        throw error;
    }
};
