// API URL'si
const API_URL = 'http://casepilot.somee.com';

// Sayfa elementleri
const sections = document.querySelectorAll('.section');
const sidebarLinks = document.querySelectorAll('.sidebar-nav a');
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');
const userNameDisplay = document.getElementById('userNameDisplay');
const logoutButton = document.getElementById('logoutButton');
const casesList = document.querySelector('.cases-list');
const usersList = document.querySelector('.users-list');

// Form elementleri
const addCaseForm = document.getElementById('addCaseForm');
const addUserForm = document.getElementById('addUserForm');
const addShareForm = document.getElementById('addShareForm');
const addDocumentForm = document.getElementById('addDocumentForm');
const addExpenseForm = document.getElementById('addExpenseForm');
const addDebtorForm = document.getElementById('addDebtorForm');

// Kullanıcı bilgilerini yükle
async function loadUserInfo() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/Users/current`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();
        if (result.success && result.data) {
            userNameDisplay.textContent = `${result.data.name} ${result.data.surname}`;
        }
    } catch (error) {
        console.error('Kullanıcı bilgileri yüklenirken hata:', error);
    }
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    // Kullanıcı bilgilerini yükle
    loadUserInfo();
    
    // Dosya listesini yükle
    loadCaseFiles();
    
    // Sidebar linklerine tıklama olayı ekle
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionName = link.getAttribute('data-section');
            showSection(sectionName);
            
            // Kullanıcılar bölümü seçildiğinde kullanıcı listesini yükle
            if (sectionName === 'users') {
                loadUsers();
            }
        });
    });
    
    // Tab butonlarına tıklama olayı ekle
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            showTab(tabName);
        });
    });
    
    // Çıkış butonuna tıklama olayı ekle
    logoutButton.addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = 'index.html';
    });

    // Yeni Dosya Ekle butonu
    document.getElementById('addCaseButton').addEventListener('click', () => {
        if (addCaseForm) {
            addCaseForm.style.display = 'block';
            // Önce şehirleri yükle
            loadCities();
            // Dosya tiplerini de yükle
            loadCaseTypes();
        }
    });

    // Yeni Kullanıcı Ekle butonu
    document.getElementById('addUserButton').addEventListener('click', () => {
        if (addUserForm) {
            addUserForm.style.display = 'block';
            loadUserCities();
        }
    });

    // Form iptal butonları
    document.querySelectorAll('.btn-cancel').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const form = e.target.closest('.form-container');
            if (form) {
                form.style.display = 'none';
                form.querySelector('form').reset();
            }
        });
    });

    // Form submit işlemleri
    document.getElementById('caseForm').addEventListener('submit', handleCaseSubmit);
    document.getElementById('shareForm').addEventListener('submit', handleShareSubmit);
    document.getElementById('expenseForm').addEventListener('submit', handleExpenseSubmit);
    document.getElementById('documentForm').addEventListener('submit', handleDocumentSubmit);
    document.getElementById('debtorForm').addEventListener('submit', handleDebtorSubmit);

    // Şehir seçildiğinde ilçeleri yükle
    document.getElementById('cityID').addEventListener('change', (e) => {
        if (e.target.value) {
            loadDistricts(e.target.value);
        }
    });

    // Kullanıcı şehir seçildiğinde ilçeleri yükle
    document.getElementById('userCityID').addEventListener('change', (e) => {
        if (e.target.value) {
            loadUserDistricts(e.target.value);
        }
    });

    // Dosya tipi seçildiğinde başvuru tiplerini yükle
    loadCaseTypes();
});

// Şehirleri yükle
async function loadCities() {
    try {
        console.log('Şehirler yükleniyor...');
        const response = await fetch(`${API_URL}/cityList`, {
            method: 'GET',
            headers: {
                'accept': '*/*'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('API Yanıtı:', response);
        const result = await response.json();
        console.log('Şehirler:', result);
        
        if (result && result.data) {
            const citySelect = document.getElementById('cityID');
            if (!citySelect) {
                console.error('cityID elementi bulunamadı');
                return;
            }

            citySelect.innerHTML = '<option value="">Şehir Seçiniz</option>';
            
            result.data.forEach(city => {
                const option = document.createElement('option');
                option.value = city.id;
                option.textContent = city.name;
                citySelect.appendChild(option);
            });

            // Şehir seçildiğinde ilçeleri yükle
            citySelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    loadDistricts(e.target.value);
                }
            });
        } else {
            console.error('Şehir verisi bulunamadı:', result);
        }
    } catch (error) {
        console.error('Şehirler yüklenirken hata:', error);
    }
}

// İlçeleri yükle
async function loadDistricts(cityId) {
    try {
        if (!cityId) {
            console.error('Şehir ID boş olamaz');
            return;
        }

        console.log('İlçeler yükleniyor, Şehir ID:', cityId);
        const response = await fetch(`${API_URL}/districtList?CityID=${cityId}`, {
            method: 'GET',
            headers: {
                'accept': '*/*'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('API Yanıtı:', response);
        const result = await response.json();
        console.log('İlçeler:', result);
        
        if (result && result.data) {
            const districtSelect = document.getElementById('districtID');
            if (!districtSelect) {
                console.error('districtID elementi bulunamadı');
                return;
            }

            districtSelect.innerHTML = '<option value="">İlçe Seçiniz</option>';
            
            result.data.forEach(district => {
                const option = document.createElement('option');
                option.value = district.id;
                option.textContent = district.name;
                districtSelect.appendChild(option);
            });
        } else {
            console.error('İlçe verisi bulunamadı:', result);
        }
    } catch (error) {
        console.error('İlçeler yüklenirken hata:', error);
    }
}

// Kullanıcı formu için şehir ve ilçe yükleme
async function loadUserCities() {
    try {
        console.log('Kullanıcı şehirleri yükleniyor...');
        const response = await fetch(`${API_URL}/cityList`, {
            headers: {
                'accept': '*/*'
            }
        });
        console.log('API Yanıtı:', response);
        const result = await response.json();
        console.log('Kullanıcı Şehirleri:', result);
        
        if (result && result.data) {
            const citySelect = document.getElementById('userCityID');
            citySelect.innerHTML = '<option value="">Şehir Seçiniz</option>';
            
            result.data.forEach(city => {
                const option = document.createElement('option');
                option.value = city.id;
                option.textContent = city.name;
                citySelect.appendChild(option);
            });
        } else {
            console.error('Kullanıcı şehir verisi bulunamadı:', result);
        }
    } catch (error) {
        console.error('Kullanıcı şehirleri yüklenirken hata:', error);
    }
}

async function loadUserDistricts(cityId) {
    try {
        console.log('Kullanıcı ilçeleri yükleniyor, Şehir ID:', cityId);
        const response = await fetch(`${API_URL}/districtList?CityID=${cityId}`, {
            headers: {
                'accept': '*/*'
            }
        });
        console.log('API Yanıtı:', response);
        const result = await response.json();
        console.log('Kullanıcı İlçeleri:', result);
        
        if (result && result.data) {
            const districtSelect = document.getElementById('userDistrictID');
            districtSelect.innerHTML = '<option value="">İlçe Seçiniz</option>';
            
            result.data.forEach(district => {
                const option = document.createElement('option');
                option.value = district.id;
                option.textContent = district.name;
                districtSelect.appendChild(option);
            });
        } else {
            console.error('Kullanıcı ilçe verisi bulunamadı:', result);
        }
    } catch (error) {
        console.error('Kullanıcı ilçeleri yüklenirken hata:', error);
    }
}

// Dosya ekleme formu gönderildiğinde
async function handleCaseSubmit(e) {
    e.preventDefault();
    
    const formData = {
        caseTypeID: document.getElementById('caseTypeID').value,
        applicationTypeID: document.getElementById('applicationTypeID').value,
        cityID: document.getElementById('cityID').value,
        districtID: document.getElementById('districtID').value,
        name: document.getElementById('name').value,
        surname: document.getElementById('surname').value,
        identityNumber: document.getElementById('identityNumber').value,
        phoneNumber: document.getElementById('phoneNumber').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        entitlementRate: document.getElementById('entitlementRate').value,
        disabilityRate: document.getElementById('disabilityRate').value,
        accidentDate: document.getElementById('accidentDate').value
    };

    try {
        const response = await fetch(`${API_URL}/api/CaseFile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        if (result.success) {
            alert('Dosya başarıyla eklendi.');
            document.getElementById('addCaseForm').style.display = 'none';
            document.getElementById('caseForm').reset();
            loadCaseFiles();
        } else {
            alert('Dosya eklenirken bir hata oluştu: ' + result.message);
        }
    } catch (error) {
        console.error('Dosya eklenirken hata:', error);
        alert('Dosya eklenirken bir hata oluştu.');
    }
}

