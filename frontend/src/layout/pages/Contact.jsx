import { useState } from 'react';

const RATE_LIMIT_KEY = 'contact_form_submissions';
const MAX_SUBMISSIONS_PER_HOUR = 2;
const ONE_HOUR_MS = 60 * 60 * 1000;

function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
        acceptedPrivacy: false,
    });

    const [errors, setErrors] = useState({});
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [submittedStatus, setSubmittedStatus] = useState(null);
    const [rateLimitMessage, setRateLimitMessage] = useState('');
    const [serverErrorMessage, setServerErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const countWords = (text) => {
        if (!text) return 0;
        const words = text.trim().split(/\s+/).filter(Boolean);
        return words.length;
    };

    const getRecentSubmissions = () => {
        try {
            const raw = localStorage.getItem(RATE_LIMIT_KEY);
            if (!raw) return [];
            const timestamps = JSON.parse(raw);
            if (!Array.isArray(timestamps)) return [];
            const now = Date.now();
            return timestamps.filter((ts) => now - ts < ONE_HOUR_MS);
        } catch {
            return [];
        }
    };

    const recordSubmission = () => {
        try {
            const recent = getRecentSubmissions();
            recent.push(Date.now());
            localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(recent));
        } catch {
            // Ignoruj błędy dostępu do localStorage
        }
    };

    const validateField = (name, value) => {
        switch (name) {
            case 'name': {
                const trimmed = (value || '').trim();
                if (!trimmed) {
                    return 'Imię jest wymagane.';
                }
                const lettersRegex = /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]+$/;
                if (!lettersRegex.test(trimmed)) {
                    return 'Imię może zawierać wyłącznie litery (brak cyfr i symboli).';
                }
                const letterCount = (trimmed.match(/[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g) || []).length;
                if (letterCount < 3) {
                    return 'Imię musi zawierać co najmniej 3 litery.';
                }
                if (trimmed.length > 50) {
                    return 'Imię może mieć maksymalnie 50 znaków.';
                }
                return '';
            }

            case 'email': {
                const trimmed = (value || '').trim();
                if (!trimmed) {
                    return 'Adres e-mail jest wymagany.';
                }
                if (!trimmed.includes('@') || !trimmed.includes('.com')) {
                    return 'Adres e-mail musi zawierać "@" oraz domenę ".com".';
                }
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(trimmed)) {
                    return 'Wprowadź prawidłowy adres e-mail.';
                }
                return '';
            }

            case 'subject': {
                const trimmed = (value || '').trim();
                if (!trimmed) {
                    return 'Temat jest wymagany.';
                }
                const wordCount = countWords(trimmed);
                if (wordCount < 5) {
                    return `Temat musi zawierać co najmniej 5 słów (aktualnie: ${wordCount}).`;
                }
                if (wordCount > 200) {
                    return `Temat może zawierać maksymalnie 200 słów (aktualnie: ${wordCount}).`;
                }
                return '';
            }

            case 'message': {
                const trimmed = (value || '').trim();
                if (!trimmed) {
                    return 'Wiadomość jest wymagana.';
                }
                if (trimmed.length < 5) {
                    return `Wiadomość musi mieć co najmniej 5 znaków (aktualnie: ${trimmed.length}).`;
                }
                if (trimmed.length > 300) {
                    return `Wiadomość może mieć maksymalnie 300 znaków (aktualnie: ${trimmed.length}).`;
                }
                return '';
            }

            case 'acceptedPrivacy': {
                if (!value) {
                    return 'Wymagana jest akceptacja polityki prywatności.';
                }
                return '';
            }

            default:
                return '';
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const fields = ['name', 'email', 'subject', 'message', 'acceptedPrivacy'];

        fields.forEach((field) => {
            const errorMsg = validateField(field, formData[field]);
            if (errorMsg) {
                newErrors[field] = errorMsg;
            }
        });

        return newErrors;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const fieldValue = type === 'checkbox' ? checked : value;

        setFormData((prev) => ({
            ...prev,
            [name]: fieldValue,
        }));

        if (hasSubmitted) {
            const errorMsg = validateField(name, fieldValue);
            setErrors((prev) => ({
                ...prev,
                [name]: errorMsg,
            }));
        }

        if (submittedStatus === 'success') {
            setSubmittedStatus(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const recentSubmissions = getRecentSubmissions();
        if (recentSubmissions.length >= MAX_SUBMISSIONS_PER_HOUR) {
            const oldestTimestamp = Math.min(...recentSubmissions);
            const remainingMinutes = Math.max(1, Math.ceil((ONE_HOUR_MS - (Date.now() - oldestTimestamp)) / 60000));
            setRateLimitMessage(
                `Osiągnięto limit wysyłania wiadomości (maksymalnie ${MAX_SUBMISSIONS_PER_HOUR} na godzinę). Spróbuj ponownie za ok. ${remainingMinutes} min.`
            );
            setSubmittedStatus('rate-limit');
            return;
        }

        setRateLimitMessage('');
        setServerErrorMessage('');
        setHasSubmitted(true);

        const validationErrors = validateForm();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            setSubmittedStatus('error');
            return;
        }

        try {
            setIsSubmitting(true);

            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    subject: formData.subject.trim(),
                    message: formData.message.trim(),
                }),
            });

            const data = await response.json().catch(() => ({}));

            if (response.status === 429) {
                setRateLimitMessage(data.message || 'Przekroczono limit 2 wiadomości na godzinę.');
                setSubmittedStatus('rate-limit');
                return;
            }

            if (!response.ok) {
                throw new Error(data.message || 'Błąd wysyłania wiadomości po stronie serwera.');
            }

            recordSubmission();
            setSubmittedStatus('success');
            setHasSubmitted(false);
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: '',
                acceptedPrivacy: false,
            });
        } catch (error) {
            setServerErrorMessage(error.message || 'Nie udało się wysłać wiadomości. Spróbuj ponownie później.');
            setSubmittedStatus('server-error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-[#0b1120] text-white overflow-x-hidden box-border">
            <main className="w-full max-w-[1280px] !mx-auto !px-6 sm:!px-10 lg:!px-12 !pt-28 !pb-16 box-border">
                <div className="!mb-10 text-left">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight !mb-3">
                        Kontakt
                    </h1>
                    <p className="text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
                        Masz pytanie o rezerwację lub ofertę? Napisz albo zadzwoń.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start w-full">
                    <div className="lg:col-span-5 flex flex-col gap-6 w-full min-w-0">
                        <div className="flex flex-col gap-4 w-full">
                            <div className="w-full bg-[#151e32] border border-white/10 rounded-xl !p-5 sm:!p-6 flex items-center gap-4 sm:gap-5 shadow-lg transition-all duration-200 hover:border-blue-500/40 hover:-translate-y-0.5 box-border">
                                <div className="w-12 h-12 min-w-[3rem] rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center shrink-0">
                                    <svg
                                        className="w-6 h-6 text-blue-500"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 !mb-1">
                                        Telefon
                                    </span>
                                    <a
                                        href="tel:+48123456789"
                                        className="text-base sm:text-lg font-bold text-white break-words transition-colors hover:text-blue-400"
                                    >
                                        +48 123 456 789
                                    </a>
                                    <span className="text-xs sm:text-sm text-slate-400 !mt-1">
                                        Infolinia: Pon – Pt 8:00 – 20:00
                                    </span>
                                </div>
                            </div>

                            <div className="w-full bg-[#151e32] border border-white/10 rounded-xl !p-5 sm:!p-6 flex items-center gap-4 sm:gap-5 shadow-lg transition-all duration-200 hover:border-blue-500/40 hover:-translate-y-0.5 box-border">
                                <div className="w-12 h-12 min-w-[3rem] rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center shrink-0">
                                    <svg
                                        className="w-6 h-6 text-blue-500"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <rect width="20" height="16" x="2" y="4" rx="2" />
                                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                    </svg>
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 !mb-1">
                                        E-mail
                                    </span>
                                    <a
                                        href="mailto:testwypozyczalnia@gmail.com"
                                        className="text-base sm:text-lg font-bold text-white break-words transition-colors hover:text-blue-400"
                                    >
                                        testwypozyczalnia@gmail.com
                                    </a>
                                    <span className="text-xs sm:text-sm text-slate-400 !mt-1">
                                        Odpowiadamy w ciągu 24h
                                    </span>
                                </div>
                            </div>
                            <div className="w-full bg-[#151e32] border border-white/10 rounded-xl !p-5 sm:!p-6 flex items-center gap-4 sm:gap-5 shadow-lg transition-all duration-200 hover:border-blue-500/40 hover:-translate-y-0.5 box-border">
                                <div className="w-12 h-12 min-w-[3rem] rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center shrink-0">
                                    <svg
                                        className="w-6 h-6 text-blue-500"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                </div>
                                <div className="flex flex-col min-w-0 flex-1">
                                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 !mb-1">
                                        Punkt główny
                                    </span>
                                    <p className="text-base sm:text-lg font-bold text-white break-words">
                                        ul. Krakowska 45, 33-100 Tarnów
                                    </p>
                                    <span className="text-xs sm:text-sm text-slate-400 !mt-1">
                                        Odbiór i zwrot pojazdów 24/7
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="w-full bg-[#151e32] border border-white/10 rounded-xl overflow-hidden shadow-lg box-border">
                            <div className="!px-5 !py-3.5 border-b border-white/10 bg-[#0b1120]/50 flex items-center justify-between">
                                <span className="text-xs sm:text-sm font-semibold text-slate-300 tracking-wide">
                                    Obszar działania – Tarnów
                                </span>
                            </div>
                            <iframe
                                title="Lokalizacja wypożyczalni – Tarnów"
                                src="https://www.google.com/maps?q=Tarn%C3%B3w&hl=pl&z=12&output=embed"
                                className="w-full h-[280px] sm:h-[300px] border-0 block"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>
                    </div>
                    <div className="lg:col-span-7 flex flex-col gap-6 w-full min-w-0">
                        <div className="w-full bg-[#151e32] border border-white/10 rounded-xl !p-6 sm:!p-8 lg:!p-10 shadow-xl box-border">
                            <div className="!mb-7">
                                <h2 className="text-2xl font-bold text-white tracking-tight !mb-2">
                                    Napisz do nas
                                </h2>
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    Wypełnij formularz, a skontaktujemy się z Tobą najszybciej jak to możliwe.
                                </p>
                            </div>

                            {submittedStatus === 'success' && (
                                <div className="!mb-6 !p-4 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm font-medium flex items-center gap-3">
                                    <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Wiadomość została wysłana! Odpowiemy najszybciej jak to możliwe.</span>
                                </div>
                            )}

                            {submittedStatus === 'rate-limit' && rateLimitMessage && (
                                <div className="!mb-6 !p-4 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-sm font-medium flex items-center gap-3">
                                    <svg className="w-5 h-5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{rateLimitMessage}</span>
                                </div>
                            )}

                            {submittedStatus === 'server-error' && serverErrorMessage && (
                                <div className="!mb-6 !p-4 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-sm font-medium flex items-center gap-3">
                                    <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span>{serverErrorMessage}</span>
                                </div>
                            )}

                            {submittedStatus === 'error' && Object.keys(errors).length > 0 && (
                                <div className="!mb-6 !p-4 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-sm font-medium flex items-center gap-3">
                                    <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <span>Wypełnij poprawnie wszystkie wymagane pola formularza.</span>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 w-full">
                                <div className="flex flex-col gap-2 w-full">
                                    <label htmlFor="contact-name" className="text-sm font-semibold text-slate-300">
                                        Imię i nazwisko <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="contact-name"
                                        name="name"
                                        required
                                        disabled={isSubmitting}
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="np. Jan Kowalski"
                                        className={`w-full h-12 !px-4 !py-2.5 bg-[#0b1120] rounded-lg text-white text-base placeholder:text-slate-500 outline-none transition duration-150 box-border disabled:opacity-60 ${
                                            hasSubmitted && errors.name
                                                ? 'border-2 border-red-500 bg-red-950/15 focus:ring-2 focus:ring-red-500/20'
                                                : 'border border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                        }`}
                                    />
                                    {hasSubmitted && errors.name && (
                                        <p className="text-xs text-red-400 font-medium !mt-0.5">{errors.name}</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 w-full">
                                    <label htmlFor="contact-email" className="text-sm font-semibold text-slate-300">
                                        Adres e-mail <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        id="contact-email"
                                        name="email"
                                        required
                                        disabled={isSubmitting}
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="np. jan.kowalski@example.com"
                                        className={`w-full h-12 !px-4 !py-2.5 bg-[#0b1120] rounded-lg text-white text-base placeholder:text-slate-500 outline-none transition duration-150 box-border disabled:opacity-60 ${
                                            hasSubmitted && errors.email
                                                ? 'border-2 border-red-500 bg-red-950/15 focus:ring-2 focus:ring-red-500/20'
                                                : 'border border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                        }`}
                                    />
                                    {hasSubmitted && errors.email && (
                                        <p className="text-xs text-red-400 font-medium !mt-0.5">{errors.email}</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 w-full">
                                    <label htmlFor="contact-subject" className="text-sm font-semibold text-slate-300">
                                        Temat <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="contact-subject"
                                        name="subject"
                                        required
                                        disabled={isSubmitting}
                                        value={formData.subject}
                                        onChange={handleChange}
                                        placeholder="np. Zapytanie o wynajem długoterminowy"
                                        className={`w-full h-12 !px-4 !py-2.5 bg-[#0b1120] rounded-lg text-white text-base placeholder:text-slate-500 outline-none transition duration-150 box-border disabled:opacity-60 ${
                                            hasSubmitted && errors.subject
                                                ? 'border-2 border-red-500 bg-red-950/15 focus:ring-2 focus:ring-red-500/20'
                                                : 'border border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                        }`}
                                    />
                                    {hasSubmitted && errors.subject && (
                                        <p className="text-xs text-red-400 font-medium !mt-0.5">{errors.subject}</p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 w-full">
                                    <div className="flex items-center justify-between gap-2">
                                        <label htmlFor="contact-message" className="text-sm font-semibold text-slate-300">
                                            Wiadomość <span className="text-red-400">*</span>
                                        </label>
                                        <span
                                            className={`text-xs font-medium ${
                                                formData.message.trim().length > 300
                                                    ? 'text-red-400'
                                                    : 'text-slate-400'
                                            }`}
                                        >
                                            {formData.message.trim().length} / 300
                                        </span>
                                    </div>
                                    <textarea
                                        id="contact-message"
                                        name="message"
                                        rows="5"
                                        required
                                        disabled={isSubmitting}
                                        minLength={5}
                                        maxLength={300}
                                        value={formData.message}
                                        onChange={handleChange}
                                        placeholder="Wpisz treść swojej wiadomości (5–300 znaków)..."
                                        className={`w-full min-h-[135px] max-h-[280px] !p-4 bg-[#0b1120] rounded-lg text-white text-base placeholder:text-slate-500 outline-none transition duration-150 resize-y box-border disabled:opacity-60 ${
                                            hasSubmitted && errors.message
                                                ? 'border-2 border-red-500 bg-red-950/15 focus:ring-2 focus:ring-red-500/20'
                                                : 'border border-slate-700/80 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                                        }`}
                                    />
                                    {hasSubmitted && errors.message && (
                                        <p className="text-xs text-red-400 font-medium !mt-0.5">{errors.message}</p>
                                    )}
                                </div>

                                <div className="!pt-1">
                                    <label className="flex items-start gap-3 text-sm text-slate-300 leading-snug cursor-pointer select-none">
                                        <input
                                            type="checkbox"
                                            id="contact-privacy"
                                            name="acceptedPrivacy"
                                            required
                                            disabled={isSubmitting}
                                            checked={formData.acceptedPrivacy}
                                            onChange={handleChange}
                                            className="!mt-0.5 w-4 h-4 rounded border-slate-700 text-blue-600 accent-blue-600 shrink-0 cursor-pointer"
                                        />
                                        <span>
                                            Akceptuję politykę prywatności i zgadzam się na kontakt w sprawie zapytania <span className="text-red-400">*</span>
                                        </span>
                                    </label>
                                    {hasSubmitted && errors.acceptedPrivacy && (
                                        <p className="text-xs text-red-400 font-medium !mt-1.5 !ml-7">
                                            {errors.acceptedPrivacy}
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-base rounded-lg transition duration-150 shadow-md cursor-pointer !mt-2"
                                >
                                    {isSubmitting ? 'Wysyłanie...' : 'Wyślij wiadomość'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Contact;