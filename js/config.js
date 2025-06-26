// config.js
// Proje genelinde kullanılacak sabitler ve temel ayarlar
export const API_URL = 'https://socialieve.com/api';

// Sayfa elementleri
const ELEMENTS = {
    sections: document.querySelectorAll('.section'),
    sidebarLinks: document.querySelectorAll('.sidebar-nav a'),
    tabButtons: document.querySelectorAll('.tab-button'),
    tabContents: document.querySelectorAll('.tab-content'),
    userNameDisplay: document.getElementById('userNameDisplay'),
    logoutButton: document.getElementById('logoutButton'),
    casesList: document.querySelector('.cases-list'),
    usersList: document.querySelector('.users-list'),
    addCaseForm: document.getElementById('addCaseForm'),
    addUserForm: document.getElementById('addUserForm'),
    addShareForm: document.getElementById('addShareForm'),
    addDocumentForm: document.getElementById('addDocumentForm'),
    addExpenseForm: document.getElementById('addExpenseForm'),
    addDebtorForm: document.getElementById('addDebtorForm')
}; 