// API istekleri için yardımcı fonksiyonlar
import { API_URL } from './config.js';

export async function get(endpoint, token) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    return res.json();
}

export async function post(endpoint, data, token) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(data)
    });
    return res.json();
}

export async function del(endpoint, token) {
    const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    return res.json();
}

// FormData ile POST isteği
async function postFormData(endpoint, formData, requiresAuth = true) {
    const headers = {
        'Accept': '*/*'
    };
    
    if (requiresAuth) {
        headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}

const api = {
    get,
    post,
    del,
    postFormData
}; 