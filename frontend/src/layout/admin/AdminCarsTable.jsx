import '../../styles/admin/AdminCarsTable.css';

function AdminCarsTable({ cars, onEdit, onRemove }) {
    if (cars.length === 0) {
        return <p className="admin-cars-empty">No cars in the fleet yet.</p>;
    }

    return (
        <div className="admin-cars-table-wrapper">
            <table className="admin-cars-table">
                <thead>
                    <tr>
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
                        <tr key={car._id}>
                            <td>{car.make}</td>
                            <td>{car.model}</td>
                            <td>{car.mileage} km</td>
                            <td>{car.daily_rate}</td>
                            <td>{car.doors}</td>
                            <td>{car.fuel_type}</td>
                            <td>{car.avg_fuel_consumption}</td>
                            <td>
                                <span className={car.is_rented ? 'admin-status admin-status-rented' : 'admin-status admin-status-available'}>
                                    {car.is_rented ? 'Rented' : 'Available'}
                                </span>
                            </td>
                            <td>
                                <div className="admin-cars-actions">
                                    <button type="button" className="admin-btn-edit" onClick={() => onEdit(car)}>
                                        Edit
                                    </button>
                                    <button type="button" className="admin-btn-remove" onClick={() => onRemove(car)}>
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