// Kullanıcı ekleme formu gönderildiğinde
async function handleUserSubmit(e) {
    e.preventDefault();
    
    const formData = {
        cityID: document.getElementById('userCityID').value,
        districtID: document.getElementById('userDistrictID').value,
        name: document.getElementById('firstName').value,
        surname: document.getElementById('lastName').value,
        mail: document.getElementById('email').value,
        userName: document.getElementById('userName').value,
        password: document.getElementById('password').value
    };

    try {
        const response = await fetch(`${API_URL}/api/Users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        if (result.success) {
            alert('Kullanıcı başarıyla eklendi.');
            document.getElementById('addUserForm').style.display = 'none';
            document.getElementById('userForm').reset();
            loadUsers();
        } else {
            alert('Kullanıcı eklenirken bir hata oluştu: ' + result.message);
        }
    } catch (error) {
        console.error('Kullanıcı eklenirken hata:', error);
        alert('Kullanıcı eklenirken bir hata oluştu.');
    }
}

// Dosya listesini yükle
async function loadCaseFiles() {
    try {
        const token = localStorage.getItem('token');
        console.log('Dosya listesi yükleniyor...');
        const response = await fetch(`${API_URL}/api/CaseFile/list`, {
            method: 'GET',
            headers: {
                'accept': '*/*',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('API Yanıtı:', response);
        const result = await response.json();
        console.log('Dosya Listesi:', result);
        
        if (result && result.data) {
            const casesList = document.querySelector('.cases-list');
            casesList.innerHTML = '';
            
            result.data.forEach(caseFile => {
                const caseCard = document.createElement('div');
                caseCard.className = 'case-card';
                caseCard.innerHTML = `
                    <div class="case-info">
                        <h3>${caseFile.name} ${caseFile.surname}</h3>
                        <p><strong>TC:</strong> <span>${caseFile.identityNumber}</span></p>
                        <p><strong>Telefon:</strong> <span>${caseFile.phoneNumber}</span></p>
                        <p><strong>Dosya Tipi:</strong> <span>${caseFile.caseType}</span></p>
                        <p><strong>Başvuru Tipi:</strong> <span>${caseFile.applicationType}</span></p>
                        <p><strong>Şehir:</strong> <span>${caseFile.city}</span></p>
                        <p><strong>İlçe:</strong> <span>${caseFile.district}</span></p>
                        <p><strong>Hak Sahipliği Oranı:</strong> <span>${caseFile.entitlementRate}%</span></p>
                        <p><strong>Maluliyet Oranı:</strong> <span>${caseFile.disabilityRate}%</span></p>
                        <p><strong>Kaza Tarihi:</strong> <span>${new Date(caseFile.accidentDate).toLocaleDateString('tr-TR')}</span></p>
                        <p><strong>Açılış Tarihi:</strong> <span>${new Date(caseFile.openingDate).toLocaleDateString('tr-TR')}</span></p>
                        <p><strong>Kapanış Tarihi:</strong> <span>${caseFile.closingDate ? new Date(caseFile.closingDate).toLocaleDateString('tr-TR') : '-'}</span></p>
                    </div>
                    <div class="case-actions">
                        <button class="btn-edit" onclick="editCase(${caseFile.id})">Düzenle</button>
                        <button class="btn-delete" onclick="deleteCase(${caseFile.id})">Sil</button>
                    </div>
                `;
                casesList.appendChild(caseCard);
            });
        } else {
            console.error('Dosya listesi verisi bulunamadı:', result);
        }
    } catch (error) {
        console.error('Dosya listesi yüklenirken hata:', error);
    }
}

// Kullanıcı listesini yükle
async function loadUsers() {
    try {
        console.log('Kullanıcı listesi yükleniyor...');
        const response = await fetch(`${API_URL}/api/Users`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        console.log('API Yanıtı:', response);
        const result = await response.json();
        console.log('Kullanıcı Listesi:', result);
        
        if (result) { // API direkt array dönüyor
            const usersList = document.querySelector('.users-list');
            usersList.innerHTML = '';
            
            result.forEach(user => {
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
                        <button class="btn-edit" onclick="editUser(${user.id})">Düzenle</button>
                        <button class="btn-delete" onclick="deleteUser(${user.id})">Sil</button>
                    </div>
                `;
                usersList.appendChild(userCard);
            });
        } else {
            console.error('Kullanıcı listesi verisi bulunamadı');
        }
    } catch (error) {
        console.error('Kullanıcı listesi yüklenirken hata:', error);
    }
}

