// Authentication Logic
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const errorDiv = document.getElementById('general-error');

const showAlert = (message) => {
    errorDiv.innerText = message;
    errorDiv.style.display = 'block';
    gsap.from(errorDiv, { y: -10, opacity: 0, duration: 0.4 });
};

// Check if already logged in
const checkAuth = () => {
    const token = localStorage.getItem('token');
    const path = window.location.pathname;
    const isLoginPage = path.includes('login.html') || path.includes('signup.html');
    const isDashboard = path.includes('index.html') || path === '/' || path.endsWith('/');

    if (token && isLoginPage) {
        window.location.href = 'index.html';
    } else if (!token && isDashboard) {
        window.location.href = 'login.html';
    }
};

// Immediate check
checkAuth();

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const btn = document.getElementById('login-btn');
            btn.innerText = 'AUTHENTICATING...';
            btn.disabled = true;

            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.data.user));
                window.location.href = 'index.html';
            } else {
                showAlert(data.error || 'Login failed');
            }
        } catch (err) {
            showAlert('Server connection error. Please try again.');
        } finally {
            const btn = document.getElementById('login-btn');
            btn.innerText = 'LOGIN TO DASHBOARD';
            btn.disabled = false;
        }
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('passwordConfirm').value;

        if (password !== passwordConfirm) {
            return showAlert('Passwords do not match');
        }

        if (password.length < 8) {
            return showAlert('Password must be at least 8 characters');
        }

        try {
            const btn = document.getElementById('signup-btn');
            btn.innerText = 'CREATING ACCOUNT...';
            btn.disabled = true;

            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, passwordConfirm })
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.data.user));
                window.location.href = 'index.html';
            } else {
                showAlert(data.error || 'Registration failed');
            }
        } catch (err) {
            showAlert('Server connection error. Please try again.');
        } finally {
            const btn = document.getElementById('signup-btn');
            btn.innerText = 'CREATE SECURE ACCOUNT';
            btn.disabled = false;
        }
    });
}

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
};

// Expose logout to window
window.logout = logout;

document.addEventListener('DOMContentLoaded', checkAuth);
