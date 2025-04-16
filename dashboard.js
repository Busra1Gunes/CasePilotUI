document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://casepilot.somee.com';
    const token = localStorage.getItem('token');
    const userName = localStorage.getItem('userName');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const usersList = document.querySelector('.users-list');
    const casesList = document.querySelector('.cases-list');
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('.section');
    const logoutButton = document.getElementById('logoutButton');
    const toggleButton = document.getElementById('toggleSidebar');
    const sidebar = document.querySelector('.sidebar');
    const addCaseButton = document.getElementById('addCaseButton');
    const addCaseForm = document.getElementById('addCaseForm');
    const caseForm = document.getElementById('caseForm');
    const cancelAddCase = document.getElementById('cancelAddCase');
    const caseTypeSelect = document.getElementById('caseTypeID');
    const applicationTypeSelect = document.getElementById('applicationTypeID');
    const addUserButton = document.getElementById('addUserButton');
    const addUserForm = document.getElementById('addUserForm');
    const userForm = document.getElementById('userForm');
    const cancelAddUser = document.getElementById('cancelAddUser');
    const citySelect = document.getElementById('cityID');
    const districtSelect = document.getElementById('districtID');
    const addShareForm = document.getElementById('addShareForm');
    const shareForm = document.getElementById('shareForm');
    const cancelAddShare = document.getElementById('cancelAddShare');
    const caseFileSelect = document.getElementById('caseFileID');
    const userSelect = document.getElementById('userID');
    const addDocumentForm = document.getElementById('addDocumentForm');
    const documentForm = document.getElementById('documentForm');
    const cancelAddDocument = document.getElementById('cancelAddDocument');
    const documentCaseFileSelect = document.getElementById('documentCaseFileID');
    const documentTypeSelect = document.getElementById('documentTypeID');
    const addExpenseForm = document.getElementById('addExpenseForm');
    const expenseForm = document.getElementById('expenseForm');
    const cancelAddExpense = document.getElementById('cancelAddExpense');
    const expenseCaseFileSelect = document.getElementById('expenseCaseFileID');
    const expenseUserSelect = document.getElementById('expenseUserID');
    const caseDetails = document.getElementById('caseDetails');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');
    let currentCaseID = null;

    // Overlay oluştur
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);

    // Kullanıcı adını göster
    if (userNameDisplay && userName) {
        userNameDisplay.textContent = `Hoş geldiniz, ${userName}`;
    }

    // Dosya tiplerini yükle
    async function loadCaseTypes() {
        try {
            const response = await fetch(`${API_URL}/caseTypes`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });

            if (!response.ok) {
                throw new Error('Dosya tipleri yüklenemedi');
            }

            const result = await response.json();
            
            if (!result.success || !result.data) {
                throw new Error('Dosya tipleri yüklenemedi');
            }

            // Select elementini temizle
            caseTypeSelect.innerHTML = '<option value="">Seçiniz</option>';
            
            // Dosya tiplerini ekle
            result.data.forEach(type => {
                const option = document.createElement('option');
                option.value = type.id;
                option.textContent = type.name;
                caseTypeSelect.appendChild(option);
            });

            // İlk dosya tipini seç ve başvuru tiplerini yükle
            if (result.data.length > 0) {
                caseTypeSelect.value = result.data[0].id;
                loadApplicationTypes(result.data[0].id);
            }
        } catch (error) {
            console.error('Dosya tipi yükleme hatası:', error);
            alert('Dosya tipleri yüklenirken bir hata oluştu');
        }
    }

    // Başvuru tiplerini yükle
    async function loadApplicationTypes(caseTypeID) {
        try {
            const response = await fetch(`${API_URL}/applicationTypes`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });

            if (!response.ok) {
                throw new Error('Başvuru tipleri yüklenemedi');
            }

            const result = await response.json();
            
            if (!result.success || !result.data) {
                throw new Error('Başvuru tipleri yüklenemedi');
            }

            // Select elementini temizle
            applicationTypeSelect.innerHTML = '<option value="">Seçiniz</option>';
            
            // Sadece seçili dosya tipine ait başvuru tiplerini ekle
            const filteredTypes = result.data.filter(type => type.caseTypeID === caseTypeID);
            filteredTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type.id;
                option.textContent = type.name;
                applicationTypeSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Başvuru tipi yükleme hatası:', error);
            alert('Başvuru tipleri yüklenirken bir hata oluştu');
        }
    }

    // Dosya tipi değiştiğinde başvuru tiplerini güncelle
    caseTypeSelect.addEventListener('change', (e) => {
        loadApplicationTypes(parseInt(e.target.value));
    });

    // Sidebar toggle
    toggleButton.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        toggleButton.textContent = sidebar.classList.contains('collapsed') ? '→' : '←';
    });

    // Çıkış işlemi
    logoutButton.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = 'index.html';
    });

    // Dosya ekleme formu göster/gizle
    addCaseButton.addEventListener('click', () => {
        addCaseForm.style.display = 'block';
        caseForm.reset();
        loadCaseTypes(); // Dosya tiplerini yükle
    });

    cancelAddCase.addEventListener('click', () => {
        addCaseForm.style.display = 'none';
    });

    // Dosya ekleme formu gönder
    caseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
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

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Dosya eklenemedi');
            }

            // Formu kapat ve listeyi yenile
            addCaseForm.style.display = 'none';
            loadCases();
        } catch (error) {
            console.error('Dosya ekleme hatası:', error);
            alert('Dosya eklenirken bir hata oluştu: ' + error.message);
        }
    });

    // Navigasyon
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.getAttribute('data-section');
            
            // Aktif section'ı güncelle
            sections.forEach(section => {
                section.classList.remove('active');
            });
            
            const targetSection = document.getElementById(`${sectionId}Section`);
            if (targetSection) {
                targetSection.classList.add('active');
                
                // Mobil görünümde sidebar'ı kapat
                if (window.innerWidth <= 768) {
                    sidebar.classList.add('collapsed');
                    toggleButton.textContent = '→';
                }

                // İlgili verileri yükle
                if (sectionId === 'users') {
                    loadUsers();
                } else if (sectionId === 'cases') {
                    loadCases();
                }
            }
        });
    });

    // Kullanıcıları yükle
    async function loadUsers() {
        try {
            usersList.innerHTML = '<div class="loading">Yükleniyor...</div>';
            
            const response = await fetch(`${API_URL}/api/Users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });

            if (!response.ok) {
                throw new Error('Kullanıcılar yüklenemedi');
            }

            const users = await response.json();
            
            if (users.length === 0) {
                usersList.innerHTML = '<div class="empty">Henüz kullanıcı bulunmuyor.</div>';
                return;
            }

            // Kullanıcı listesini göster
            usersList.innerHTML = users.map(user => `
                <div class="user-item">
                    <h3>${escapeHtml(user.name)} ${escapeHtml(user.surname)}</h3>
                    <p>Kullanıcı Adı: ${escapeHtml(user.userName)}</p>
                    <p>Şehir: ${escapeHtml(user.city)}</p>
                    <p>İlçe: ${escapeHtml(user.district)}</p>
                    ${user.mail ? `<p>E-posta: ${escapeHtml(user.mail)}</p>` : ''}
                </div>
            `).join('');

            // Kullanıcı seçim kutusunu güncelle
            userSelect.innerHTML = '<option value="">Seçiniz</option>';
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = `${user.name} ${user.surname} - ${user.userName}`;
                userSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Kullanıcı yükleme hatası:', error);
            usersList.innerHTML = '<div class="error">Kullanıcılar yüklenirken bir hata oluştu.</div>';
        }
    }

    // Dosyaları yükle
    async function loadCases() {
        try {
            casesList.innerHTML = '<div class="loading">Yükleniyor...</div>';
            
            const response = await fetch(`${API_URL}/CaseFile/list`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });

            if (!response.ok) {
                throw new Error('Dosyalar yüklenemedi');
            }

            const result = await response.json();
            
            if (!result.success || !result.data || result.data.length === 0) {
                casesList.innerHTML = '<div class="empty">Henüz dosya bulunmuyor.</div>';
                return;
            }

            // Dosya listesini göster
            casesList.innerHTML = result.data.map(caseFile => `
                <div class="case-item" data-case-id="${caseFile.id}">
                    <h3>${escapeHtml(caseFile.name)} ${escapeHtml(caseFile.surname)}</h3>
                    <p>Dosya Tipi: ${escapeHtml(caseFile.caseType)}</p>
                    <p>Başvuru Tipi: ${escapeHtml(caseFile.applicationType)}</p>
                    <p>Konum: ${escapeHtml(caseFile.city)} / ${escapeHtml(caseFile.district)}</p>
                    <p>TC: ${escapeHtml(caseFile.identityNumber)}</p>
                    <p>Telefon: ${escapeHtml(caseFile.phoneNumber)}</p>
                    <p>Doğum Tarihi: ${formatDate(caseFile.dateOfBirth)}</p>
                    <p>Hak Ediş Oranı: %${caseFile.entitlementRate}</p>
                    <p>Engel Oranı: %${caseFile.disabilityRate}</p>
                    <p>Kaza Tarihi: ${formatDate(caseFile.accidentDate)}</p>
                    <p>Açılış Tarihi: ${formatDate(caseFile.openingDate)}</p>
                    ${caseFile.closingDate ? `<p>Kapanış Tarihi: ${formatDate(caseFile.closingDate)}</p>` : ''}
                    <p>Durum: ${getCaseStatusText(caseFile.caseStatus)}</p>
                </div>
            `).join('');

            // Dosya detaylarını göster
            document.querySelectorAll('.case-item').forEach(item => {
                item.addEventListener('click', () => {
                    const caseID = item.getAttribute('data-case-id');
                    showCaseDetails(caseID);
                });
            });

            // Sekme değiştirme
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const tabID = button.getAttribute('data-tab');
                    showTab(tabID);
                });
            });

            // Dosya seçim kutularını güncelle
            caseFileSelect.innerHTML = '<option value="">Seçiniz</option>';
            documentCaseFileSelect.innerHTML = '<option value="">Seçiniz</option>';
            result.data.forEach(caseFile => {
                const option = document.createElement('option');
                option.value = caseFile.id;
                option.textContent = `${caseFile.name} ${caseFile.surname} - ${caseFile.caseType}`;
                caseFileSelect.appendChild(option);
                documentCaseFileSelect.appendChild(option.cloneNode(true));
            });
        } catch (error) {
            console.error('Dosya yükleme hatası:', error);
            casesList.innerHTML = '<div class="error">Dosyalar yüklenirken bir hata oluştu.</div>';
        }
    }

    // Tarih formatla
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR');
    }

    // Dosya durumu metni
    function getCaseStatusText(status) {
        const statusMap = {
            0: 'Açık',
            1: 'Kapalı',
            2: 'Beklemede'
        };
        return statusMap[status] || 'Bilinmiyor';
    }

    // HTML escape fonksiyonu
    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Şehirleri yükle
    async function loadCities() {
        try {
            const response = await fetch(`${API_URL}/api/Cities`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });

            if (!response.ok) {
                throw new Error('Şehirler yüklenemedi');
            }

            const cities = await response.json();
            
            citySelect.innerHTML = '<option value="">Seçiniz</option>';
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city.id;
                option.textContent = city.name;
                citySelect.appendChild(option);
            });
        } catch (error) {
            console.error('Şehir yükleme hatası:', error);
            alert('Şehirler yüklenirken bir hata oluştu');
        }
    }

    // İlçeleri yükle
    async function loadDistricts(cityID) {
        try {
            const response = await fetch(`${API_URL}/api/Districts/${cityID}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });

            if (!response.ok) {
                throw new Error('İlçeler yüklenemedi');
            }

            const districts = await response.json();
            
            districtSelect.innerHTML = '<option value="">Seçiniz</option>';
            districts.forEach(district => {
                const option = document.createElement('option');
                option.value = district.id;
                option.textContent = district.name;
                districtSelect.appendChild(option);
            });
        } catch (error) {
            console.error('İlçe yükleme hatası:', error);
            alert('İlçeler yüklenirken bir hata oluştu');
        }
    }

    // Şehir değiştiğinde ilçeleri güncelle
    citySelect.addEventListener('change', (e) => {
        const cityID = parseInt(e.target.value);
        if (cityID) {
            loadDistricts(cityID);
        } else {
            districtSelect.innerHTML = '<option value="">Seçiniz</option>';
        }
    });

    // Yeni kullanıcı ekleme formunu göster
    addUserButton.addEventListener('click', () => {
        addUserForm.style.display = 'block';
        userForm.reset();
        loadCities();
    });

    // Kullanıcı ekleme formunu kapat
    cancelAddUser.addEventListener('click', () => {
        addUserForm.style.display = 'none';
    });

    // Kullanıcı ekleme formunu gönder
    userForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            cityID: parseInt(citySelect.value),
            districtID: parseInt(districtSelect.value),
            name: document.getElementById('name').value,
            surname: document.getElementById('surname').value,
            mail: document.getElementById('mail').value,
            userName: document.getElementById('userName').value,
            password: document.getElementById('password').value
        };

        try {
            const response = await fetch(`${API_URL}/api/Users`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': '*/*'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Kullanıcı eklenemedi');
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Kullanıcı eklenemedi');
            }

            // Formu kapat ve listeyi yenile
            addUserForm.style.display = 'none';
            loadUsers();
            alert('Kullanıcı başarıyla eklendi');
        } catch (error) {
            console.error('Kullanıcı ekleme hatası:', error);
            alert('Kullanıcı eklenirken bir hata oluştu: ' + error.message);
        }
    });

    // Paylaşım formunu göster
    function showShareForm(caseID) {
        addShareForm.style.display = 'block';
        shareForm.reset();
        if (caseID) {
            caseFileSelect.value = caseID;
        }
    }

    // Paylaşım formunu kapat
    cancelAddShare.addEventListener('click', () => {
        addShareForm.style.display = 'none';
    });

    // Paylaşım formunu gönder
    shareForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            caseFileID: parseInt(caseFileSelect.value),
            userID: parseInt(userSelect.value),
            shareRate: parseInt(document.getElementById('shareRate').value),
            filePermission: document.getElementById('filePermission').value
        };

        try {
            const response = await fetch(`${API_URL}/CaseFileShareAdd`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': '*/*'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Paylaşım eklenemedi');
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Paylaşım eklenemedi');
            }

            // Formu kapat ve payları yenile
            addShareForm.style.display = 'none';
            if (currentCaseID) {
                loadShares(currentCaseID);
            } else {
                loadAllShares();
            }
            alert('Paylaşım başarıyla eklendi');
        } catch (error) {
            console.error('Paylaşım ekleme hatası:', error);
            alert('Paylaşım eklenirken bir hata oluştu: ' + error.message);
        }
    });

    // Evrak tiplerini yükle
    async function loadDocumentTypes() {
        try {
            const response = await fetch(`${API_URL}/api/DocumentTypes`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });

            if (!response.ok) {
                throw new Error('Evrak tipleri yüklenemedi');
            }

            const documentTypes = await response.json();
            
            documentTypeSelect.innerHTML = '<option value="">Seçiniz</option>';
            documentTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type.id;
                option.textContent = type.name;
                documentTypeSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Evrak tipi yükleme hatası:', error);
            alert('Evrak tipleri yüklenirken bir hata oluştu');
        }
    }

    // Evrak formunu göster
    function showDocumentForm(caseID) {
        addDocumentForm.style.display = 'block';
        documentForm.reset();
        if (caseID) {
            documentCaseFileSelect.value = caseID;
        }
        loadDocumentTypes();
    }

    // Evrak formunu kapat
    cancelAddDocument.addEventListener('click', () => {
        addDocumentForm.style.display = 'none';
    });

    // Evrak formunu gönder
    documentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('CaseFileID', documentCaseFileSelect.value);
        formData.append('DocumentTypeID', documentTypeSelect.value);
        formData.append('DocumentUrl', document.getElementById('documentUrl').files[0]);

        try {
            const response = await fetch(`${API_URL}/api/CaseFileDocument/CaseFileDocumentAdd`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Evrak eklenemedi');
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Evrak eklenemedi');
            }

            // Formu kapat
            addDocumentForm.style.display = 'none';
            alert('Evrak başarıyla eklendi');
        } catch (error) {
            console.error('Evrak ekleme hatası:', error);
            alert('Evrak eklenirken bir hata oluştu: ' + error.message);
        }
    });

    // Masraf formunu göster
    function showExpenseForm(caseID) {
        addExpenseForm.style.display = 'block';
        expenseForm.reset();
        if (caseID) {
            expenseCaseFileSelect.value = caseID;
        }
    }

    // Masraf formunu kapat
    cancelAddExpense.addEventListener('click', () => {
        addExpenseForm.style.display = 'none';
    });

    // Masraf formunu gönder
    expenseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            debtorID: 1, // Her zaman 1 olacak
            creditID: parseInt(expenseUserSelect.value),
            caseFileID: parseInt(expenseCaseFileSelect.value),
            amount: parseFloat(document.getElementById('amount').value),
            transactionStatus: 1,
            type: 4, // Dosya masrafı
            description: document.getElementById('description').value,
            paymentDate: document.getElementById('paymentDate').value,
            paymentReceivedDate: document.getElementById('paymentDate').value,
            finalPaymentDate: document.getElementById('finalPaymentDate').value,
            paymentStatus: true
        };

        try {
            const response = await fetch(`${API_URL}/AccountTransactionAdd`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': '*/*'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Masraf eklenemedi');
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Masraf eklenemedi');
            }

            // Formu kapat
            addExpenseForm.style.display = 'none';
            alert('Masraf başarıyla eklendi');
        } catch (error) {
            console.error('Masraf ekleme hatası:', error);
            alert('Masraf eklenirken bir hata oluştu: ' + error.message);
        }
    });

    // Sekme göster
    function showTab(tabID) {
        tabButtons.forEach(button => {
            button.classList.remove('active');
            if (button.getAttribute('data-tab') === tabID) {
                button.classList.add('active');
            }
        });

        tabPanes.forEach(pane => {
            pane.classList.remove('active');
            if (pane.id === tabID) {
                pane.classList.add('active');
            }
        });

        // İlgili verileri yükle
        switch (tabID) {
            case 'caseInfo':
                loadCaseInfo(currentCaseID);
                break;
            case 'shares':
                loadShares(currentCaseID);
                break;
            case 'documents':
                loadDocuments(currentCaseID);
                break;
            case 'expenses':
                loadExpenses(currentCaseID);
                break;
            case 'debtors':
                loadDebtors(currentCaseID);
                break;
        }
    }

    // Dosya detaylarını göster
    function showCaseDetails(caseID) {
        currentCaseID = caseID;
        caseDetails.style.display = 'block';
        overlay.classList.add('active');
        showTab('caseInfo');
        loadCaseInfo(caseID);
    }

    // Dosya detaylarını kapat
    function closeCaseDetails() {
        caseDetails.style.display = 'none';
        overlay.classList.remove('active');
        currentCaseID = null;
    }

    // Kapatma butonuna event listener ekle
    document.querySelector('.close-details').addEventListener('click', closeCaseDetails);

    // Overlay'e tıklandığında kapat
    overlay.addEventListener('click', closeCaseDetails);

    // Dosya detayları içeriğine tıklandığında event'i durdur
    caseDetails.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Dosya bilgilerini yükle
    async function loadCaseInfo(caseID) {
        try {
            const response = await fetch(`${API_URL}/CaseFile/${caseID}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });

            if (!response.ok) {
                throw new Error('Dosya bilgileri yüklenemedi');
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Dosya bilgileri yüklenemedi');
            }

            const caseFile = result.data;
            document.getElementById('caseInfo').innerHTML = `
                <h3>${escapeHtml(caseFile.name)} ${escapeHtml(caseFile.surname)}</h3>
                <p>Dosya Tipi: ${escapeHtml(caseFile.caseType)}</p>
                <p>Başvuru Tipi: ${escapeHtml(caseFile.applicationType)}</p>
                <p>Konum: ${escapeHtml(caseFile.city)} / ${escapeHtml(caseFile.district)}</p>
                <p>TC: ${escapeHtml(caseFile.identityNumber)}</p>
                <p>Telefon: ${escapeHtml(caseFile.phoneNumber)}</p>
                <p>Doğum Tarihi: ${formatDate(caseFile.dateOfBirth)}</p>
                <p>Hak Ediş Oranı: %${caseFile.entitlementRate}</p>
                <p>Engel Oranı: %${caseFile.disabilityRate}</p>
                <p>Kaza Tarihi: ${formatDate(caseFile.accidentDate)}</p>
                <p>Açılış Tarihi: ${formatDate(caseFile.openingDate)}</p>
                ${caseFile.closingDate ? `<p>Kapanış Tarihi: ${formatDate(caseFile.closingDate)}</p>` : ''}
                <p>Durum: ${getCaseStatusText(caseFile.caseStatus)}</p>
            `;
        } catch (error) {
            console.error('Dosya bilgisi yükleme hatası:', error);
            alert('Dosya bilgileri yüklenirken bir hata oluştu');
        }
    }

    // Payları yükle
    async function loadShares(caseID) {
        try {
            console.log('Paylar yükleniyor, Dosya ID:', caseID);
            const url = `${API_URL}/CaseFileShareList?casFileID=${caseID}`;
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
            
            const sharesList = document.querySelector('.shares-list');
            sharesList.innerHTML = result.data.map(share => `
                <div class="list-item">
                    <h4>${escapeHtml(share.userName)}</h4>
                    <p>Pay Oranı: %${share.shareRate}</p>
                    <p>Dosya Yetkisi: ${share.filePermission}</p>
                </div>
            `).join('');
        } catch (error) {
            console.error('Paylar yüklenirken hata:', error);
            alert('Paylar yüklenirken bir hata oluştu');
        }
    }

    // Evrakları yükle
    async function loadDocuments(caseID) {
        try {
            const response = await fetch(`${API_URL}/CaseFileDocument/list/${caseID}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });

            if (!response.ok) {
                throw new Error('Evraklar yüklenemedi');
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Evraklar yüklenemedi');
            }

            const documentsList = document.querySelector('.documents-list');
            documentsList.innerHTML = result.data.map(doc => `
                <div class="list-item">
                    <h4>${escapeHtml(doc.documentType)}</h4>
                    <p>Eklenme Tarihi: ${formatDate(doc.createdDate)}</p>
                    <a href="${doc.documentUrl}" target="_blank" class="btn btn-primary">Görüntüle</a>
                </div>
            `).join('');
        } catch (error) {
            console.error('Evrak yükleme hatası:', error);
            alert('Evraklar yüklenirken bir hata oluştu');
        }
    }

    // Masrafları yükle
    async function loadExpenses(caseID) {
        try {
            const response = await fetch(`${API_URL}/AccountTransaction/list/${caseID}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });

            if (!response.ok) {
                throw new Error('Masraflar yüklenemedi');
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Masraflar yüklenemedi');
            }

            const expensesList = document.querySelector('.expenses-list');
            expensesList.innerHTML = result.data.map(expense => `
                <div class="list-item">
                    <h4>${escapeHtml(expense.description)}</h4>
                    <p>Tutar: ${expense.amount} TL</p>
                    <p>Ödeme Tarihi: ${formatDate(expense.paymentDate)}</p>
                    <p>Son Ödeme Tarihi: ${formatDate(expense.finalPaymentDate)}</p>
                </div>
            `).join('');
        } catch (error) {
            console.error('Masraf yükleme hatası:', error);
            alert('Masraflar yüklenirken bir hata oluştu');
        }
    }

    // Davalıları yükle
    async function loadDebtors(caseID) {
        try {
            const response = await fetch(`${API_URL}/Debtor/list/${caseID}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });

            if (!response.ok) {
                throw new Error('Davalılar yüklenemedi');
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Davalılar yüklenemedi');
            }

            const debtorsList = document.querySelector('.debtors-list');
            debtorsList.innerHTML = result.data.map(debtor => `
                <div class="list-item">
                    <h4>${escapeHtml(debtor.name)} ${escapeHtml(debtor.surname)}</h4>
                    <p>TC: ${escapeHtml(debtor.identityNumber)}</p>
                    <p>Telefon: ${escapeHtml(debtor.phoneNumber)}</p>
                    <p>Adres: ${escapeHtml(debtor.address)}</p>
                </div>
            `).join('');
        } catch (error) {
            console.error('Davalı yükleme hatası:', error);
            alert('Davalılar yüklenirken bir hata oluştu');
        }
    }

    // Üst menü butonları
    const showCasesListBtn = document.getElementById('showCasesList');
    const showSharesListBtn = document.getElementById('showSharesList');
    const showDocumentsListBtn = document.getElementById('showDocumentsList');
    const showExpensesListBtn = document.getElementById('showExpensesList');
    const showDebtorsListBtn = document.getElementById('showDebtorsList');

    // Alt bölümler
    const casesListSection = document.getElementById('casesListSection');
    const sharesListSection = document.getElementById('sharesListSection');
    const documentsListSection = document.getElementById('documentsListSection');
    const expensesListSection = document.getElementById('expensesListSection');
    const debtorsListSection = document.getElementById('debtorsListSection');

    // Global scope'da showSection fonksiyonunu tanımla
    function showSection(sectionName) {
        // Tüm butonların active class'ını kaldır
        document.querySelectorAll('.section-actions .btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // İlgili butonu aktif yap
        const activeButton = document.querySelector(`#show${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}List`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Tüm bölümleri gizle
        document.querySelectorAll('.sub-section').forEach(section => {
            section.classList.remove('active');
        });

        // İlgili bölümü göster ve verileri yükle
        const activeSection = document.getElementById(`${sectionName}ListSection`);
        if (activeSection) {
            activeSection.classList.add('active');
            
            // Verileri yükle
            switch (sectionName) {
                case 'cases':
                    loadCases();
                    break;
                case 'shares':
                    loadAllShares();
                    break;
                case 'documents':
                    loadAllDocuments();
                    break;
                case 'expenses':
                    loadAllExpenses();
                    break;
                case 'debtors':
                    loadAllDebtors();
                    break;
            }
        }
    }

    // Üst menü butonlarına event listener'lar ekle
    if (showCasesListBtn) showCasesListBtn.addEventListener('click', () => showSection('cases'));
    if (showSharesListBtn) showSharesListBtn.addEventListener('click', () => showSection('shares'));
    if (showDocumentsListBtn) showDocumentsListBtn.addEventListener('click', () => showSection('documents'));
    if (showExpensesListBtn) showExpensesListBtn.addEventListener('click', () => showSection('expenses'));
    if (showDebtorsListBtn) showDebtorsListBtn.addEventListener('click', () => showSection('debtors'));

    // Tüm payları yükle
    async function loadAllShares() {
        try {
            const response = await fetch(`${API_URL}/api/shares`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Paylar yüklenirken bir hata oluştu');
            }

            const shares = await response.json();
            const sharesList = document.getElementById('sharesList');
            if (sharesList) {
                sharesList.innerHTML = '';
                shares.forEach(share => {
                    const shareItem = document.createElement('div');
                    shareItem.className = 'list-item';
                    shareItem.innerHTML = `
                        <div class="item-details">
                            <span>Dosya: ${share.caseFileID}</span>
                            <span>Pay: ${share.shareAmount}</span>
                            <span>Durum: ${share.status}</span>
                        </div>
                        <div class="item-actions">
                            <button onclick="editShare(${share.id})" class="btn btn-edit">Düzenle</button>
                            <button onclick="deleteShare(${share.id})" class="btn btn-delete">Sil</button>
                        </div>
                    `;
                    sharesList.appendChild(shareItem);
                });
            }
        } catch (error) {
            console.error('Paylar yüklenirken hata:', error);
            alert('Paylar yüklenirken bir hata oluştu');
        }
    }

    // Tüm evrakları yükle
    async function loadAllDocuments() {
        try {
            const response = await fetch(`${API_URL}/api/documents`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Evraklar yüklenirken bir hata oluştu');
            }

            const documents = await response.json();
            const documentsList = document.getElementById('documentsList');
            if (documentsList) {
                documentsList.innerHTML = '';
                documents.forEach(doc => {
                    const docItem = document.createElement('div');
                    docItem.className = 'list-item';
                    docItem.innerHTML = `
                        <div class="item-details">
                            <span>Dosya: ${doc.caseFileID}</span>
                            <span>İsim: ${doc.name}</span>
                            <span>Tür: ${doc.type}</span>
                        </div>
                        <div class="item-actions">
                            <button onclick="viewDocument(${doc.id})" class="btn btn-view">Görüntüle</button>
                            <button onclick="deleteDocument(${doc.id})" class="btn btn-delete">Sil</button>
                        </div>
                    `;
                    documentsList.appendChild(docItem);
                });
            }
        } catch (error) {
            console.error('Evraklar yüklenirken hata:', error);
            alert('Evraklar yüklenirken bir hata oluştu');
        }
    }

    // Tüm masrafları yükle
    async function loadAllExpenses() {
        try {
            const response = await fetch(`${API_URL}/api/expenses`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Masraflar yüklenirken bir hata oluştu');
            }

            const expenses = await response.json();
            const expensesList = document.getElementById('expensesList');
            if (expensesList) {
                expensesList.innerHTML = '';
                expenses.forEach(expense => {
                    const expenseItem = document.createElement('div');
                    expenseItem.className = 'list-item';
                    expenseItem.innerHTML = `
                        <div class="item-details">
                            <span>Dosya: ${expense.caseFileID}</span>
                            <span>Tutar: ${expense.amount} TL</span>
                            <span>Durum: ${expense.transactionStatus}</span>
                        </div>
                        <div class="item-actions">
                            <button onclick="editExpense(${expense.id})" class="btn btn-edit">Düzenle</button>
                            <button onclick="deleteExpense(${expense.id})" class="btn btn-delete">Sil</button>
                        </div>
                    `;
                    expensesList.appendChild(expenseItem);
                });
            }
        } catch (error) {
            console.error('Masraflar yüklenirken hata:', error);
            alert('Masraflar yüklenirken bir hata oluştu');
        }
    }

    // Tüm davalıları yükle
    async function loadAllDebtors() {
        try {
            const response = await fetch(`${API_URL}/api/debtors`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Davalılar yüklenirken bir hata oluştu');
            }

            const debtors = await response.json();
            const debtorsList = document.getElementById('debtorsList');
            if (debtorsList) {
                debtorsList.innerHTML = '';
                debtors.forEach(debtor => {
                    const debtorItem = document.createElement('div');
                    debtorItem.className = 'list-item';
                    debtorItem.innerHTML = `
                        <div class="item-details">
                            <span>Ad: ${debtor.name}</span>
                            <span>TC: ${debtor.identityNumber}</span>
                            <span>Telefon: ${debtor.phoneNumber}</span>
                        </div>
                        <div class="item-actions">
                            <button onclick="editDebtor(${debtor.id})" class="btn btn-edit">Düzenle</button>
                            <button onclick="deleteDebtor(${debtor.id})" class="btn btn-delete">Sil</button>
                        </div>
                    `;
                    debtorsList.appendChild(debtorItem);
                });
            }
        } catch (error) {
            console.error('Davalılar yüklenirken hata:', error);
            alert('Davalılar yüklenirken bir hata oluştu');
        }
    }

    // İlk yükleme için dosya listesini göster
    showSection('cases');
}); 