// Bölüm gösterme/gizleme
function showSection(sectionName) {
    // Tüm bölümleri gizle
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Tüm linklerin active sınıfını kaldır
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Dosya detay bölümünü gizle
    const caseDetailsSection = document.getElementById('caseDetailsSection');
    if (caseDetailsSection) {
        caseDetailsSection.classList.remove('active');
    }
    
    // Seçilen bölümü göster
    const selectedSection = document.getElementById(`${sectionName}Section`);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    // Seçilen linki aktif yap
    const selectedLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (selectedLink) {
        selectedLink.classList.add('active');
    }
}

// Dosya detaylarını göster
async function editCase(caseId) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/api/CaseFile/${caseId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'accept': '*/*'
            }
        });

        const result = await response.json();
        console.log('Dosya detayları:', result);
        
        if (result && result.data) {
            // Önce cases section'ı gizle
            document.getElementById('casesSection').classList.remove('active');
            
            // Dosya detay bölümünü göster
            const caseDetailsSection = document.getElementById('caseDetailsSection');
            if (!caseDetailsSection) {
                // Eğer section yoksa oluştur
                const main = document.querySelector('main');
                const section = document.createElement('section');
                section.id = 'caseDetailsSection';
                section.className = 'section';
                main.appendChild(section);
            }
            
            // Section'ı aktif yap
            document.getElementById('caseDetailsSection').classList.add('active');
            
            // Dosya detaylarını doldur
            const caseDetails = document.getElementById('caseDetailsSection');
            if (caseDetails) {
                caseDetails.innerHTML = `
                    <div class="section-header">
                        <h2>${result.data.name} ${result.data.surname}</h2>
                        <button onclick="showSection('cases')" class="btn-back">Geri Dön</button>
                    </div>
                    <div class="case-info">
                        <p><strong>TC:</strong> ${result.data.identityNumber}</p>
                        <p><strong>Telefon:</strong> ${result.data.phoneNumber}</p>
                        <p><strong>Dosya Tipi:</strong> ${result.data.caseType}</p>
                        <p><strong>Başvuru Tipi:</strong> ${result.data.applicationType}</p>
                        <p><strong>Şehir:</strong> ${result.data.city}</p>
                        <p><strong>İlçe:</strong> ${result.data.district}</p>
                        <p><strong>Hak Sahipliği Oranı:</strong> ${result.data.entitlementRate}%</p>
                        <p><strong>Maluliyet Oranı:</strong> ${result.data.disabilityRate}%</p>
                        <p><strong>Kaza Tarihi:</strong> ${new Date(result.data.accidentDate).toLocaleDateString('tr-TR')}</p>
                        <p><strong>Açılış Tarihi:</strong> ${new Date(result.data.openingDate).toLocaleDateString('tr-TR')}</p>
                        <p><strong>Kapanış Tarihi:</strong> ${result.data.closingDate ? new Date(result.data.closingDate).toLocaleDateString('tr-TR') : '-'}</p>
                    </div>
                    <div class="case-tabs">
                        <button class="tab-button active" data-tab="shares">Paylar</button>
                        <button class="tab-button" data-tab="documents">Evraklar</button>
                        <button class="tab-button" data-tab="expenses">Masraflar</button>
                        <button class="tab-button" data-tab="debtors">Davalılar</button>
                    </div>
                    <div class="tab-content active" id="sharesTab">
                        <div class="tab-header">
                            <h3>Paylar</h3>
                            <button class="btn-add" onclick="showAddShareForm(${caseId})">Pay Ekle</button>
                        </div>
                        <div class="shares-list">
                            ${result.data.caseFileShares.map(share => displayShareItem(share).outerHTML).join('')}
                        </div>
                    </div>
                    <div class="tab-content" id="documentsTab">
                        <div class="tab-header">
                            <h3>Evraklar</h3>
                            <button class="btn-add" onclick="showAddDocumentForm(${caseId})">Evrak Ekle</button>
                        </div>
                        <div class="documents-list"></div>
                    </div>
                    <div class="tab-content" id="expensesTab">
                        <div class="tab-header">
                            <h3>Masraflar</h3>
                            <button class="btn-add" onclick="showAddExpenseForm(${caseId})">Masraf Ekle</button>
                        </div>
                        <div class="expenses-list"></div>
                    </div>
                    <div class="tab-content" id="debtorsTab">
                        <div class="tab-header">
                            <h3>Davalılar</h3>
                            <button class="btn-add" onclick="showAddDebtorForm(${caseId})">Davalı Ekle</button>
                        </div>
                        <div class="debtors-list">
                            ${result.data.caseFileDefendantListDtos.map(defendant => displayDebtorItem(defendant).outerHTML).join('')}
                        </div>
                    </div>
                `;

                // Tab butonlarına tıklama olayı ekle
                const tabButtons = caseDetails.querySelectorAll('.tab-button');
                tabButtons.forEach(button => {
                    button.addEventListener('click', () => {
                        const tabName = button.getAttribute('data-tab');
                        showTab(tabName);
                        
                        // Tab içeriğini yükle
                        loadTabContent(tabName, caseId);
                    });
                });
                
                // İlk tab içeriğini yükle
                loadTabContent('shares', caseId);
            }
        }
    } catch (error) {
        console.error('Dosya detayları yüklenirken hata:', error);
    }
}

