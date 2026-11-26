const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();


const submissionHistory = new Map();
const MAX_SUBMISSIONS_PER_HOUR = 2;
const ONE_HOUR_MS = 60 * 60 * 1000;

const escapeHtml = (str) =>
    String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

router.post('/', async (req, res) => {
    try {
        const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
        const now = Date.now();

        const timestamps = (submissionHistory.get(clientIp) || []).filter(
            (ts) => now - ts < ONE_HOUR_MS
        );

        if (timestamps.length >= MAX_SUBMISSIONS_PER_HOUR) {
            return res.status(429).json({
                message: 'Przekroczono limit 2 wiadomości na godzinę. Spróbuj ponownie później.',
            });
        }

        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                message: 'Wszystkie pola formularza są wymagane.',
            });
        }

        if (message.trim().length < 5 || message.trim().length > 300) {
            return res.status(400).json({
                message: 'Wiadomość musi mieć od 5 do 300 znaków.',
            });
        }

        const safeName = escapeHtml(name.trim());
        const safeEmail = escapeHtml(email.trim());
        const safeSubject = escapeHtml(subject.trim());
        const safeMessage = escapeHtml(message.trim()).replace(/\n/g, '<br />');

        await transporter.sendMail({
            from: `"Cars-Rent Kontakt" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER,
            replyTo: email.trim(),
            subject: `[Kontakt] ${subject.trim()}`,
            text: `Nowa wiadomość ze strony kontaktowej:\n\nImię i nazwisko: ${name.trim()}\nE-mail: ${email.trim()}\nTemat: ${subject.trim()}\n\nWiadomość:\n${message.trim()}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
                    <h2 style="color: #2563eb;">Nowa wiadomość z formularza Cars-Rent.pl</h2>
                    <p><strong>Imię i nazwisko:</strong> ${safeName}</p>
                    <p><strong>Adres e-mail:</strong> ${safeEmail}</p>
                    <p><strong>Temat:</strong> ${safeSubject}</p>
                    <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 16px 0;" />
                    <p><strong>Treść wiadomości:</strong></p>
                    <p style="background: #f8fafc; padding: 12px; border-radius: 6px;">${safeMessage}</p>
                </div>
            `,
        });

        timestamps.push(now);
        submissionHistory.set(clientIp, timestamps);

        return res.status(200).json({ message: 'Wiadomość została wysłana pomyślnie.' });
    } catch (error) {
        console.error('Błąd wysyłki maila:', error);
        return res.status(500).json({
            message: 'Nie udało się wysłać wiadomości e-mail. Spróbuj ponownie później.',
        });
    }
});

module.exports = router;