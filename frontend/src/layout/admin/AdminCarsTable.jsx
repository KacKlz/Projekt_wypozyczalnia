// Shared look of the small Edit / Remove buttons
const actionButton = '!px-[0.9rem] !py-[0.4rem] border rounded-md text-[0.85rem] font-semibold cursor-pointer transition-colors duration-200';

function AdminCarsTable({ cars, onEdit, onRemove }) {
    if (cars.length === 0) {
        return <p className="!py-8 text-center text-slate-400">No cars in the fleet yet.</p>;
    }

    return (
        <div className="overflow-x-auto bg-[#151e32] border border-white/10 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
            <table className="w-full border-collapse text-[0.9rem]">
                <thead>
                    <tr className="border-b border-white/5 *:!px-4 *:!py-[0.85rem] *:text-left *:whitespace-nowrap *:text-[0.8rem] *:font-semibold *:uppercase *:tracking-[0.04em] *:text-slate-400">
                        <th>Make</th>
                        <th>Model</th>
                        <th>Mileage</th>
                        <th>Daily rate</th>
                        <th>Doors</th>
                        <th>Fuel</th>
                        <th>Avg consumption</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>

                <tbody>
                    {cars.map((car) => (
                        <tr
                            key={car._id}
                            className="border-b border-white/5 last:border-b-0 hover:bg-white/3 *:!px-4 *:!py-[0.85rem] *:text-left *:whitespace-nowrap *:text-slate-200"
                        >
                            <td>{car.make}</td>
                            <td>{car.model}</td>
                            <td>{car.mileage} km</td>
                            <td>{car.daily_rate}</td>
                            <td>{car.doors}</td>
                            <td>{car.fuel_type}</td>
                            <td>{car.avg_fuel_consumption}</td>
                            <td>
                                <span
                                    className={`!px-[0.65rem] !py-1 rounded-full text-[0.8rem] font-semibold ${
                                        car.is_rented
                                            ? 'bg-amber-500/15 text-amber-300'
                                            : 'bg-emerald-500/15 text-emerald-300'
                                    }`}
                                >
                                    {car.is_rented ? 'Rented' : 'Available'}
                                </span>
                            </td>
                            <td>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        className={`${actionButton} bg-blue-500/15 border-blue-500 text-blue-300 hover:bg-blue-500/30`}
                                        onClick={() => onEdit(car)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        className={`${actionButton} bg-red-500/15 border-red-500 text-red-300 hover:bg-red-500/30`}
                                        onClick={() => onRemove(car)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminCarsTable;
