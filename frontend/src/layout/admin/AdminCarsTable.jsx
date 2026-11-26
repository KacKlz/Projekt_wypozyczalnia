// Shared look of the small Edit / Remove buttons
const actionButton = 'px-[0.9rem] py-[0.4rem] border rounded-md text-[0.85rem] font-semibold cursor-pointer transition-colors duration-200';

function AdminCarsTable({ cars, onEdit, onRemove }) {
    if (cars.length === 0) {
        return <p className="py-8 text-center text-[#94a3b8]">No cars in the fleet yet.</p>;
    }

    return (
        <div className="overflow-x-auto bg-[#151e32] border border-white/8 rounded-xl shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
            <table className="w-full border-collapse text-[0.9rem]">
                <thead>
                    <tr className="border-b border-white/6 *:px-4 *:py-[0.85rem] *:text-left *:whitespace-nowrap *:text-[0.8rem] *:font-semibold *:uppercase *:tracking-[0.04em] *:text-[#94a3b8]">
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
                            className="border-b border-white/6 last:border-b-0 hover:bg-white/3 *:px-4 *:py-[0.85rem] *:text-left *:whitespace-nowrap *:text-[#e2e8f0]"
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
                                    className={`px-[0.65rem] py-1 rounded-full text-[0.8rem] font-semibold ${
                                        car.is_rented
                                            ? 'bg-[rgba(245,158,11,0.15)] text-[#fcd34d]'
                                            : 'bg-[rgba(16,185,129,0.15)] text-[#6ee7b7]'
                                    }`}
                                >
                                    {car.is_rented ? 'Rented' : 'Available'}
                                </span>
                            </td>
                            <td>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        className={`${actionButton} bg-[rgba(59,130,246,0.15)] border-[#3b82f6] text-[#93c5fd] hover:bg-[rgba(59,130,246,0.3)]`}
                                        onClick={() => onEdit(car)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        type="button"
                                        className={`${actionButton} bg-[rgba(239,68,68,0.15)] border-[#ef4444] text-[#fca5a5] hover:bg-[rgba(239,68,68,0.3)]`}
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
