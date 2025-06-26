// Kimlik doğrulama işlemleri
import { get } from './api.js';

// Kullanıcı bilgilerini yükle
export async function loadUserInfo() {
    const token = getToken();
    try {
        const result = await get('/api/Users/GetAll', token);
        if (result.success && result.data) {
            const userNameDisplay = document.getElementById('userNameDisplay');
            if (userNameDisplay) {
                userNameDisplay.textContent = `${result.data.name} ${result.data.surname}`;
            }
        }
    } catch (error) {
        console.error('Kullanıcı bilgileri yüklenirken hata:', error);
    }
}

// Çıkış yap
export function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// Token kontrolü
export function isAuthenticated() {
    return !!localStorage.getItem('token');
}

// Token'ı al
export function getToken() {
    return localStorage.getItem('token');
} 