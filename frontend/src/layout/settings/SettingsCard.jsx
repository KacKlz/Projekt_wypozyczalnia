// Full class names are required: Tailwind only generates classes it can find
// in the source, so dynamic names like `bg-${color}-500/15` would not work
const colorClasses = {
    blue: { badge: 'bg-blue-500/15', icon: 'text-blue-400' },
    purple: { badge: 'bg-purple-500/15', icon: 'text-purple-400' },
    emerald: { badge: 'bg-emerald-500/15', icon: 'text-emerald-400' },
    red: { badge: 'bg-red-500/15', icon: 'text-red-400' },
};

// Shared layout for settings sections: icon badge, title, description and content
function SettingsCard({ id, icon: Icon, color = 'blue', title, description, danger = false, children }) {
    // Fall back to blue if an unknown color is passed, instead of crashing
    const colors = colorClasses[color] ?? colorClasses.blue;

    return (
        // scroll-mt-24 keeps the title visible below the sticky header when jumping to #id
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
