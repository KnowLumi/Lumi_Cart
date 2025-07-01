// Lumi Cart Login using Google Sheet as database
const SHEET_API_URL = 'https://script.google.com/macros/s/AKfycbyj4URy4Xxzy6wSEwFrC9tFQQziAHGS4AZr3owTc7FfuoakTHTdcy9plOvoQ6d8Hpj0/exec';

document.getElementById('login-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    const errorDiv = document.getElementById('login-error');
    errorDiv.classList.add('hidden');
    errorDiv.textContent = '';
    const overlay = document.getElementById('loading-overlay');
    overlay.classList.remove('hidden');
    try {
        const res = await fetch(SHEET_API_URL);
        const users = await res.json();
        const found = users.find(u => u["Lumi ID"] === username && u.password === password);
        overlay.classList.add('hidden');
        if (found) {
            localStorage.setItem('lumi_logged_in', '1');
            localStorage.setItem('lumi_id', username);
            if (rememberMe) {
                localStorage.setItem('lumi_remember_id', username);
                localStorage.setItem('lumi_remember_pw', password);
            } else {
                localStorage.removeItem('lumi_remember_id');
                localStorage.removeItem('lumi_remember_pw');
            }
            window.location.href = 'index.html';
        } else {
            errorDiv.textContent = 'Invalid username or password';
            errorDiv.classList.remove('hidden');
        }
    } catch (err) {
        overlay.classList.add('hidden');
        errorDiv.textContent = 'Login failed. Please try again.';
        errorDiv.classList.remove('hidden');
    }
});

// Prefill if remembered
window.addEventListener('DOMContentLoaded', function() {
    const savedId = localStorage.getItem('lumi_remember_id') || '';
    const savedPw = localStorage.getItem('lumi_remember_pw') || '';
    if (savedId && savedPw) {
        document.getElementById('username').value = savedId;
        document.getElementById('password').value = savedPw;
        document.getElementById('remember-me').checked = true;
    }
});

// If already logged in, redirect to index
if (localStorage.getItem('lumi_logged_in') === '1') {
    window.location.href = 'index.html';
}
