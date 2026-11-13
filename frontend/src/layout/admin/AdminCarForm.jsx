import { useState } from 'react';
import '../../styles/admin/AdminCarForm.css';

const fuelTypes = ['petrol', 'diesel', 'hybrid', 'plug-in hybrid', 'electric'];

const emptyForm = {
    make: '',
    model: '',
    mileage: '',
    daily_rate: '',
    doors: '',
    fuel_type: 'petrol',
    avg_fuel_consumption: '',
    is_rented: false
};

// Inputs work with text, so numbers from the backend are turned into strings
function getFormValues(car) {
    if (!car) {
        return emptyForm;
    }

    return {
        make: car.make,
        model: car.model,
        mileage: String(car.mileage),
        daily_rate: String(car.daily_rate),
        doors: String(car.doors),
        fuel_type: car.fuel_type,
        avg_fuel_consumption: String(car.avg_fuel_consumption),
        is_rented: car.is_rented
    };
}

function AdminCarForm({ car, onSave, onCancel }) {
    const [form, setForm] = useState(() => getFormValues(car));
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const numberFields = [form.mileage, form.daily_rate, form.doors, form.avg_fuel_consumption];

        if (!form.make.trim() || !form.model.trim() || numberFields.some((value) => value === '')) {
            setError('Please fill in all fields!');
            return;
        }

        const carData = {
            make: form.make.trim(),
            model: form.model.trim(),
            mileage: Number(form.mileage),
            daily_rate: Number(form.daily_rate),
            doors: Number(form.doors),
            fuel_type: form.fuel_type,
            avg_fuel_consumption: Number(form.avg_fuel_consumption),
            is_rented: form.is_rented
        };

        const numbers = [carData.mileage, carData.daily_rate, carData.avg_fuel_consumption];

        if (numbers.some((value) => Number.isNaN(value) || value < 0)) {
            setError('Mileage, daily rate and fuel consumption cannot be negative!');
            return;
        }

        if (!Number.isInteger(carData.doors) || carData.doors < 1) {
            setError('Doors must be a whole number, at least 1!');
            return;
        }

        const isSaved = await onSave(carData);

        // After adding a car, clear the form for the next one
        if (isSaved && !car) {
            setForm(emptyForm);
        }
    };

    return (
        <form className="admin-car-form" onSubmit={handleSubmit}>
            <h3>{car ? `Edit ${car.make} ${car.model}` : 'Add a new car'}</h3>

            {error && <div className="message-error">{error}</div>}

            <div className="admin-car-form-grid">
                <div className="form-field">
                    <label>Make</label>
                    <input name="make" placeholder="Toyota" value={form.make} onChange={handleChange} />
                </div>

                <div className="form-field">
                    <label>Model</label>
                    <input name="model" placeholder="Corolla" value={form.model} onChange={handleChange} />
                </div>

                <div className="form-field">
                    <label>Mileage (km)</label>
                    <input type="number" name="mileage" min="0" placeholder="42000" value={form.mileage} onChange={handleChange} />
                </div>

                <div className="form-field">
                    <label>Daily rate</label>
                    <input type="number" name="daily_rate" min="0" step="any" placeholder="45" value={form.daily_rate} onChange={handleChange} />
                </div>

                <div className="form-field">
                    <label>Doors</label>
                    <input type="number" name="doors" min="1" placeholder="5" value={form.doors} onChange={handleChange} />
                </div>

                <div className="form-field">
                    <label>Fuel type</label>
                    <select name="fuel_type" value={form.fuel_type} onChange={handleChange}>
                        {fuelTypes.map((fuelType) => (
                            <option key={fuelType} value={fuelType}>
                                {fuelType}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-field">
                    <label>Avg fuel consumption</label>
                    <input type="number" name="avg_fuel_consumption" min="0" step="any" placeholder="4.5" value={form.avg_fuel_consumption} onChange={handleChange} />
                </div>

                <label className="admin-car-form-checkbox">
                    <input type="checkbox" name="is_rented" checked={form.is_rented} onChange={handleChange} />
                    Currently rented
                </label>
            </div>

            <div className="admin-car-form-actions">
                <button type="submit" className="btn-primary">
                    {car ? 'Save changes' : 'Add car'}
                </button>

                {car && (
                    <button type="button" className="admin-btn-cancel" onClick={onCancel}>
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}

export default AdminCarForm;
