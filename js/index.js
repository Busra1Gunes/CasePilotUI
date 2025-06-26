document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');

    if (passwordInput) {
        const showPasswordBtn = document.createElement('button');
        showPasswordBtn.type = 'button';
        showPasswordBtn.className = 'show-password-btn';
        showPasswordBtn.innerHTML = '<i class="fas fa-eye"></i>';

        passwordInput.parentNode.appendChild(showPasswordBtn);

        showPasswordBtn.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            showPasswordBtn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('https://socialieve.com/api/Users/Login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'accept': '*/*'
                    },
                    body: JSON.stringify({
                        userName: username,
                        password: password
                    })
                });

                if (!response.ok) {
                    throw new Error('Sunucu hatası: ' + response.status);
                }

                const result = await response.json();

                if (result.success) {
                    localStorage.setItem('token', result.data.token);
                    localStorage.setItem('tokenExpiration', result.data.expiration);
                    window.location.href = 'dashboard.html';
                } else {
                    showError(result.message || 'Kullanıcı adı veya şifre hatalı!');
                }

            } catch (error) {
                console.error('Giriş hatası:', error);
                showError('Giriş yapılırken bir hata oluştu!');
            }
        });
    } else {
        console.error('Login form bulunamadı!');
    }
});

function showError(message) {
    let errorDiv = document.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        document.getElementById('loginForm').prepend(errorDiv);
    }
    errorDiv.textContent = message;

    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}