// Tab içeriğini göster
function showTab(tabName) {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        if (button.getAttribute('data-tab') === tabName) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    tabContents.forEach(content => {
        if (content.id === `${tabName}Tab`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// Tab içeriğini yükle
async function loadTabContent(tabName, caseId) {
    const tabContent = document.querySelector('.tab-content.active');
    if (!tabContent) return;
    
    tabContent.innerHTML = '<div class="loading">Yükleniyor...</div>';
    
    try {
        let data = [];
        switch (tabName) {
            case 'shares':
                console.log('Pay sekmesi yükleniyor...');
                data = await fetchShares(caseId);
                console.log('Yüklenen paylar:', data);
                
                if (!Array.isArray(data)) {
                    throw new Error('Paylar için geçersiz veri formatı');
                }
                
                tabContent.innerHTML = `
                    <div class="tab-header">
                        <h3>Paylar</h3>
                        <button class="btn-add" onclick="showAddShareForm(${caseId})">Pay Ekle</button>
                    </div>
                    <div class="shares-list">
                        ${data.length > 0 
                            ? data.map(share => displayShareItem(share).outerHTML).join('')
                            : '<p>Henüz pay eklenmemiş.</p>'
                        }
                    </div>
                `;
                break;
                
            case 'documents':
                data = await fetchDocuments(caseId);
                tabContent.innerHTML = `
                    <button class="add-button" onclick="showDocumentForm(${caseId})">Evrak Ekle</button>
                    <div class="documents-list">
                        ${data.map(doc => displayDocumentItem(doc).outerHTML).join('')}
                    </div>
                `;
                break;
                
            case 'expenses':
                data = await fetchExpenses(caseId);
                tabContent.innerHTML = `
                    <button class="add-button" onclick="showExpenseForm(${caseId})">Masraf Ekle</button>
                    <div class="expenses-list">
                        ${data.map(expense => displayExpenseItem(expense).outerHTML).join('')}
                    </div>
                `;
                break;
                
            case 'debtors':
                data = await fetchDebtors(caseId);
                tabContent.innerHTML = `
                    <button class="add-button" onclick="showDebtorForm(${caseId})">Davalı Ekle</button>
                    <div class="debtors-list">
                        ${data.map(debtor => displayDebtorItem(debtor).outerHTML).join('')}
                    </div>
                `;
                break;
        }
    } catch (error) {
        console.error('Tab içeriği yüklenirken hata:', error);
        tabContent.innerHTML = `
            <div class="error-message">
                <p>Veriler yüklenirken bir hata oluştu.</p>
                <p>Hata detayı: ${error.message}</p>
                <button onclick="loadTabContent('${tabName}', ${caseId})" class="btn-retry">Tekrar Dene</button>
            </div>
        `;
    }
}

async function fetchShares(caseId) {
    try {
        console.log('Paylar yükleniyor, Dosya ID:', caseId);
        const url = `${API_URL}/CaseFileShareList?casFileID=${caseId}`;
        console.log('İstek URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': '*/*'
            }
        });
        
        console.log('API Yanıtı:', response);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API Veri:', result);
        
        return result.data || [];
    } catch (error) {
        console.error('Paylar yüklenirken hata:', error);
        throw error;
    }
}

async function fetchDocuments(caseId) {
    try {
        console.log('Evraklar yükleniyor, Dosya ID:', caseId);
        const url = `${API_URL}/CaseFileDocumentList?caseFileID=${caseId}`;
        console.log('İstek URL:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': '*/*'
            }
        });
        
        console.log('API Yanıtı:', response);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('API Veri:', result);
        
        if (!result.data || !result.data.documentDto) {
            throw new Error('API yanıtında beklenen veri yapısı bulunamadı');
        }
        
        return result.data.documentDto;
    } catch (error) {
        console.error('Evraklar yüklenirken hata:', error);
        throw error;
    }
}

