document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'https://socialieve.com/api';
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const casesList = document.querySelector('.cases-list');
    const addCaseButton = document.getElementById('addCaseButton');
    const addCaseForm = document.getElementById('addCaseForm');
    const caseForm = document.getElementById('caseForm');

    // Kullanıcı adını göster
    if (userNameDisplay && userName) {
        userNameDisplay.textContent = `Hoş geldiniz, ${userName}`;
    }

    // Dosya listesini yükle
    async function loadCases() {
        if (!casesList) return;
        try {
            casesList.innerHTML = '<div class="loading">Yükleniyor...</div>';
            const response = await fetch(`${API_URL}/CaseFile/GetAll`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });
            const result = await response.json();
            const data = Array.isArray(result) ? result : result.data;
            if (!data || !data.length) {
                casesList.innerHTML = '<div class="empty">Henüz dosya bulunmuyor.</div>';
                return;
            }
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
                    <tr>
                        <td>${escapeHtml(caseFile.name)}</td>
                        <td>${escapeHtml(caseFile.surname)}</td>
                        <td>${escapeHtml(caseFile.caseType)}</td>
                        <td>${escapeHtml(caseFile.applicationType)}</td>
                        <td>${escapeHtml(caseFile.city)}</td>
                        <td>${escapeHtml(caseFile.district)}</td>
                        <td>${escapeHtml(caseFile.identityNumber)}</td>
                        <td>${escapeHtml(caseFile.phoneNumber)}</td>
                        <td>${formatDate(caseFile.dateOfBirth)}</td>
                        <td>${caseFile.entitlementRate}</td>
                        <td>${caseFile.disabilityRate}</td>
                        <td>${formatDate(caseFile.accidentDate)}</td>
                        <td>${formatDate(caseFile.openingDate)}</td>
                        <td>${caseFile.closingDate ? formatDate(caseFile.closingDate) : ''}</td>
                        <td>${getCaseStatusText(caseFile.caseStatus)}</td>
                        <td>
                            <button class='btn-edit' onclick='showCaseDetails(${caseFile.id})'>Detay</button>
                            <button class='btn-delete' onclick='deleteCaseFile(${caseFile.id})'>Sil</button>
                        </td>
                    </tr>
                `;
            });
            tableHtml += `</tbody></table>`;
            casesList.innerHTML = tableHtml;
        } catch (error) {
            casesList.innerHTML = `<div class=\"error\">Hata: ${escapeHtml(error.message)}</div>`;
        }
    }

    // Yardımcı fonksiyonlar
    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR');
    }
    function getCaseStatusText(status) {
        const statusMap = {
            0: 'Açık',
            1: 'Kapalı',
            2: 'Beklemede'
        };
        return statusMap[status] || 'Bilinmiyor';
    }

    // Dava türlerini çekip select'e doldur
    async function populateCaseTypesSelect(selectElement, selectedId) {
        try {
            const response = await fetch(`${API_URL}/CaseTypes/GetAll`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });
            const result = await response.json();
            const data = result.data || [];
            selectElement.innerHTML = '<option value="">Dava Türü Seçiniz</option>';
            data.forEach(type => {
                selectElement.innerHTML += `<option value="${type.id}" ${selectedId == type.id ? 'selected' : ''}>${escapeHtml(type.name)}</option>`;
            });
        } catch (error) {
            selectElement.innerHTML = '<option value="">Dava türleri yüklenemedi</option>';
        }
    }

    // Dosya ekleme formu göster/gizle
    if (addCaseButton && addCaseForm && caseForm) {
        addCaseButton.addEventListener('click', () => {
            addCaseForm.style.display = 'block';
            caseForm.reset();
            const caseTypeSelect = document.getElementById('caseTypeID');
            if (caseTypeSelect) populateCaseTypesSelect(caseTypeSelect);
        });
        addCaseForm.querySelector('.btn-cancel').addEventListener('click', () => {
            addCaseForm.style.display = 'none';
        });
        caseForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Formdan verileri al
            const formData = {
                caseTypeID: parseInt(document.getElementById('caseTypeID').value),
                applicationTypeID: parseInt(document.getElementById('applicationTypeID').value),
                cityID: parseInt(document.getElementById('cityID').value),
                districtID: parseInt(document.getElementById('districtID').value),
                name: document.getElementById('name').value,
                surname: document.getElementById('surname').value,
                identityNumber: document.getElementById('identityNumber').value,
                phoneNumber: document.getElementById('phoneNumber').value,
                dateOfBirth: document.getElementById('dateOfBirth').value,
                entitlementRate: parseInt(document.getElementById('entitlementRate').value),
                disabilityRate: parseInt(document.getElementById('disabilityRate').value),
                accidentDate: document.getElementById('accidentDate').value,
                openingDate: document.getElementById('openingDate').value,
                closingDate: document.getElementById('closingDate').value || null,
                caseStatus: parseInt(document.getElementById('caseStatus').value)
            };
            try {
                const response = await fetch(`${API_URL}/CaseFile`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': '*/*'
                    },
                    body: JSON.stringify(formData)
                });
                if (!response.ok) {
                    throw new Error('Dosya eklenemedi');
                }
                addCaseForm.style.display = 'none';
                loadCases();
            } catch (error) {
                alert('Dosya eklenirken bir hata oluştu: ' + error.message);
            }
        });
    }

    // Detay paneli için fonksiyon
    window.showCaseDetails = async function(caseId) {
        const detailPanel = document.getElementById('caseDetailPanel');
        const casesHeader = document.getElementById('casesHeader');
        if (!detailPanel) return;
        if (casesList) casesList.style.display = 'none';
        if (addCaseButton) addCaseButton.style.display = 'none';
        if (addCaseForm) addCaseForm.style.display = 'none';
        if (casesHeader) casesHeader.style.display = 'none';
        try {
            detailPanel.innerHTML = '<div class="loading">Detaylar yükleniyor...</div>';
            detailPanel.style.display = 'block';
            const response = await fetch(`${API_URL}/CaseFile/Get?caseFileID=${caseId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });
            const result = await response.json();
            const data = result.data || result;
            const sharesHtml = (data.caseFileShares || []).map(share =>
                `<li>${escapeHtml(share.shareUserName)} - %${share.shareRate} (${escapeHtml(share.filePermission)})</li>`
            ).join('');
            const defendantsHtml = (data.caseFileDefendantListDtos || []).map(def =>
                `<li>${escapeHtml(def.name)}</li>`
            ).join('');
            detailPanel.innerHTML = `
                <div class="case-detail-content">
                    <h3>Dosya Detayları</h3>
                    <table class="data-grid">
                        <tr><th>Ad</th><td>${escapeHtml(data.name)}</td></tr>
                        <tr><th>Soyad</th><td>${escapeHtml(data.surname)}</td></tr>
                        <tr><th>Dosya Tipi</th><td>${escapeHtml(data.caseType)}</td></tr>
                        <tr><th>Başvuru Tipi</th><td>${escapeHtml(data.applicationType)}</td></tr>
                        <tr><th>Şehir</th><td>${escapeHtml(data.city)}</td></tr>
                        <tr><th>İlçe</th><td>${escapeHtml(data.district)}</td></tr>
                        <tr><th>TC</th><td>${escapeHtml(data.identityNumber)}</td></tr>
                        <tr><th>Telefon</th><td>${escapeHtml(data.phoneNumber)}</td></tr>
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
                        <button class="btn-cancel" onclick="closeCaseDetailPanel()">Kapat</button>
                    </div>
                </div>
            `;
        } catch (error) {
            detailPanel.innerHTML = `<div class=\"error\">Detaylar yüklenirken hata oluştu!</div>`;
        }
    }

    // Detay panelini kapatırken dosya listesini tekrar göster
    window.closeCaseDetailPanel = function() {
        const detailPanel = document.getElementById('caseDetailPanel');
        const casesHeader = document.getElementById('casesHeader');
        if (detailPanel) detailPanel.style.display = 'none';
        if (casesList) casesList.style.display = 'block';
        if (addCaseButton) addCaseButton.style.display = 'inline-block';
        if (casesHeader) casesHeader.style.display = 'flex';
    }

    window.showUpdateCaseForm = async function(caseId) {
        const detailPanel = document.getElementById('caseDetailPanel');
        if (!detailPanel) return;
        try {
            detailPanel.innerHTML = '<div class="loading">Form yükleniyor...</div>';
            detailPanel.style.display = 'block';
            const response = await fetch(`${API_URL}/CaseFile/Get?caseFileID=${caseId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });
            const result = await response.json();
            const data = result.data || result;
            detailPanel.innerHTML = `
                <div class="case-detail-content">
                    <h3>Dosya Güncelle</h3>
                    <form id="updateCaseForm">
                        <div class="form-group"><label>Ad</label><input type="text" name="name" value="${escapeHtml(data.name)}" required></div>
                        <div class="form-group"><label>Soyad</label><input type="text" name="surname" value="${escapeHtml(data.surname)}" required></div>
                        <div class="form-group"><label>Dava Türü</label><select name="caseTypeID" id="updateCaseTypeID"></select></div>
                        <div class="form-group"><label>Başvuru Tipi ID</label><input type="number" name="applicationTypeID" value="${data.applicationTypeID || ''}" required></div>
                        <div class="form-group"><label>Şehir ID</label><input type="number" name="cityID" value="${data.cityID || ''}" required></div>
                        <div class="form-group"><label>İlçe ID</label><input type="number" name="districtID" value="${data.districtID || ''}" required></div>
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
            // Dava türü select'ini doldur
            const updateCaseTypeSelect = document.getElementById('updateCaseTypeID');
            if (updateCaseTypeSelect) await populateCaseTypesSelect(updateCaseTypeSelect, data.caseTypeID);
            document.getElementById('updateCaseForm').onsubmit = async function(e) {
                e.preventDefault();
                const form = e.target;
                const caseData = {
                    id: caseId,
                    caseTypeID: parseInt(form.caseTypeID.value),
                    applicationTypeID: parseInt(form.applicationTypeID.value),
                    cityID: parseInt(form.cityID.value),
                    districtID: parseInt(form.districtID.value),
                    name: form.name.value,
                    surname: form.surname.value,
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
        } catch (error) {
            detailPanel.innerHTML = `<div class=\"error\">Form yüklenirken hata oluştu!</div>`;
        }
    }

    async function updateCaseFile(caseData) {
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
                loadCases();
                document.getElementById('caseDetailPanel').style.display = 'none';
            } else {
                alert('Güncelleme başarısız: ' + (result.message || ''));
            }
        } catch (error) {
            alert('Güncelleme sırasında hata oluştu!');
        }
    }

    // Silme fonksiyonu
    window.deleteCaseFile = async function(caseId) {
        if (!confirm('Bu dosyayı silmek istediğinizden emin misiniz?')) return;
        try {
            const response = await fetch(`${API_URL}/CaseFile/${caseId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });
            if (response.ok) {
                loadCases();
                const detailPanel = document.getElementById('caseDetailPanel');
                if (detailPanel) detailPanel.style.display = 'none';
            } else {
                alert('Dosya silinirken bir hata oluştu!');
            }
        } catch (error) {
            alert('Dosya silinirken bir hata oluştu!');
        }
    }

    // Sayfa ilk açıldığında sadece dosya listesini yükle
    loadCases();
}); 