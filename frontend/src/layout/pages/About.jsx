import { useState } from 'react';
import { Link } from 'react-router';

const RENTAL_STEPS_PLACEHOLDER = [
    {
        step: '01',
        title: 'Create an account & sign in',
        description:
            '[Placeholder] Explain how new drivers register, verify their email or profile details, and sign in to unlock reservations.',
    },
    {
        step: '02',
        title: 'Browse the fleet & choose a car',
        description:
            '[Placeholder] Explain how to filter vehicles by category, transmission, fuel type, or daily rate and inspect car availability.',
    },
    {
        step: '03',
        title: 'Select dates & confirm booking',
        description:
            '[Placeholder] Explain how to pick rental dates, pickup/return locations, optional add-ons, and confirm the reservation.',
    },
    {
        step: '04',
        title: 'Pick up the keys & hit the road',
        description:
            '[Placeholder] Explain required documents at pickup, vehicle inspection, deposit rules, and how returning the car works.',
    },
];

const SITE_SECTIONS = [
    {
        name: 'Home',
        path: '/',
        access: 'Sign in required',
        accessStyle: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
        location: 'Top navigation bar ("Home") or site logo',
        description:
            'The main landing view welcoming signed-in users with a hero banner and a quick starting point to explore the platform.',
    },
    {
        name: 'Our fleet',
        path: '/fleet',
        access: 'Public',
        accessStyle: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        location: 'Top navigation bar ("Our fleet") or the "Book now" button in the header',
        description:
            'Catalog of available cars where you can browse models, compare vehicle categories, and pick the right car for your trip.',
    },
    {
        name: 'How it works / About',
        path: '/about',
        access: 'Public',
        accessStyle: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        location: 'Top navigation bar ("About")',
        description:
            'You are here. Complete guide to what is located across Cars-rent.pl, the car rental walkthrough placeholder, and FAQ.',
    },
    {
        name: 'Contact',
        path: '/contact',
        access: 'Public',
        accessStyle: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        location: 'Top navigation bar ("Contact")',
        description:
            'Customer support information and ways to reach the Cars-rent.pl team if you have questions or need help with a rental.',
    },
    {
        name: 'My bookings',
        path: '/my-bookings',
        access: 'Sign in required',
        accessStyle: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
        location: 'Top-right User Menu (avatar dropdown -> "My bookings")',
        description:
            'Personal dashboard where signed-in users can review upcoming, active, and past car reservations in one place.',
    },
    {
        name: 'Sign In & Sign Up',
        path: '/login',
        secondaryPath: '/register',
        access: 'Guests only',
        accessStyle: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
        location: 'Top navigation bar ("Sign In" / "Sign Up") when signed out',
        description:
            'Authentication pages for signing in to an existing account or creating a new one. Signed-in users can log out via the User Menu.',
    },
];

const FAQ_ITEMS = [
    {
        question: 'Do I need an account to browse Cars-rent.pl?',
        answer: 'No. You can freely view Our fleet, About / How it works, and Contact without signing in. An account is required to access the Home page, book a car from Our fleet, and check My bookings.',
    },
    {
        question: 'Where can I find my reservations?',
        answer: 'Once you are signed in, click your circular profile avatar in the top-right corner of the header to open the User Menu, then choose "My bookings" (/my-bookings).',
    },
    {
        question: 'How do I start a new car booking?',
        answer: 'Sign in to your account and click the blue "Book now" button in the top-right corner of the header. This takes you to Our fleet (/fleet), where you can pick an available car and click "Book".',
    },
    {
        question: 'How do I create an account or log out?',
        answer: 'When signed out, use "Sign Up" in the top navigation bar to register with your email and password. When signed in, open the User Menu in the top-right corner and click "Log out".',
    },
    {
        question: 'What documents are needed to rent a car?',
        answer: 'Typically you will need a valid driver\'s license, an ID card or passport, and a payment method in the driver\'s name. Exact Cars-rent.pl requirements will be detailed in the "How to rent a car" guide above.',
    },
    {
        question: 'Can I change or cancel an existing booking?',
        answer: 'Reservation management features are planned inside the "My bookings" section. If you need assistance before then, please reach out through the Contact page.',
    },
];