async function fetchExpenses(caseId) {
    const response = await fetch(`${API_URL}/api/Expense/case/${caseId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'accept': '*/*'
        }
    });
    if (!response.ok) throw new Error('Failed to fetch expenses');
    return await response.json();
}

async function fetchDebtors(caseId) {
    const response = await fetch(`${API_URL}/api/Debtor/case/${caseId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'accept': '*/*'
        }
    });
    if (!response.ok) throw new Error('Failed to fetch debtors');
    return await response.json();
}

// Dosya silme işlemi
async function deleteCase(caseId) {
    if (confirm('Bu dosyayı silmek istediğinize emin misiniz?')) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/CaseFile/${caseId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('Dosya başarıyla silindi.');
                loadCaseFiles(); // Dosya listesini yenile
            } else {
                alert('Dosya silinirken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Dosya silinirken hata:', error);
            alert('Dosya silinirken bir hata oluştu.');
        }
    }
}

// Kullanıcı silme işlemi
async function deleteUser(userId) {
    if (confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/Users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                alert('Kullanıcı başarıyla silindi.');
                loadUsers(); // Kullanıcı listesini yenile
            } else {
                alert('Kullanıcı silinirken bir hata oluştu.');
            }
        } catch (error) {
            console.error('Kullanıcı silinirken hata:', error);
            alert('Kullanıcı silinirken bir hata oluştu.');
        }
    }
}

