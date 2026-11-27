// Border color is not included here, it depends on the validation state
const baseInputClass =
    'w-full rounded-lg border bg-[#0f1729] px-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none';

// Labeled input with validation error message and accessibility attributes
function FormField({ id, label, error, className = '', ...inputProps }) {
    const errorId = `${id}-error`;

    return (
        <div className={className}>
            <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-slate-300">
                {label}
            </label>
            <input
                id={id}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                className={`${baseInputClass} ${error ? 'border-red-500' : 'border-white/10 focus:border-blue-500'}`}
                {...inputProps}
            />
            {error && (
                <p id={errorId} className="mt-1.5 text-sm text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
}

export default FormField;
