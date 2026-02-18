import React from 'react';
import { Phone, Mail, MessageCircle } from 'lucide-react';

import { useSettings } from '../context/SettingsContext';

const ContactActions = () => {
    const { settings } = useSettings();
    const { phone, email, whatsapp } = settings.contact;

    return (
        <div style={{ position: 'fixed', bottom: '24px', left: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* WhatsApp */}
            <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-[#25D366] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform hover:shadow-xl"
                title="שלח הודעה בווצאפ"
            >
                <MessageCircle size={24} />
            </a>

            {/* Phone */}
            <a
                href={`tel:${phone}`}
                className="w-12 h-12 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform hover:shadow-xl"
                title="התקשר עכשיו"
            >
                <Phone size={24} />
            </a>

            {/* Email */}
            <a
                href={`mailto:${email}`}
                className="w-12 h-12 bg-gray-700 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform hover:shadow-xl"
                title="שלח אימייל"
            >
                <Mail size={24} />
            </a>
        </div>
    );
};

export default ContactActions;
