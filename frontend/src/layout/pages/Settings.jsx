import { useState } from 'react';
import { Sun, Moon, Monitor, User, Lock, TriangleAlert } from 'lucide-react';
import { validateEmail, validateName, validatePassword, validatePasswordMatch } from '../../validation';
import SettingsCard from '../settings/SettingsCard';
import FormField from '../settings/FormField';

// Static list, defined outside the component so it is not recreated on every render
const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
];

function Settings({ user, setUser }) {
    const userName = user?.imie || 'User';
    const userInitial = userName.charAt(0).toUpperCase();

    const navLinkClass =
        'flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-[#151e32] px-4 py-2 text-sm font-medium text-slate-300 hover:border-white/20 hover:text-white lg:rounded-xl';

    // APPEARANCE
    // UI only for now, applying the theme will be handled in feature/theme
    const [theme, setTheme] = useState('dark');

    // ACCOUNT
    const [name, setName] = useState(user?.imie || '');
    const [email, setEmail] = useState(user?.email || '');
    const [accountErrors, setAccountErrors] = useState({});
    const [isSavingAccount, setIsSavingAccount] = useState(false);
    // { type: 'success' | 'error', text: string } or null
    const [accountFeedback, setAccountFeedback] = useState(null);

    async function handleAccountSubmit(event) {
        event.preventDefault();
        setAccountFeedback(null);

        const errors = {
            name: validateName(name),
            email: validateEmail(email),
        };
        setAccountErrors(errors);

        if (errors.name || errors.email) {
            return;
        }

        setIsSavingAccount(true);

        try {
            const res = await fetch('/api/users/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imie: name, email }),
            });
            const data = await res.json();

            if (!res.ok) {
                // 409 = email taken: show it under the email field
                if (res.status === 409) {
                    setAccountErrors({ email: data.message });
                } else {
                    setAccountFeedback({ type: 'error', text: data.message });
                }
                return;
            }

            // Updates the header avatar and the profile card
            setUser(data);
            setAccountFeedback({ type: 'success', text: 'Changes saved.' });
        } catch {
            setAccountFeedback({ type: 'error', text: 'Could not connect to the server.' });
        } finally {
            setIsSavingAccount(false);
        }
    }

    // PASSWORD
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordErrors, setPasswordErrors] = useState({});

    function handlePasswordSubmit(event) {
        event.preventDefault();

        // Current password is only checked for presence here,
        // the backend verifies it against the stored hash
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

        // TODO: send to backend (PATCH /api/users/me/password)
        // Never log passwords
        console.log('Password form submitted');

        // Passwords should not stay in the form after submitting
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
    }

    // DELETE ACCOUNT
    // Two-step confirmation to prevent deleting the account by accident
    const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

    function handleDeleteAccount() {
        // TODO: send to backend (DELETE /api/users/me), then log out
        console.log('Delete account confirmed');
        setIsDeleteConfirmOpen(false);
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
                {/* Negative margin pulls the avatar up so it overlaps the banner */}
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

            {/* Settings layout: tabs on mobile, sidebar + sections on desktop (lg) */}
            <div className="mt-6 lg:grid lg:grid-cols-[240px_1fr] lg:items-start lg:gap-8">

                {/* Section navigation: horizontal scroll on mobile, sticky sidebar on desktop */}
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
                    <SettingsCard
                        id="appearance"
                        icon={Sun}
                        color="blue"
                        title="Appearance"
                        description="Choose how Cars-rent.pl looks."
                    >
                        {/* Radio inputs are visually hidden (sr-only), the label is styled with has-checked */}
                        <fieldset className="mt-6">
                            <legend className="sr-only">Theme</legend>
                            <div className="grid grid-cols-3 gap-3 md:max-w-lg">
                                {themeOptions.map((option) => {
                                    // Component names must start with an uppercase letter
                                    const Icon = option.icon;

                                    return (
                                        <label
                                            key={option.value}
                                            className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-white/10 bg-[#0f1729] p-4 text-sm font-medium text-slate-300 hover:border-white/20 has-checked:border-blue-500 has-checked:bg-blue-500/10 has-checked:text-white has-focus-visible:ring-2 has-focus-visible:ring-blue-500"
                                        >
                                            <input
                                                type="radio"
                                                name="theme"
                                                value={option.value}
                                                checked={theme === option.value}
                                                onChange={() => setTheme(option.value)}
                                                className="sr-only"
                                            />
                                            <Icon className="size-5" aria-hidden="true" />
                                            {option.label}
                                        </label>
                                    );
                                })}
                            </div>
                            <p className="mt-3 text-xs text-slate-500">Light theme is coming soon.</p>
                        </fieldset>
                    </SettingsCard>

                    {/* Account */}
                    <SettingsCard
                        id="account"
                        icon={User}
                        color="purple"
                        title="Account"
                        description="Your name and email are used for bookings and confirmations."
                    >
                        {/* noValidate: use our own error messages instead of the browser's popups */}
                        <form onSubmit={handleAccountSubmit} noValidate className="mt-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                    id="account-name"
                                    label="First name"
                                    type="text"
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    error={accountErrors.name}
                                />
                                <FormField
                                    id="account-email"
                                    label="Email"
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    error={accountErrors.email}
                                />
                            </div>

                            <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
                                {accountFeedback && (
                                    <p
                                        role="status"
                                        className={`text-sm ${accountFeedback.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}
                                    >
                                        {accountFeedback.text}
                                    </p>
                                )}
                                <button
                                    type="submit"
                                    disabled={isSavingAccount}
                                    className="w-full rounded-lg bg-blue-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
                                >
                                    {isSavingAccount ? 'Saving…' : 'Save changes'}
                                </button>
                            </div>
                        </form>
                    </SettingsCard>

                    {/* Change password */}
                    <SettingsCard
                        id="password"
                        icon={Lock}
                        color="emerald"
                        title="Change password"
                        description="At least 8 characters, one uppercase letter and one special character."
                    >
                        <form onSubmit={handlePasswordSubmit} noValidate className="mt-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                {/* autoComplete helps password managers fill in or generate passwords */}
                                <FormField
                                    id="current-password"
                                    label="Current password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={currentPassword}
                                    onChange={(event) => setCurrentPassword(event.target.value)}
                                    error={passwordErrors.currentPassword}
                                    className="md:col-span-2"
                                />
                                <FormField
                                    id="new-password"
                                    label="New password"
                                    type="password"
                                    autoComplete="new-password"
                                    value={newPassword}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                    error={passwordErrors.newPassword}
                                />
                                <FormField
                                    id="confirm-password"
                                    label="Confirm new password"
                                    type="password"
                                    autoComplete="new-password"
                                    value={confirmPassword}
                                    onChange={(event) => setConfirmPassword(event.target.value)}
                                    error={passwordErrors.confirmPassword}
                                />
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
                    </SettingsCard>

                    {/* Delete account */}
                    <SettingsCard
                        id="delete-account"
                        icon={TriangleAlert}
                        color="red"
                        title="Delete account"
                        description="Permanently removes your account and booking history."
                        danger
                    >
                        <div className="mt-6">
                            {isDeleteConfirmOpen ? (
                                <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-4">
                                    <p className="text-sm text-red-200">
                                        Are you sure? This action cannot be undone.
                                    </p>
                                    {/* flex-col-reverse: destructive button on top on mobile, on the right on desktop */}
                                    <div className="mt-4 flex flex-col-reverse gap-3 md:flex-row md:justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setIsDeleteConfirmOpen(false)}
                                            className="rounded-lg border border-white/10 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-white/20 hover:text-white"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleDeleteAccount}
                                            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                                        >
                                            Yes, delete my account
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => setIsDeleteConfirmOpen(true)}
                                        className="w-full rounded-lg border border-red-500/60 px-5 py-2.5 text-sm font-semibold text-red-300 hover:bg-red-500/10 md:w-auto"
                                    >
                                        Delete account
                                    </button>
                                </div>
                            )}
                        </div>
                    </SettingsCard>
                </div>
            </div>
        </main>
    );
}

export default Settings;