// Dava türlerini yükle
async function loadCaseTypes() {
    try {
        console.log('Dava türleri yükleniyor...');
        const response = await fetch(`${API_URL}/caseTypes`, {
            method: 'GET',
            headers: {
                'accept': '*/*'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('API Yanıtı:', response);
        const result = await response.json();
        console.log('Dava Türleri:', result);
        
        if (result && result.data) {
            const caseTypeSelect = document.getElementById('caseTypeID');
            if (!caseTypeSelect) {
                console.error('caseTypeID elementi bulunamadı');
                return;
            }

            caseTypeSelect.innerHTML = '<option value="">Dava Türü Seçiniz</option>';
            
            result.data.forEach(caseType => {
                const option = document.createElement('option');
                option.value = caseType.id;
                option.textContent = caseType.name;
                caseTypeSelect.appendChild(option);
            });

            // Dava türü seçildiğinde başvuru türlerini yükle
            caseTypeSelect.addEventListener('change', (e) => {
                if (e.target.value) {
                    loadApplicationTypes(e.target.value);
                }
            });
        } else {
            console.error('Dava türü verisi bulunamadı:', result);
        }
    } catch (error) {
        console.error('Dava türleri yüklenirken hata:', error);
    }
}

// Başvuru türlerini yükle
async function loadApplicationTypes(caseTypeId) {
    try {
        if (!caseTypeId) {
            console.error('Dava türü ID boş olamaz');
            return;
        }

        console.log('Başvuru türleri yükleniyor...');
        const response = await fetch(`${API_URL}/applicationTypes`, {
            method: 'GET',
            headers: {
                'accept': '*/*'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('API Yanıtı:', response);
        const result = await response.json();
        console.log('Başvuru Türleri:', result);
        
        if (result && result.data) {
            const applicationTypeSelect = document.getElementById('applicationTypeID');
            if (!applicationTypeSelect) {
                console.error('applicationTypeID elementi bulunamadı');
                return;
            }

            applicationTypeSelect.innerHTML = '<option value="">Başvuru Türü Seçiniz</option>';
            
            // Seçilen dava türüne ait başvuru türlerini filtrele
            const filteredApplicationTypes = result.data.filter(appType => appType.caseTypeID === parseInt(caseTypeId));
            
            filteredApplicationTypes.forEach(appType => {
                const option = document.createElement('option');
                option.value = appType.id;
                option.textContent = appType.name;
                applicationTypeSelect.appendChild(option);
            });
        } else {
            console.error('Başvuru türü verisi bulunamadı:', result);
        }
    } catch (error) {
        console.error('Başvuru türleri yüklenirken hata:', error);
    }
}

// Form gösterme fonksiyonları
function showAddShareForm(caseId) {
    const addShareForm = document.getElementById('addShareForm');
    if (addShareForm) {
        document.getElementById('shareCaseFileID').value = caseId;
        addShareForm.style.display = 'block';
        
        // Kullanıcı listesini API'den çek
        fetch(`${API_URL}/api/Users`, {
            headers: {
                'accept': '*/*'
            }
        })
        .then(response => response.json())
        .then(users => {
            const userSelect = document.getElementById('shareUserID');
            userSelect.innerHTML = '<option value="">Kullanıcı Seçiniz</option>';
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.name} ${user.surname}`;
                userSelect.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Kullanıcı listesi yüklenirken hata:', error);
        });
    }
}

function showAddDocumentForm(caseId) {
    const addDocumentForm = document.getElementById('addDocumentForm');
    if (addDocumentForm) {
        document.getElementById('documentCaseFileID').value = caseId;
        addDocumentForm.style.display = 'block';
        // Evrak türlerini yükle
        loadDocumentTypes();
    }
}

function showAddExpenseForm(caseId) {
    const addExpenseForm = document.getElementById('addExpenseForm');
    if (addExpenseForm) {
        document.getElementById('expenseCaseFileID').value = caseId;
        addExpenseForm.style.display = 'block';
        // Kullanıcı listesini yükle
        loadUsers().then(users => {
            const userSelect = document.getElementById('expenseUserID');
            userSelect.innerHTML = '<option value="">Kullanıcı Seçiniz</option>';
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.name} ${user.surname}`;
                userSelect.appendChild(option);
            });
        });
    }
}

function showAddDebtorForm(caseId) {
    const addDebtorForm = document.getElementById('addDebtorForm');
    if (addDebtorForm) {
        document.getElementById('debtorCaseFileID').value = caseId;
        addDebtorForm.style.display = 'block';
    }
}

async function handleShareSubmit(e) {
    e.preventDefault();
    
    const formData = {
        caseFileID: parseInt(document.getElementById('shareCaseFileID').value),
        userID: parseInt(document.getElementById('shareUserID').value),
        shareRate: parseFloat(document.getElementById('shareRate').value),
        filePermission: document.getElementById('filePermission').value === 'true'
    };

    try {
        const response = await fetch(`${API_URL}/api/Share`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'accept': '*/*'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        if (result.success) {
            alert('Pay başarıyla eklendi.');
            document.getElementById('addShareForm').style.display = 'none';
            document.getElementById('shareForm').reset();
            // Paylar listesini güncelle
            loadTabContent('shares', formData.caseFileID);
        } else {
            alert('Pay eklenirken bir hata oluştu: ' + result.message);
        }
    } catch (error) {
        console.error('Pay eklenirken hata:', error);
        alert('Pay eklenirken bir hata oluştu.');
    }
}

function displayCaseDetails(caseData) {
    const caseDetailsSection = document.getElementById('caseDetailsSection');
    const caseDetailsHeader = document.createElement('div');
    caseDetailsHeader.className = 'case-details-header';
    
    caseDetailsHeader.innerHTML = `
        <p><strong>Dosya No</strong><span>${caseData.caseNumber || '-'}</span></p>
        <p><strong>Dosya Türü</strong><span>${caseData.caseType || '-'}</span></p>
        <p><strong>Başvuru Türü</strong><span>${caseData.applicationType || '-'}</span></p>
        <p><strong>Durum</strong><span>${caseData.status || '-'}</span></p>
        <p><strong>Şehir</strong><span>${caseData.city || '-'}</span></p>
        <p><strong>İlçe</strong><span>${caseData.district || '-'}</span></p>
        <p><strong>Oluşturulma Tarihi</strong><span>${formatDate(caseData.createdDate) || '-'}</span></p>
    `;
    
    caseDetailsSection.innerHTML = '';
    caseDetailsSection.appendChild(caseDetailsHeader);
    
    // Tab buttons
    const tabButtons = document.createElement('div');
    tabButtons.className = 'tab-buttons';
    tabButtons.innerHTML = `
        <button class="tab-button active" data-tab="shares">Paylar</button>
        <button class="tab-button" data-tab="documents">Evraklar</button>
        <button class="tab-button" data-tab="expenses">Masraflar</button>
        <button class="tab-button" data-tab="debtors">Davalılar</button>
    `;
    caseDetailsSection.appendChild(tabButtons);
    
    // Tab content container
    const tabContent = document.createElement('div');
    tabContent.className = 'tab-content';
    caseDetailsSection.appendChild(tabContent);
    
    // Load initial tab content
    loadTabContent('shares', caseData.id);
    
    // Tab click handlers
    tabButtons.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            loadTabContent(button.dataset.tab, caseData.id);
        });
    });
}

