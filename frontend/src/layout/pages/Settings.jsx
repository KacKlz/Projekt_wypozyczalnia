import { useState } from 'react';
import { Sun, User, Lock, TriangleAlert } from 'lucide-react';
import { validateEmail, validateName, validatePassword, validatePasswordMatch } from '../../validation';


function Settings({ user }) {
    const userName = user?.imie || 'User';
    const userInitial = userName.charAt(0).toUpperCase();
    const navLinkClass =
        'flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-[#151e32] px-4 py-2 text-sm font-medium text-slate-300 hover:border-white/20 hover:text-white lg:rounded-xl';
    const inputClass =
        'w-full rounded-lg border bg-[#0f1729] px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none';
    const [name, setName] = useState(user?.imie || '');
    const [email, setEmail] = useState(user?.email || '');
    const [accountErrors, setAccountErrors] = useState({});

    // ACCOUNT
    function handleAccountSubmit(event) {
        event.preventDefault();

        const errors = {
            name: validateName(name),
            email: validateEmail(email),
        };
        setAccountErrors(errors);

        if (errors.name || errors.email) {
            return;
        }

        console.log('Account data:', { name, email });
    }

    // PASSWORD
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordErrors, setPasswordErrors] = useState({});

    function handlePasswordSubmit(event) {
        event.preventDefault();

        const errors = {
            currentPassword: currentPassword ? null : 'Current password is required.',
            newPassword:
                validatePassword(newPassword) ||
                (newPassword === currentPassword ? 'New password must be different from the current one.' : null),
            confirmPassword: validatePasswordMatch(newPassword, confirmPassword),
        };
        setPasswordErrors(errors);

        if (errors.currentPassword || errors.newPassword || errors.confirmPassword) {
            return;
        }

        console.log('Password form submitted');

        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    }

    return (
        <main className="mx-auto w-full max-w-(--content-width) px-4 py-8 md:px-10 md:py-12">
            <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">Settings</h1>
            <p className="text-slate-400">
                Manage your appearance, account details and password.
            </p>

            {/* Profile card */}
            <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#151e32]">
                <div className="h-24 bg-[#1d3a6e]"></div>
                <div className="-mt-11 flex flex-wrap items-end gap-4 px-5 pb-6 md:gap-6 md:px-8">
                    <div className="flex size-26 items-center justify-center rounded-full border-4 border-[#151e32] bg-blue-500 text-4xl font-bold text-white">
                        {userInitial}
                    </div>
                    <div className="pb-1">
                        <h2 className="text-2xl font-semibold text-white">{userName}</h2>
                        <p className="text-sm text-slate-400">{user?.email}</p>
                    </div>
                </div>
            </section>

            {/* Settings layout: sidebar + sections */}
            <div className="mt-6 lg:grid lg:grid-cols-[240px_1fr] lg:items-start lg:gap-8">

                {/* Section navigation */}
                <nav aria-label="Settings sections" className="flex gap-2 overflow-x-auto pb-1 lg:sticky lg:top-28 lg:flex-col lg:overflow-visible lg:pb-0">
                    <a href="#appearance" className={navLinkClass}>
                        <Sun className="size-4" aria-hidden="true" />
                        Appearance
                    </a>
                    <a href="#account" className={navLinkClass}>
                        <User className="size-4" aria-hidden="true" />
                        Account
                    </a>
                    <a href="#password" className={navLinkClass}>
                        <Lock className="size-4" aria-hidden="true" />
                        Password
                    </a>
                    <a href="#delete-account" className={navLinkClass}>
                        <TriangleAlert className="size-4" aria-hidden="true" />
                        Delete
                    </a>
                </nav>

                {/* Settings sections */}
                <div className="mt-6 flex flex-col gap-4 md:gap-6 lg:mt-0">
                    {/* Appearance */}
                    <section id="appearance" className="scroll-mt-24 rounded-xl border border-white/10 bg-[#151e32] p-5 md:p-8">
                        <div className="flex items-center gap-4">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/15">
                                <Sun className="size-5 text-blue-400" aria-hidden="true" />
                            </span>
                            <div>
                                <h2 className="text-lg font-semibold text-white md:text-xl">Appearance</h2>
                                <p className="text-sm text-slate-400">Choose how Cars-rent.pl looks.</p>
                            </div>
                        </div>
                    </section>

                    {/* Account */}
                    <section id="account" className="scroll-mt-24 rounded-xl border border-white/10 bg-[#151e32] p-5 md:p-8">
                        <div className="flex items-center gap-4">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/15">
                                <User className="size-5 text-purple-400" aria-hidden="true" />
                            </span>
                            <div>
                                <h2 className="text-lg font-semibold text-white md:text-xl">Account</h2>
                                <p className="text-sm text-slate-400">Your name and email are used for bookings and confirmations.</p>
                            </div>
                        </div>

                        <form onSubmit={handleAccountSubmit} noValidate className="mt-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label htmlFor="account-name" className="mb-1.5 block text-sm font-medium text-slate-300">
                                        First name
                                    </label>
                                    <input
                                        id="account-name"
                                        type="text"
                                        value={name}
                                        onChange={(event) => setName(event.target.value)}
                                        aria-invalid={Boolean(accountErrors.name)}
                                        aria-describedby={accountErrors.name ? 'account-name-error' : undefined}
                                        className={`${inputClass} ${accountErrors.name ? 'border-red-500' : 'border-white/10 focus:border-blue-500'}`}
                                    />
                                    {accountErrors.name && (
                                        <p id="account-name-error" className="mt-1.5 text-sm text-red-400">
                                            {accountErrors.name}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="account-email" className="mb-1.5 block text-sm font-medium text-slate-300">
                                        Email
                                    </label>
                                    <input
                                        id="account-email"
                                        type="email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        aria-invalid={Boolean(accountErrors.email)}
                                        aria-describedby={accountErrors.email ? 'account-email-error' : undefined}
                                        className={`${inputClass} ${accountErrors.email ? 'border-red-500' : 'border-white/10 focus:border-blue-500'}`}
                                    />
                                    {accountErrors.email && (
                                        <p id="account-email-error" className="mt-1.5 text-sm text-red-400">
                                            {accountErrors.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="submit"
                                    className="w-full rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 md:w-auto"
                                >
                                    Save changes
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Change password */}
                    <section id="password" className="scroll-mt-24 rounded-xl border border-white/10 bg-[#151e32] p-5 md:p-8">
                        <div className="flex items-center gap-4">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
                                <Lock className="size-5 text-emerald-400" aria-hidden="true" />
                            </span>
                            <div>
                                <h2 className="text-lg font-semibold text-white md:text-xl">Change password</h2>
                                <p className="text-sm text-slate-400">At least 8 characters, one uppercase letter and one special character.</p>
                            </div>
                        </div>

                        <form onSubmit={handlePasswordSubmit} noValidate className="mt-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <label htmlFor="current-password" className="mb-1.5 block text-sm font-medium text-slate-300">
                                        Current password
                                    </label>
                                    <input
                                        id="current-password"
                                        type="password"
                                        autoComplete="current-password"
                                        value={currentPassword}
                                        onChange={(event) => setCurrentPassword(event.target.value)}
                                        aria-invalid={Boolean(passwordErrors.currentPassword)}
                                        aria-describedby={passwordErrors.currentPassword ? 'current-password-error' : undefined}
                                        className={`${inputClass} ${passwordErrors.currentPassword ? 'border-red-500' : 'border-white/10 focus:border-blue-500'}`}
                                    />
                                    {passwordErrors.currentPassword && (
                                        <p id="current-password-error" className="mt-1.5 text-sm text-red-400">
                                            {passwordErrors.currentPassword}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-slate-300">
                                        New password
                                    </label>
                                    <input
                                        id="new-password"
                                        type="password"
                                        autoComplete="new-password"
                                        value={newPassword}
                                        onChange={(event) => setNewPassword(event.target.value)}
                                        aria-invalid={Boolean(passwordErrors.newPassword)}
                                        aria-describedby={passwordErrors.newPassword ? 'new-password-error' : undefined}
                                        className={`${inputClass} ${passwordErrors.newPassword ? 'border-red-500' : 'border-white/10 focus:border-blue-500'}`}
                                    />
                                    {passwordErrors.newPassword && (
                                        <p id="new-password-error" className="mt-1.5 text-sm text-red-400">
                                            {passwordErrors.newPassword}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-slate-300">
                                        Confirm new password
                                    </label>
                                    <input
                                        id="confirm-password"
                                        type="password"
                                        autoComplete="new-password"
                                        value={confirmPassword}
                                        onChange={(event) => setConfirmPassword(event.target.value)}
                                        aria-invalid={Boolean(passwordErrors.confirmPassword)}
                                        aria-describedby={passwordErrors.confirmPassword ? 'confirm-password-error' : undefined}
                                        className={`${inputClass} ${passwordErrors.confirmPassword ? 'border-red-500' : 'border-white/10 focus:border-blue-500'}`}
                                    />
                                    {passwordErrors.confirmPassword && (
                                        <p id="confirm-password-error" className="mt-1.5 text-sm text-red-400">
                                            {passwordErrors.confirmPassword}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    type="submit"
                                    className="w-full rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 md:w-auto"
                                >
                                    Update password
                                </button>
                            </div>
                        </form>
                    </section>

                    {/* Delete account */}
                    <section id="delete-account" className="scroll-mt-24 rounded-xl border border-red-500/40 bg-red-500/5 p-5 md:p-8">
                        <div className="flex items-center gap-4">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-500/15">
                                <TriangleAlert className="size-5 text-red-400" aria-hidden="true" />
                            </span>
                            <div>
                                <h2 className="text-lg font-semibold text-red-300 md:text-xl">Delete account</h2>
                                <p className="text-sm text-slate-400">Permanently removes your account and booking history.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}

export default Settings;
