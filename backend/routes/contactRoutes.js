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
                message: 'Hourly limit of 2 messages exceeded. Please try again later.',
            });
        }

        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                message: 'All form fields are required.',
            });
        }

        if (message.trim().length < 5 || message.trim().length > 300) {
            return res.status(400).json({
                message: 'Message must be between 5 and 300 characters.',
            });
        }

        const safeName = escapeHtml(name.trim());
        const safeEmail = escapeHtml(email.trim());
        const safeSubject = escapeHtml(subject.trim());
        const safeMessage = escapeHtml(message.trim()).replace(/\n/g, '<br />');

        await transporter.sendMail({
            from: `"Cars-Rent Contact" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER,
            replyTo: email.trim(),
            subject: `[Contact] ${subject.trim()}`,
            text: `New contact form submission:\n\nName: ${name.trim()}\nEmail: ${email.trim()}\nSubject: ${subject.trim()}\n\nMessage:\n${message.trim()}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1e293b;">
                    <h2 style="color: #2563eb;">New Message from Cars-Rent Contact Form</h2>
                    <p><strong>Full Name:</strong> ${safeName}</p>
                    <p><strong>Email Address:</strong> ${safeEmail}</p>
                    <p><strong>Subject:</strong> ${safeSubject}</p>
                    <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 16px 0;" />
                    <p><strong>Message:</strong></p>
                    <p style="background: #f8fafc; padding: 12px; border-radius: 6px;">${safeMessage}</p>
                </div>
            `,
        });

        timestamps.push(now);
        submissionHistory.set(clientIp, timestamps);

        return res.status(200).json({ message: 'Message sent successfully.' });
    } catch (error) {
        console.error('Email sending error:', error);
        return res.status(500).json({
            message: 'Failed to send email. Please try again later.',
        });
    }
});

module.exports = router;
