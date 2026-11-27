import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router';

import Header from './Header';
import Login from './Login';
import Register from './Register';
import Home from './layout/home/Home';
import Fleet from './layout/pages/Fleet';
import About from './layout/pages/About';
import Contact from './layout/pages/Contact';
import MyBookings from './layout/pages/MyBookings';
import AdminPanel from './layout/admin/AdminPanel';
import Settings from './layout/pages/Settings';

function App() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [isCheckingSession, setIsCheckingSession] = useState(true);

    // Check session after page refresh
    useEffect(() => {
        fetch('/api/auth/me')
            .then((response) => (response.ok ? response.json() : null))
            .then((userData) => setUser(userData))
            .catch(() => setUser(null))
            .finally(() => setIsCheckingSession(false));
    }, []);

    // Successful login
    const handleLoginSuccess = (userData) => {
        setUser(userData);
        navigate('/');
    };

    // Logout
    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch {
            // Log out locally even if the server request fails
        }

        setUser(null);
        navigate('/login');
    };

    // Waiting for session check
    if (isCheckingSession) {
        return (
            <div className="app">
                <Header />
            </div>
        );
    }

    return (
        <div className="app">
            <Header user={user} onLogout={handleLogout} />

            <Routes>
                {/* Home */}
                <Route
                    path="/"
                    element={
                        user ? (
                            <Home />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* Login */}
                <Route
                    path="/login"
                    element={
                        user ? (
                            <Navigate to="/" replace />
                        ) : (
                            <Login
                                onSwitchToRegister={() => navigate('/register')}
                                onLoginSuccess={handleLoginSuccess}
                            />
                        )
                    }
                />

                {/* Register */}
                <Route
                    path="/register"
                    element={
                        user ? (
                            <Navigate to="/" replace />
                        ) : (
                            <Register
                                onSwitchToLogin={() => navigate('/login')}
                            />
                        )
                    }
                />

                {/* Fleet */}
                <Route path="/fleet" element={<Fleet />} />

                {/* About */}
                <Route path="/about" element={<About />} />

                {/* Contact */}
                <Route path="/contact" element={<Contact />} />

                {/* My bookings */}
                <Route
                    path="/my-bookings"
                    element={
                        user ? (
                            <MyBookings />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* Settings */}
                <Route
                    path="/settings"
                    element={
                        user ? (
                            <Settings user={user} setUser={setUser} />
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* Admin panel - only for admins */}
                <Route
                    path="/admin"
                    element={
                        user && user.role === 'admin' ? (
                            <AdminPanel />
                        ) : (
                            <Navigate to="/" replace />
                        )
                    }
                />

                {/* Unknown route */}
                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />
            </Routes>
        </div>
    );
}

export default App;
