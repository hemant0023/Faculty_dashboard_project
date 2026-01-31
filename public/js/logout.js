function logout() {
    // Remove saved data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Or clear everything:
    localStorage.clear();
    
    // Redirect to login
    window.location.href = 'login.html';
}