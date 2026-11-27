import '../../styles/pages/Page.css';

function Settings({ user }) {
    const userName = user?.imie || 'User';
    const userInitial = userName.charAt(0).toUpperCase();

    return (
        <main className="mx-auto w-full max-w-(--content-width) px-4 py-8 md:px-10 md:py-12">
            <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">Settings</h1>
            <p className="text-slate-400">
                Manage your appearance, account details and password.
            </p>

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

            <div className="mt-8 flex flex-col gap-4 md:gap-6">
                <section className="rounded-xl border border-white/10 bg-[#151e32] p-5 md:p-8">
                    <h2 className="mb-1 text-lg font-semibold text-white md:text-xl">Appearance</h2>
                    <p className="text-sm text-slate-400">Choose how Cars-rent.pl looks.</p>
                </section>

                <section className="rounded-xl border border-white/10 bg-[#151e32] p-5 md:p-8">
                    <h2 className="mb-1 text-lg font-semibold text-white md:text-xl">Account</h2>
                    <p className="text-sm text-slate-400">Your name and email are used for bookings and confirmations.</p>
                </section>

                <section className="rounded-xl border border-white/10 bg-[#151e32] p-5 md:p-8">
                    <h2 className="mb-1 text-lg font-semibold text-white md:text-xl">Change password</h2>
                    <p className="text-sm text-slate-400">Use at least 8 characters, including a number.</p>
                </section>

                <section className="rounded-xl border border-red-500/40 bg-red-500/5 p-5 md:p-8">
                    <h2 className="mb-1 text-lg font-semibold text-red-300 md:text-xl">Delete account</h2>
                    <p className="text-sm text-slate-400">Permanently removes your account and booking history.</p>
                </section>
            </div>
        </main>
    );
}

export default Settings;
