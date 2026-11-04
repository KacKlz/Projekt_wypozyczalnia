import { useState, useEffect } from 'react';
import Header from './Header';
import Login from './Login';
import Register from './Register';

function App() {
    const [view, setView] = useState('login');
    const [user, setUser] = useState(null);
    const [isCheckingSession, setIsCheckingSession] = useState(true);

    // After a page refresh, ask the backend who is logged in (based on the session cookie)
    useEffect(() => {
        fetch('/api/auth/me')
            .then((response) => (response.ok ? response.json() : null))
            .then((userData) => setUser(userData))
            .catch(() => setUser(null))
            .finally(() => setIsCheckingSession(false));
    }, []);

    const handleLoginSuccess = (userData) => {
        setUser(userData);
    };

    const handleLogout = async () => {
        try {
            // Remove the session cookie on the backend
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch {
            // Log out in the app even if the server cannot be reached
        }
        setUser(null);
    };

    // Wait for the session check, so the login form does not flash for a logged-in user
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

            {user ? null : view === 'login' ? (
                <Login
                    onSwitchToRegister={() => setView('register')}
                    onLoginSuccess={handleLoginSuccess}
                />
            ) : (
                <Register
                    onSwitchToLogin={() => setView('login')}
                />
            )}
        </div>
    );
}

export default App;