function displayCaseCard(caseData) {
    const card = document.createElement('div');
    card.className = 'case-card';
    card.innerHTML = `
        <div class="case-info">
            <h3>${caseData.caseNumber}</h3>
            <p><strong>Dosya Türü</strong><span>${caseData.caseType || '-'}</span></p>
            <p><strong>Başvuru Türü</strong><span>${caseData.applicationType || '-'}</span></p>
            <p><strong>Durum</strong><span>${caseData.status || '-'}</span></p>
            <p><strong>Şehir</strong><span>${caseData.city || '-'}</span></p>
            <p><strong>İlçe</strong><span>${caseData.district || '-'}</span></p>
            <p><strong>Tarih</strong><span>${formatDate(caseData.createdDate) || '-'}</span></p>
        </div>
        <div class="case-actions">
            <button class="btn-edit" onclick="editCase(${caseData.id})">Düzenle</button>
            <button class="btn-delete" onclick="deleteCase(${caseData.id})">Sil</button>
        </div>
    `;
    return card;
}

function displayShareItem(share) {
    const item = document.createElement('div');
    item.className = 'share-item';
    item.innerHTML = `
        <div class="item-content">
            <div class="item-header">
                <h4>${share.shareUserName}</h4>
                <div class="item-actions">
                    <button onclick="editShare(${share.id})" class="edit-btn">Düzenle</button>
                    <button onclick="deleteShare(${share.id})" class="delete-btn">Sil</button>
                </div>
            </div>
            <div class="item-details">
                <p><strong>Pay Oranı:</strong> %${share.shareRate}</p>
                <p><strong>Dosya İzni:</strong> ${share.filePermission}</p>
            </div>
        </div>
    `;
    return item;
}

function displayDocumentItem(document) {
    const item = document.createElement('div');
    item.className = 'document-item';
    item.innerHTML = `
        <div class="item-content">
            <div class="item-header">
                <h4>${document.documentTypeName}</h4>
                <div class="item-actions">
                    <button onclick="downloadDocument(${document.id})" class="download-btn">İndir</button>
                    <button onclick="deleteDocument(${document.id})" class="delete-btn">Sil</button>
                </div>
            </div>
            <div class="item-details">
                <p><strong>Yüklenme Tarihi:</strong> ${formatDate(document.uploadDate)}</p>
                <p><strong>Dosya Adı:</strong> ${document.documentUrl || '-'}</p>
            </div>
        </div>
    `;
    return item;
}

