import { useState, useEffect } from 'react';
import Header from './Header';
import Login from './Login';
import Register from './Register';

function App() {
    const [view, setView] = useState('home');
    const [user, setUser] = useState(null);
    const [isCheckingSession, setIsCheckingSession] = useState(true);

    useEffect(() => {
        fetch('/api/auth/me')
            .then((response) => (response.ok ? response.json() : null))
            .then((userData) => setUser(userData))
            .catch(() => setUser(null))
            .finally(() => setIsCheckingSession(false));
    }, []);

    const handleLoginSuccess = (userData) => {
        setUser(userData);
        setView('home');
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch {
            
        }
        setUser(null);
    };

    if (isCheckingSession) {
        return (
            <div className="app">
                <Header onNavigate={setView} />
            </div>
        );
    }

    return (
        <div className="app">
            <Header onNavigate={setView} />

            {user ? (
                <div className="main-content">
                    <div className="form-box" style={{ textAlign: 'center' }}>
                        <h2>Hello, {user.imie || 'User'}!</h2>
                        <p style={{ margin: '1rem 0', color: '#94a3b8' }}>
                            Your role: <strong style={{ color: user.role === 'admin' ? '#3b82f6' : '#10b981' }}>{user.role}</strong>
                        </p>
                        <button className="btn-primary" onClick={handleLogout}>
                            Log out
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {view === 'home' && (
                        <div className="main-content">
                            <div className="form-box" style={{ textAlign: 'center' }}>
                                <h2>Welcome to Cars-rent.pl</h2>
                                <p style={{ margin: '1rem 0', color: '#94a3b8' }}>
                                    Rent your dream car today. Sign in or sign up to access the fleet.
                                </p>
                            </div>
                        </div>
                    )}

                    {view === 'login' && (
                        <Login 
                            onSwitchToRegister={() => setView('register')}
                            onLoginSuccess={handleLoginSuccess}
                        />
                    )}

                    {view === 'register' && (
                        <Register 
                            onSwitchToLogin={() => setView('login')}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default App;