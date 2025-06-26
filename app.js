document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const API_URL = 'https://socialieve.com';

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userName = document.getElementById('userName').value;
        const password = document.getElementById('password').value;
        const submitButton = loginForm.querySelector('button[type="submit"]');
        
        if (!userName || !password) {
            errorMessage.textContent = 'Lütfen tüm alanları doldurun';
            return;
        }

        // Butonu devre dışı bırak
        submitButton.disabled = true;
        submitButton.textContent = 'Giriş yapılıyor...';
        errorMessage.textContent = '';

        try {
            const response = await fetch(`${API_URL}/Login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*'
                },
                body: JSON.stringify({ userName, password })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Giriş başarısız');
            }

            // Token bilgilerini kaydet
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('tokenExpiration', result.data.expiration);
            localStorage.setItem('userName', userName);
            
            // Dashboard sayfasına yönlendir
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Giriş hatası:', error);
            errorMessage.textContent = 'Kullanıcı adı veya şifre hatalı';
        } finally {
            // Butonu tekrar aktif et
            submitButton.disabled = false;
            submitButton.textContent = 'Giriş Yap';
        }
    });
}); 