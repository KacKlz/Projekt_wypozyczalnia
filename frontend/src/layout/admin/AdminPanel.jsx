import { useState, useEffect } from 'react';
import AdminCarForm from './AdminCarForm';
import AdminCarsTable from './AdminCarsTable';

function AdminPanel() {
    const [cars, setCars] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingCar, setEditingCar] = useState(null);
    const [message, setMessage] = useState(null);

    // Load all cars once, when the panel opens
    useEffect(() => {
        const loadCars = async () => {
            try {
                const response = await fetch('/api/admin/cars');
                const data = await response.json();

                if (!response.ok) {
                    setMessage({ type: 'error', text: data.message });
                    return;
                }

                setCars(data);
            } catch {
                setMessage({ type: 'error', text: 'No connection to the server!' });
            } finally {
                setIsLoading(false);
            }
        };

        loadCars();
    }, []);

    // Add a new car, or save changes to the car being edited
    const handleSave = async (carData) => {
        setMessage(null);

        const isEditing = editingCar !== null;
        const url = isEditing ? `/api/admin/cars/${editingCar._id}` : '/api/admin/cars';

        try {
            const response = await fetch(url, {
                method: isEditing ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(carData)
            });
            const data = await response.json();

            if (!response.ok) {
                setMessage({ type: 'error', text: data.message });
                return false;
            }

            if (isEditing) {
                setCars((currentCars) => currentCars.map((car) => (car._id === data._id ? data : car)));
                setEditingCar(null);
                setMessage({ type: 'success', text: 'Car updated!' });
            } else {
                setCars((currentCars) => [...currentCars, data]);
                setMessage({ type: 'success', text: 'Car added!' });
            }

            return true;
        } catch {
            setMessage({ type: 'error', text: 'No connection to the server!' });
            return false;
        }
    };

    const handleEdit = (car) => {
        setMessage(null);
        setEditingCar(car);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRemove = async (car) => {
        if (!window.confirm(`Remove ${car.make} ${car.model}?`)) {
            return;
        }

        setMessage(null);

        try {
            const response = await fetch(`/api/admin/cars/${car._id}`, { method: 'DELETE' });
            const data = await response.json();

            if (!response.ok) {
                setMessage({ type: 'error', text: data.message });
                return;
            }

            setCars((currentCars) => currentCars.filter((item) => item._id !== car._id));

            if (editingCar && editingCar._id === car._id) {
                setEditingCar(null);
            }

            setMessage({ type: 'success', text: 'Car removed!' });
        } catch {
            setMessage({ type: 'error', text: 'No connection to the server!' });
        }
    };

    return (
        <main className="flex-1 w-full max-w-[1100px] mx-auto px-6 pt-10 pb-16">
            <div className="mb-7">
                <h2 className="mb-2 text-[1.75rem] font-bold text-white">Admin panel</h2>
                <p className="text-[0.95rem] text-[#94a3b8]">Add, edit and remove cars from the fleet</p>
            </div>

            {message && (
                <div className={message.type === 'error' ? 'message-error' : 'message-success'}>
                    {message.text}
                </div>
            )}

            <AdminCarForm
                key={editingCar ? editingCar._id : 'new'}
                car={editingCar}
                onSave={handleSave}
                onCancel={() => setEditingCar(null)}
            />

            {isLoading ? (
                <p className="py-8 text-center text-[#94a3b8]">Loading cars...</p>
            ) : (
                <AdminCarsTable
                    cars={cars}
                    onEdit={handleEdit}
                    onRemove={handleRemove}
                />
            )}
        </main>
    );
}

export default AdminPanel;