function displayExpenseItem(expense) {
    const item = document.createElement('div');
    item.className = 'expense-item';
    item.innerHTML = `
        <div class="item-content">
            <div class="item-header">
                <h4>${expense.description}</h4>
                <div class="item-actions">
                    <button onclick="editExpense(${expense.id})" class="edit-btn">Düzenle</button>
                    <button onclick="deleteExpense(${expense.id})" class="delete-btn">Sil</button>
                </div>
            </div>
            <div class="item-details">
                <p><strong>Tutar:</strong> ${formatCurrency(expense.amount)}</p>
                <p><strong>Kullanıcı:</strong> ${expense.userName}</p>
                <p><strong>Ödeme Tarihi:</strong> ${formatDate(expense.paymentDate)}</p>
                <p><strong>Son Ödeme Tarihi:</strong> ${formatDate(expense.dueDate)}</p>
            </div>
        </div>
    `;
    return item;
}

function displayDebtorItem(debtor) {
    const item = document.createElement('div');
    item.className = 'debtor-item';
    item.innerHTML = `
        <div class="item-content">
            <div class="item-header">
                <h4>${debtor.name} ${debtor.surname}</h4>
                <div class="item-actions">
                    <button onclick="editDebtor(${debtor.id})" class="edit-btn">Düzenle</button>
                    <button onclick="deleteDebtor(${debtor.id})" class="delete-btn">Sil</button>
                </div>
            </div>
            <div class="item-details">
                <p><strong>TC Kimlik No:</strong> ${debtor.identityNumber}</p>
                <p><strong>Telefon:</strong> ${debtor.phoneNumber || '-'}</p>
            </div>
        </div>
    `;
    return item;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR');
}

function formatCurrency(amount) {
    if (!amount) return '-';
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    }).format(amount);
}

// Evrak türlerini yükle
async function loadDocumentTypes() {
    try {
        const response = await fetch(`${API_URL}/documentTypeList`, {
            headers: {
                'accept': '*/*'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success && result.data) {
            const select = document.getElementById('documentTypeID');
            select.innerHTML = '<option value="">Evrak Türü Seçiniz</option>';
            
            result.data.forEach(type => {
                const option = document.createElement('option');
                option.value = type.id;
                option.textContent = type.name;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Evrak türleri yüklenirken hata:', error);
        alert('Evrak türleri yüklenirken bir hata oluştu.');
    }
}

// Yeni evrak türü ekle
async function addDocumentType() {
    const name = document.getElementById('newDocumentTypeName').value;
    const type = document.getElementById('newDocumentTypeType').value;
    
    if (!name || !type) {
        alert('Lütfen tüm alanları doldurun.');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/documnetTypeAdd`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'accept': '*/*'
            },
            body: JSON.stringify({
                name: name,
                type: type
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
            alert('Evrak türü başarıyla eklendi.');
            // Form'u temizle
            document.getElementById('newDocumentTypeName').value = '';
            document.getElementById('newDocumentTypeType').value = '';
            // Modal'ı kapat
            document.getElementById('addDocumentTypeModal').style.display = 'none';
            // Evrak türlerini yeniden yükle
            loadDocumentTypes();
        } else {
            alert('Evrak türü eklenirken bir hata oluştu: ' + result.message);
        }
    } catch (error) {
        console.error('Evrak türü eklenirken hata:', error);
        alert('Evrak türü eklenirken bir hata oluştu.');
    }
}

// Evrak yükleme
async function handleDocumentSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('CaseFileID', document.getElementById('documentCaseFileID').value);
    formData.append('DocumentTypeID', document.getElementById('documentTypeID').value);
    formData.append('DocumentUrl', document.getElementById('documentFile').files[0]);
    
    try {
        const response = await fetch(`${API_URL}/api/CaseFileDocument/CaseFileDocumentAdd`, {
            method: 'POST',
            headers: {
                'accept': '*/*'
            },
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        if (result.success) {
            alert('Evrak başarıyla yüklendi.');
            document.getElementById('addDocumentForm').style.display = 'none';
            document.getElementById('documentForm').reset();
            // Evrakları yeniden yükle
            loadTabContent('documents', document.getElementById('documentCaseFileID').value);
        } else {
            alert('Evrak yüklenirken bir hata oluştu: ' + result.message);
        }
    } catch (error) {
        console.error('Evrak yüklenirken hata:', error);
        alert('Evrak yüklenirken bir hata oluştu.');
    }
}

// Yeni evrak türü ekleme modalını göster
function showAddDocumentTypeModal() {
    const modal = document.getElementById('addDocumentTypeModal');
    if (modal) {
        modal.style.display = 'block';
    }
}