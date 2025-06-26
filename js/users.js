const API_URL = 'https://socialieve.com/api';
// Kullanıcı işlemleri
import { get, post, del } from './api.js';
import { getToken } from './auth.js';
import { showMessage } from './ui.js';

/**
 * Kullanıcı listesini API'den çeker ve ekrana basar.
 */
export async function loadUsers() {
    const token = getToken();
    const users = await get(`${API_URL}/Users`, token);
    const usersList = document.querySelector('.users-list');
    if (!usersList) return;
    usersList.innerHTML = '';
    users.forEach(user => {
        // Her kullanıcı için bir kart oluştur
        const userCard = document.createElement('div');
        userCard.className = 'user-card';
        userCard.innerHTML = `
            <div class="user-info">
                <h3>${user.name} ${user.surname}</h3>
                <p>E-posta: ${user.mail || '-'}</p>
                <p>Kullanıcı Adı: ${user.userName}</p>
                <p>Şehir: ${user.city}</p>
                <p>İlçe: ${user.district}</p>
            </div>
            <div class="user-actions">
                <button class="btn-edit" data-id="${user.id}">Düzenle</button>
                <button class="btn-delete" data-id="${user.id}">Sil</button>
            </div>
        `;
        usersList.appendChild(userCard);
    });
}

/**
 * Yeni kullanıcı ekler.
 * @param {Object} userData - Eklenecek kullanıcının verileri
 */
export async function addUser(userData) {
    const token = getToken();
    const result = await post(`${API_URL}/Users`, userData, token);
    if (result.success) {
        showMessage('Kullanıcı başarıyla eklendi.', 'success');
        loadUsers();
    } else {
        showMessage('Kullanıcı eklenirken hata: ' + (result.message || ''), 'error');
    }
}

/**
 * Kullanıcıyı siler.
 * @param {number} userId - Silinecek kullanıcının ID'si
 */
export async function deleteUser(userId) {
    const token = getToken();
    const result = await del(`${API_URL}/Users/${userId}`, token);
    if (result.success) {
        showMessage('Kullanıcı silindi.', 'success');
        loadUsers();
    } else {
        showMessage('Kullanıcı silinirken hata: ' + (result.message || ''), 'error');
    }
}

// Kullanıcı düzenle
async function editUser(userId) {
    try {
        const result = await get(`${API_URL}/Users/GetById?id=${userId}`);
        if (result.success && result.data) {
            const user = result.data;
            // Form alanlarını doldur
            document.getElementById('firstName').value = user.name;
            document.getElementById('lastName').value = user.surname;
            document.getElementById('email').value = user.mail;
            document.getElementById('userName').value = user.userName;
            document.getElementById('userCityID').value = user.cityID;
            
            // İlçeleri yükle
            await cities.loadUserDistricts(user.cityID);
            document.getElementById('userDistrictID').value = user.districtID;

            // Formu göster
            ui.toggleForm('addUserForm', true);
        }
    } catch (error) {
        console.error('Kullanıcı bilgileri yüklenirken hata:', error);
        ui.showError('Kullanıcı bilgileri yüklenirken bir hata oluştu');
    }
}

// Form submit işleyicisi
function handleUserSubmit(event) {
    event.preventDefault();
    const formData = {
        name: document.getElementById('firstName').value,
        surname: document.getElementById('lastName').value,
        mail: document.getElementById('email').value,
        userName: document.getElementById('userName').value,
        password: document.getElementById('password').value,
        cityID: document.getElementById('userCityID').value,
        districtID: document.getElementById('userDistrictID').value
    };
    addUser(formData);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Kullanıcı formu submit
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', (e) => handleUserSubmit(e));
    }

    // Yeni kullanıcı butonu
    const addUserButton = document.getElementById('addUserButton');
    if (addUserButton) {
        addUserButton.addEventListener('click', () => {
            ui.toggleForm('addUserForm', true);
            ui.resetForm('userForm');
        });
    }

    // İptal butonu
    const cancelButtons = document.querySelectorAll('.btn-cancel');
    cancelButtons.forEach(button => {
        button.addEventListener('click', () => {
            ui.toggleForm('addUserForm', false);
        });
    });

    // Şehir değiştiğinde ilçeleri yükle
    const userCitySelect = document.getElementById('userCityID');
    if (userCitySelect) {
        userCitySelect.addEventListener('change', (e) => {
            cities.loadUserDistricts(e.target.value);
        });
    }
}); 