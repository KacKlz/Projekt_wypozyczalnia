const colorClasses = {
    blue: { badge: 'bg-blue-500/15', icon: 'text-blue-400' },
    purple: { badge: 'bg-purple-500/15', icon: 'text-purple-400' },
    emerald: { badge: 'bg-emerald-500/15', icon: 'text-emerald-400' },
    red: { badge: 'bg-red-500/15', icon: 'text-red-400' },
};

function SettingsCard({ id, icon: Icon, color = 'blue', title, description, danger = false, children }) {
    const colors = colorClasses[color];

    return (
        <section
            id={id}
            className={`scroll-mt-24 rounded-xl border p-5 md:p-8 ${danger ? 'border-red-500/40 bg-red-500/5' : 'border-white/10 bg-[#151e32]'}`}
        >
            <div className="flex items-center gap-4">
                <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${colors.badge}`}>
                    <Icon className={`size-5 ${colors.icon}`} aria-hidden="true" />
                </span>
                <div>
                    <h2 className={`text-lg font-semibold md:text-xl ${danger ? 'text-red-300' : 'text-white'}`}>
                        {title}
                    </h2>
                    <p className="text-sm text-slate-400">{description}</p>
                </div>
            </div>

            {children}
        </section>
    );
}

export default SettingsCard;
