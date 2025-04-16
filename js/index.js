document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const passwordInput = document.getElementById('password');
    const showPasswordBtn = document.createElement('button');
    showPasswordBtn.type = 'button';
    showPasswordBtn.className = 'show-password-btn';
    showPasswordBtn.innerHTML = '<i class="fas fa-eye"></i>';
    
    // Şifre göster/gizle butonunu ekle
    passwordInput.parentNode.appendChild(showPasswordBtn);
    
    // Şifre göster/gizle işlevi
    showPasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        showPasswordBtn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });

    // Giriş formu işlemi
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('http://casepilot.somee.com/Login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userName: username,
                    password: password
                })
            });

            const result = await response.json();
            
            if (result.success) {
                // Kullanıcı bilgilerini localStorage'a kaydet
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('userName', result.data.userName);
                localStorage.setItem('userId', result.data.userId);
                
                // Dashboard'a yönlendir
                window.location.href = 'dashboard.html';
            } else {
                showError('Kullanıcı adı veya şifre hatalı!');
            }
        } catch (error) {
            console.error('Giriş hatası:', error);
            showError('Giriş yapılırken bir hata oluştu!');
        }
    });
});

function showError(message) {
    // Hata mesajı için bir div oluştur
    let errorDiv = document.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        document.querySelector('.form-group:last-child').before(errorDiv);
    }
    
    errorDiv.textContent = message;
    
    // 3 saniye sonra hata mesajını kaldır
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
} 