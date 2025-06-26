// Yardımcı Fonksiyonlar
function escapeHtml(text) {
    if (text == null) return '';
    return text.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date)) return '';
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getCaseStatusText(status) {
    switch (status) {
        case 0: return 'Açık';
        case 1: return 'Kapalı';
        case 2: return 'Beklemede';
        default: return 'Bilinmeyen';
    }
}

async function fetchData(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('API Hatası:', error);
        throw error;
    }
}

// Global Değişkenler
const API_URL = 'https://socialieve.com/api';
const addShareForm = document.getElementById('addShareForm');
const showAddShareFormBtn = document.getElementById('showAddShareForm');
const cancelAddShareBtn = document.getElementById('cancelAddShare');
const sharesList = document.getElementById('sharesList');
const caseFileSelect = document.getElementById('caseFileID');
const userSelect = document.getElementById('userID');
const shareAmountInput = document.getElementById('shareAmount');

let editMode = false;
let editingShareId = null;

// Sayfa Yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    loadCaseFiles();
    loadUsers();
    loadShares();

    showAddShareFormBtn.addEventListener('click', () => showForm('new'));
    cancelAddShareBtn.addEventListener('click', hideForm);

    addShareForm.addEventListener('submit', handleFormSubmit);
});

// Form İşlemleri
function showForm(mode, share = null) {
    editMode = (mode === 'edit');
    addShareForm.style.display = 'block';

    if (editMode && share) {
        editingShareId = share.id;
        caseFileSelect.value = share.caseFileID;
        userSelect.value = share.userID;
        shareAmountInput.value = share.shareAmount;
    } else {
        editingShareId = null;
        addShareForm.reset();
    }
}

function hideForm() {
    addShareForm.style.display = 'none';
    addShareForm.reset();
    editMode = false;
    editingShareId = null;
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const shareData = {
        caseFileID: parseInt(caseFileSelect.value),
        userID: parseInt(userSelect.value),
        shareAmount: parseFloat(shareAmountInput.value)
    };

    const url = editMode
        ? `${API_URL}/api/shares/${editingShareId}`
        : `${API_URL}/api/shares`;

    const method = editMode ? 'PUT' : 'POST';

    try {
        await fetchData(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(shareData)
        });

        hideForm();
        loadShares();
    } catch (error) {
        alert('İşlem sırasında hata oluştu.');
    }
}

