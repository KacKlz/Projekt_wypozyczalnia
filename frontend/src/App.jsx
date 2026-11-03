import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router';

import Header from './Header';
import Login from './Login';
import Register from './Register';

function App() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [isCheckingSession, setIsCheckingSession] = useState(true);

    // Sprawdzenie sesji po odswiezeniu strony
    useEffect(() => {
        fetch('/api/auth/me')
            .then((response) => (response.ok ? response.json() : null))
            .then((userData) => setUser(userData))
            .catch(() => setUser(null))
            .finally(() => setIsCheckingSession(false));
    }, []);

    // Pomyslne logowanie
    const handleLoginSuccess = (userData) => {
        setUser(userData);
        navigate('/');
    };

    // Wylogowanie
    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch {
            // Wylogowanie lokalne nawet przy bledzie serwera
        }

        setUser(null);
        navigate('/login');
    };

    // Oczekiwanie na sprawdzenie sesji
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
                {/* Strona glowna */}
                <Route
                    path="/"
                    element={
                        user ? (
                            <div className="main-content">
                                <div className="form-box" style={{ textAlign: 'center' }}>
                                    <h2>Hello, {user.imie || 'User'}!</h2>

                                    <p style={{ margin: '1rem 0', color: '#94a3b8' }}>
                                        Your role: <strong>{user.role}</strong>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <Navigate to="/login" replace />
                        )
                    }
                />

                {/* Logowanie */}
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

                {/* Rejestracja */}
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

                {/* Nieznany adres */}
                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />
            </Routes>
        </div>
    );
}

export default App;