function About() {
    const [openFaqIndex, setOpenFaqIndex] = useState(0);

    const toggleFaq = (index) => {
        setOpenFaqIndex((current) => (current === index ? null : index));
    };

    return (
        <main className="w-full max-w-[1280px] mx-auto px-4 py-12 sm:px-8">
            {/* Hero header */}
            <section className="mb-14 text-center">
                <span className="mb-4 inline-block rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold tracking-wider text-blue-400 uppercase">
                    How it works
                </span>
                <h1 className="mx-auto mb-4 max-w-3xl text-3xl leading-tight font-extrabold text-white sm:text-5xl">
                    Everything you need to know about{' '}
                    <span className="text-blue-500">Cars-rent.pl</span>
                </h1>
                <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
                    Find where every section lives on the website, preview how renting a car works,
                    and check answers to the most frequently asked questions.
                </p>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                    <a
                        href="#how-to-rent"
                        className="rounded-lg border border-white/10 bg-[#151e32] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-blue-500/50 hover:text-white"
                    >
                        How to rent
                    </a>
                    <a
                        href="#site-guide"
                        className="rounded-lg border border-white/10 bg-[#151e32] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-blue-500/50 hover:text-white"
                    >
                        Site map &amp; guide
                    </a>
                    <a
                        href="#faq"
                        className="rounded-lg border border-white/10 bg-[#151e32] px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-blue-500/50 hover:text-white"
                    >
                        FAQ
                    </a>
                </div>
            </section>

            {/* How to rent a car - Placeholder section */}
            <section id="how-to-rent" className="mb-16 scroll-mt-24">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <div className="mb-2 flex items-center gap-3">
                            <h2 className="text-2xl font-bold text-white sm:text-3xl">
                                How to rent a car
                            </h2>
                            <span className="rounded-md border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
                                Placeholder
                            </span>
                        </div>
                        <p className="max-w-2xl text-sm text-slate-400 sm:text-base">
                            Step-by-step rental instructions will live here. Below is a placeholder
                            layout outlining the upcoming rental flow.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {RENTAL_STEPS_PLACEHOLDER.map((item) => (
                        <article
                            key={item.step}
                            className="flex flex-col rounded-xl border border-dashed border-white/15 bg-[#151e32] p-6 shadow-[0_10px_25px_rgba(0,0,0,0.3)] transition hover:border-blue-500/40"
                        >
                            <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-blue-500/30 bg-blue-500/15 text-sm font-bold text-blue-400">
                                {item.step}
                            </span>
                            <h3 className="mb-2 text-lg font-bold text-white">{item.title}</h3>
                            <p className="text-sm leading-relaxed text-slate-400">
                                {item.description}
                            </p>
                        </article>
                    ))}
                </div>

                <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl border border-dashed border-blue-500/35 bg-[#151e32]/70 p-6 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-sm font-semibold text-blue-400">
                            Detailed rental walkthrough coming soon
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                            [Placeholder] Full instructions covering pricing, insurance packages,
                            deposit policy, pickup points, and return checklist will replace this
                            block once the booking flow is finalized.
                        </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-3">
                        <Link
                            to="/fleet"
                            className="rounded-lg border border-white/10 bg-[#0b1120] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-blue-500/50 hover:text-white"
                        >
                            Explore fleet
                        </Link>
                        <Link
                            to="/fleet"
                            className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                        >
                            Book now
                        </Link>
                    </div>
                </div>
            </section>

            {/* What & where everything is across the website */}
            <section id="site-guide" className="mb-16 scroll-mt-24">
                <div className="mb-8">
                    <h2 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
                        What &amp; where on the website
                    </h2>
                    <p className="max-w-2xl text-sm text-slate-400 sm:text-base">
                        A complete overview of every page on Cars-rent.pl, what you can do there,
                        and where to find it in the interface.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                    {SITE_SECTIONS.map((section) => (
                        <article
                            key={section.path}
                            className="flex flex-col justify-between rounded-xl border border-white/10 bg-[#151e32] p-6 shadow-[0_10px_25px_rgba(0,0,0,0.3)] transition hover:border-blue-500/40"
                        >
                            <div>
                                <div className="mb-3 flex items-start justify-between gap-3">
                                    <h3 className="text-lg font-bold text-white">
                                        {section.name}
                                    </h3>
                                    <span
                                        className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${section.accessStyle}`}
                                    >
                                        {section.access}
                                    </span>
                                </div>

                                <p className="mb-4 text-sm leading-relaxed text-slate-300">
                                    {section.description}
                                </p>
                            </div>

                            <div className="space-y-3 border-t border-white/10 pt-4">
                                <div className="text-xs text-slate-400">
                                    <span className="font-semibold text-slate-200">
                                        Where to find it:{' '}
                                    </span>
                                    {section.location}
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <code className="rounded bg-[#0b1120] px-2 py-1 text-xs text-blue-400">
                                        {section.secondaryPath
                                            ? `${section.path} / ${section.secondaryPath}`
                                            : section.path}
                                    </code>
                                    <Link
                                        to={section.path}
                                        className="text-sm font-semibold text-blue-400 transition hover:text-blue-300 hover:underline"
                                    >
                                        Open page &rarr;
                                    </Link>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {/* FAQ section */}
            <section id="faq" className="mb-14 scroll-mt-24">
                <div className="mb-8">
                    <h2 className="mb-2 text-2xl font-bold text-white sm:text-3xl">
                        Frequently Asked Questions
                    </h2>
                    <p className="max-w-2xl text-sm text-slate-400 sm:text-base">
                        Quick answers to common questions about accounts, navigation, and car
                        bookings.
                    </p>
                </div>

                <div className="space-y-3">
                    {FAQ_ITEMS.map((item, index) => {
                        const isOpen = openFaqIndex === index;
                        const answerId = `faq-answer-${index}`;

                        return (
                            <div
                                key={item.question}
                                className="overflow-hidden rounded-xl border border-white/10 bg-[#151e32] shadow-[0_10px_25px_rgba(0,0,0,0.2)] transition hover:border-blue-500/30"
                            >
                                <button
                                    type="button"
                                    onClick={() => toggleFaq(index)}
                                    aria-expanded={isOpen}
                                    aria-controls={answerId}
                                    className="flex w-full cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left"
                                >
                                    <span className="text-base font-semibold text-white">
                                        {item.question}
                                    </span>
                                    <span
                                        className={`shrink-0 text-sm text-blue-400 transition-transform duration-200 ${
                                            isOpen ? 'rotate-180' : ''
                                        }`}
                                        aria-hidden="true"
                                    >
                                        &#9662;
                                    </span>
                                </button>

                                {isOpen && (
                                    <div
                                        id={answerId}
                                        className="border-t border-white/10 px-6 py-4 text-sm leading-relaxed text-slate-300"
                                    >
                                        {item.answer}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="flex flex-col items-start justify-between gap-6 rounded-xl border border-white/10 bg-[#151e32] p-8 shadow-[0_10px_25px_rgba(0,0,0,0.3)] sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-xl font-bold text-white">Still have questions?</h2>
                    <p className="mt-1 text-sm text-slate-400">
                        Reach out to our support team anytime and we will help you get on the road.
                    </p>
                </div>
                <Link
                    to="/contact"
                    className="shrink-0 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                    Contact us
                </Link>
            </section>
        </main>
    );
}

export default About;