// Case Files
async function loadCaseFiles() {
    const casesList = document.querySelector('.cases-list');
    if (!casesList) return console.error("'.cases-list' elementi bulunamadı!");

    const token = localStorage.getItem('token');
    if (!token) {
        casesList.innerHTML = '<div class="error">Giriş yapmanız gerekiyor!</div>';
        return;
    }

    try {
        casesList.innerHTML = '<div class="loading">Yükleniyor...</div>';

        const data = await fetchData(`${API_URL}/CaseFile/GetAll`, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': '*/*' }
        });

        if (!data.length) {
            casesList.innerHTML = '<div class="empty">Henüz dosya bulunmuyor.</div>';
            return;
        }

        // Listeyi doldur
        let tableHtml = `
            <table class="data-grid">
                <thead>
                    <tr>
                        <th>Ad</th>
                        <th>Soyad</th>
                        <th>Dosya Tipi</th>
                        <th>Başvuru Tipi</th>
                        <th>Şehir</th>
                        <th>İlçe</th>
                        <th>TC</th>
                        <th>Telefon</th>
                        <th>Doğum Tarihi</th>
                        <th>Hak Ediş (%)</th>
                        <th>Engel (%)</th>
                        <th>Kaza Tarihi</th>
                        <th>Açılış Tarihi</th>
                        <th>Kapanış Tarihi</th>
                        <th>Durum</th>
                        <th>İşlemler</th>
                    </tr>
                </thead>
                <tbody>
        `;
        data.forEach(caseFile => {
            tableHtml += `
                <tr data-case-id="${caseFile.id}">
                    <td data-label="Ad">${escapeHtml(caseFile.name)}</td>
                    <td data-label="Soyad">${escapeHtml(caseFile.surname)}</td>
                    <td data-label="Dosya Tipi">${escapeHtml(caseFile.caseType)}</td>
                    <td data-label="Başvuru Tipi">${escapeHtml(caseFile.applicationType)}</td>
                    <td data-label="Şehir">${escapeHtml(caseFile.city)}</td>
                    <td data-label="İlçe">${escapeHtml(caseFile.district)}</td>
                    <td data-label="TC">${escapeHtml(caseFile.identityNumber)}</td>
                    <td data-label="Telefon">${escapeHtml(caseFile.phoneNumber)}</td>
                    <td data-label="Doğum Tarihi">${formatDate(caseFile.dateOfBirth)}</td>
                    <td data-label="Hak Ediş (%)">${caseFile.entitlementRate}</td>
                    <td data-label="Engel (%)">${caseFile.disabilityRate}</td>
                    <td data-label="Kaza Tarihi">${formatDate(caseFile.accidentDate)}</td>
                    <td data-label="Açılış Tarihi">${formatDate(caseFile.openingDate)}</td>
                    <td data-label="Kapanış Tarihi">${caseFile.closingDate ? formatDate(caseFile.closingDate) : ''}</td>
                    <td data-label="Durum">${getCaseStatusText(caseFile.caseStatus)}</td>
                    <td data-label="İşlemler">
                        <button class='btn-edit' onclick='showCaseDetails(${caseFile.id})'>Detay</button>
                        <button class='btn-delete' onclick='deleteCaseFile(${caseFile.id})'>Sil</button>
                    </td>
                </tr>
            `;
        });
        tableHtml += `</tbody></table>`;
        casesList.innerHTML = tableHtml;

        casesList.querySelectorAll('.case-item').forEach(item => {
            item.addEventListener('click', () => {
                const caseID = item.getAttribute('data-case-id');
                showCaseDetails(caseID);
            });
        });

    } catch (error) {
        casesList.innerHTML = `<div class="error">Hata: ${escapeHtml(error.message)}</div>`;
    }
}

// Users
async function loadUsers() {
    try {
        const users = await fetchData(`${API_URL}/Users/GetAll`);
        userSelect.innerHTML = '<option value="">Kullanıcı Seçin</option>';

        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.firstName} ${user.lastName}`;
            userSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Kullanıcı listesi yüklenirken hata:', error);
    }
}

// Shares
async function loadShares() {
    try {
        const shares = await fetchData(`${API_URL}/shares`);
        sharesList.innerHTML = '';

        shares.forEach(share => {
            const shareElement = document.createElement('div');
            shareElement.className = 'share-item';
            shareElement.innerHTML = `
                <div class="share-info">
                    <h4>${share.caseFile.caseNumber} - ${share.caseFile.title}</h4>
                    <p>Kullanıcı: ${share.user.firstName} ${share.user.lastName}</p>
                    <p>Pay Oranı: %${share.shareAmount}</p>
                </div>
                <div class="share-actions">
                    <button class="btn btn-edit" onclick="startEditShare(${share.id})">Düzenle</button>
                    <button class="btn btn-delete" onclick="deleteShare(${share.id})">Sil</button>
                </div>
            `;
            sharesList.appendChild(shareElement);
        });
    } catch (error) {
        console.error('Paylar yüklenirken hata:', error);
    }
}

// Share Edit
async function startEditShare(shareId) {
    try {
        const share = await fetchData(`${API_URL}/shares/${shareId}`);
        showForm('edit', share);
    } catch (error) {
        alert('Düzenleme bilgileri alınamadı!');
    }
}

// Share Delete
async function deleteShare(shareId) {
    if (confirm('Bu payı silmek istediğinizden emin misiniz?')) {
        try {
            await fetchData(`${API_URL}/shares/${shareId}`, { method: 'DELETE' });
            loadShares();
        } catch (error) {
            alert('Silme işlemi sırasında hata oluştu.');
        }
    }
}

// Case Detail
async function showCaseDetails(caseId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/CaseFile/Get?caseFileID=${caseId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': '*/*'
            }
        });
        const result = await response.json();
        const data = result.data || result; // API'den direkt data dönebilir

        // Paylar ve davalılar için liste oluştur
        const sharesHtml = (data.caseFileShares || []).map(share =>
            `<li>${share.shareUserName} - %${share.shareRate} (${share.filePermission})</li>`
        ).join('');
        const defendantsHtml = (data.caseFileDefendantListDtos || []).map(def =>
            `<li>${def.name}</li>`
        ).join('');

        // Detay panelini doldur
        document.getElementById('caseDetailPanel').innerHTML = `
            <div class="case-detail-content">
                <h3>Dosya Detayları</h3>
                <table class="data-grid">
                    <tr><th>Ad</th><td>${data.name}</td></tr>
                    <tr><th>Soyad</th><td>${data.surname}</td></tr>
                    <tr><th>Dosya Tipi</th><td>${data.caseType}</td></tr>
                    <tr><th>Başvuru Tipi</th><td>${data.applicationType}</td></tr>
                    <tr><th>Şehir</th><td>${data.city}</td></tr>
                    <tr><th>İlçe</th><td>${data.district}</td></tr>
                    <tr><th>TC</th><td>${data.identityNumber}</td></tr>
                    <tr><th>Telefon</th><td>${data.phoneNumber}</td></tr>
                    <tr><th>Doğum Tarihi</th><td>${formatDate(data.dateOfBirth)}</td></tr>
                    <tr><th>Hak Ediş (%)</th><td>${data.entitlementRate}</td></tr>
                    <tr><th>Engel (%)</th><td>${data.disabilityRate}</td></tr>
                    <tr><th>Kaza Tarihi</th><td>${formatDate(data.accidentDate)}</td></tr>
                    <tr><th>Açılış Tarihi</th><td>${formatDate(data.openingDate)}</td></tr>
                    <tr><th>Kapanış Tarihi</th><td>${data.closingDate ? formatDate(data.closingDate) : ''}</td></tr>
                    <tr><th>Durum</th><td>${getCaseStatusText(data.caseStatus)}</td></tr>
                    <tr><th>Paylar</th><td><ul>${sharesHtml}</ul></td></tr>
                    <tr><th>Davalılar</th><td><ul>${defendantsHtml}</ul></td></tr>
                </table>
                <div class="case-detail-actions">
                    <button class="btn-edit" onclick="showUpdateCaseForm(${data.id})">Güncelle</button>
                    <button class="btn-delete" onclick="deleteCaseFile(${data.id})">Sil</button>
                </div>
            </div>
        `;
        document.getElementById('caseDetailPanel').style.display = 'block';
    } catch (error) {
        alert('Detaylar yüklenirken hata oluştu!');
    }
}

// Dosya silme fonksiyonu ekle
async function deleteCaseFile(caseId) {
    if (confirm('Bu dosyayı silmek istediğinizden emin misiniz?')) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/CaseFile/${caseId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });
            if (response.ok) {
                loadCaseFiles();
            } else {
                alert('Dosya silinirken bir hata oluştu!');
            }
        } catch (error) {
            console.error('Dosya silme hatası:', error);
            alert('Dosya silinirken bir hata oluştu!');
        }
    }
}

function showUpdateCaseForm(caseId) {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/api/CaseFile/Get?caseFileID=${caseId}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': '*/*'
        }
    })
    .then(res => res.json())
    .then(result => {
        const data = result.data || result;
        // Güncelleme formunu oluştur
        document.getElementById('caseDetailPanel').innerHTML = `
            <div class="case-detail-content">
                <h3>Dosya Güncelle</h3>
                <form id="updateCaseForm">
                    <div class="form-group"><label>Ad</label><input type="text" name="name" value="${escapeHtml(data.name)}" required></div>
                    <div class="form-group"><label>Soyad</label><input type="text" name="surname" value="${escapeHtml(data.surname)}" required></div>
                    <div class="form-group"><label>Dosya Tipi</label><input type="text" name="caseType" value="${escapeHtml(data.caseType)}" required></div>
                    <div class="form-group"><label>Başvuru Tipi</label><input type="text" name="applicationType" value="${escapeHtml(data.applicationType)}" required></div>
                    <div class="form-group"><label>Şehir</label><input type="text" name="city" value="${escapeHtml(data.city)}" required></div>
                    <div class="form-group"><label>İlçe</label><input type="text" name="district" value="${escapeHtml(data.district)}" required></div>
                    <div class="form-group"><label>TC</label><input type="text" name="identityNumber" value="${escapeHtml(data.identityNumber)}" required></div>
                    <div class="form-group"><label>Telefon</label><input type="text" name="phoneNumber" value="${escapeHtml(data.phoneNumber)}" required></div>
                    <div class="form-group"><label>Doğum Tarihi</label><input type="date" name="dateOfBirth" value="${data.dateOfBirth ? data.dateOfBirth.substring(0,10) : ''}" required></div>
                    <div class="form-group"><label>Hak Ediş (%)</label><input type="number" name="entitlementRate" value="${data.entitlementRate}" required></div>
                    <div class="form-group"><label>Engel (%)</label><input type="number" name="disabilityRate" value="${data.disabilityRate}" required></div>
                    <div class="form-group"><label>Kaza Tarihi</label><input type="date" name="accidentDate" value="${data.accidentDate ? data.accidentDate.substring(0,10) : ''}" required></div>
                    <div class="form-group"><label>Açılış Tarihi</label><input type="date" name="openingDate" value="${data.openingDate ? data.openingDate.substring(0,10) : ''}" required></div>
                    <div class="form-group"><label>Kapanış Tarihi</label><input type="date" name="closingDate" value="${data.closingDate ? data.closingDate.substring(0,10) : ''}"></div>
                    <div class="form-group"><label>Durum</label><select name="caseStatus"><option value="0" ${data.caseStatus==0?'selected':''}>Açık</option><option value="1" ${data.caseStatus==1?'selected':''}>Kapalı</option><option value="2" ${data.caseStatus==2?'selected':''}>Beklemede</option></select></div>
                    <div class="form-actions">
                        <button type="submit" class="btn-edit">Kaydet</button>
                        <button type="button" class="btn-cancel" onclick="document.getElementById('caseDetailPanel').style.display='none'">İptal</button>
                    </div>
                </form>
            </div>
        `;
        document.getElementById('caseDetailPanel').style.display = 'block';
        document.getElementById('updateCaseForm').onsubmit = async function(e) {
            e.preventDefault();
            const form = e.target;
            const caseData = {
                id: caseId,
                name: form.name.value,
                surname: form.surname.value,
                caseType: form.caseType.value,
                applicationType: form.applicationType.value,
                city: form.city.value,
                district: form.district.value,
                identityNumber: form.identityNumber.value,
                phoneNumber: form.phoneNumber.value,
                dateOfBirth: form.dateOfBirth.value,
                entitlementRate: parseFloat(form.entitlementRate.value),
                disabilityRate: parseFloat(form.disabilityRate.value),
                accidentDate: form.accidentDate.value,
                openingDate: form.openingDate.value,
                closingDate: form.closingDate.value,
                caseStatus: parseInt(form.caseStatus.value)
            };
            await updateCaseFile(caseData);
        };
    });
}

async function updateCaseFile(caseData) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_URL}/CaseFile/Update`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': '*/*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(caseData)
        });
        const result = await response.json();
        if (result.success) {
            alert('Dosya başarıyla güncellendi!');
            loadCaseFiles();
            document.getElementById('caseDetailPanel').style.display = 'none';
        } else {
            alert('Güncelleme başarısız: ' + (result.message || ''));
        }
    } catch (error) {
        alert('Güncelleme sırasında hata oluştu!');
    }
}
