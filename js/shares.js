// API URL'si
const API_URL = 'http://localhost:7285';

// Form ve liste elementleri
const addShareForm = document.getElementById('addShareForm');
const showAddShareFormBtn = document.getElementById('showAddShareForm');
const cancelAddShareBtn = document.getElementById('cancelAddShare');
const sharesList = document.getElementById('sharesList');
const caseFileSelect = document.getElementById('caseFileID');
const userSelect = document.getElementById('userID');
const shareAmountInput = document.getElementById('shareAmount');

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    loadCaseFiles();
    loadUsers();
    loadShares();
    
    // Form göster/gizle
    showAddShareFormBtn.addEventListener('click', () => {
        addShareForm.style.display = 'block';
    });
    
    cancelAddShareBtn.addEventListener('click', () => {
        addShareForm.style.display = 'none';
        addShareForm.reset();
    });
    
    // Form submit
    addShareForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const shareData = {
            caseFileID: parseInt(caseFileSelect.value),
            userID: parseInt(userSelect.value),
            shareAmount: parseFloat(shareAmountInput.value)
        };
        
        try {
            const response = await fetch(`${API_URL}/api/shares`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(shareData)
            });
            
            if (response.ok) {
                addShareForm.style.display = 'none';
                addShareForm.reset();
                loadShares();
            } else {
                alert('Pay eklenirken bir hata oluştu!');
            }
        } catch (error) {
            console.error('Pay ekleme hatası:', error);
            alert('Pay eklenirken bir hata oluştu!');
        }
    });
});

// Dosya listesini yükle
async function loadCaseFiles() {
    try {
        const response = await fetch(`${API_URL}/api/casefiles`);
        const caseFiles = await response.json();
        
        caseFileSelect.innerHTML = '<option value="">Dosya Seçin</option>';
        caseFiles.forEach(file => {
            const option = document.createElement('option');
            option.value = file.id;
            option.textContent = `${file.caseNumber} - ${file.title}`;
            caseFileSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Dosya listesi yüklenirken hata:', error);
    }
}

// Kullanıcı listesini yükle
async function loadUsers() {
    try {
        const response = await fetch(`${API_URL}/api/users`);
        const users = await response.json();
        
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

// Payları yükle
async function loadShares() {
    try {
        const response = await fetch(`${API_URL}/api/shares`);
        const shares = await response.json();
        
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
                    <button class="btn btn-edit" onclick="editShare(${share.id})">Düzenle</button>
                    <button class="btn btn-delete" onclick="deleteShare(${share.id})">Sil</button>
                </div>
            `;
            sharesList.appendChild(shareElement);
        });
    } catch (error) {
        console.error('Paylar yüklenirken hata:', error);
    }
}

// Pay düzenle
async function editShare(shareId) {
    try {
        const response = await fetch(`${API_URL}/api/shares/${shareId}`);
        const share = await response.json();
        
        caseFileSelect.value = share.caseFileID;
        userSelect.value = share.userID;
        shareAmountInput.value = share.shareAmount;
        
        addShareForm.style.display = 'block';
        
        // Form submit işlemini güncelle
        const originalSubmit = addShareForm.onsubmit;
        addShareForm.onsubmit = async (e) => {
            e.preventDefault();
            
            const shareData = {
                caseFileID: parseInt(caseFileSelect.value),
                userID: parseInt(userSelect.value),
                shareAmount: parseFloat(shareAmountInput.value)
            };
            
            try {
                const updateResponse = await fetch(`${API_URL}/api/shares/${shareId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(shareData)
                });
                
                if (updateResponse.ok) {
                    addShareForm.style.display = 'none';
                    addShareForm.reset();
                    loadShares();
                    addShareForm.onsubmit = originalSubmit;
                } else {
                    alert('Pay güncellenirken bir hata oluştu!');
                }
            } catch (error) {
                console.error('Pay güncelleme hatası:', error);
                alert('Pay güncellenirken bir hata oluştu!');
            }
        };
    } catch (error) {
        console.error('Pay bilgileri alınırken hata:', error);
        alert('Pay bilgileri alınırken bir hata oluştu!');
    }
}

// Pay sil
async function deleteShare(shareId) {
    if (confirm('Bu payı silmek istediğinizden emin misiniz?')) {
        try {
            const response = await fetch(`${API_URL}/api/shares/${shareId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadShares();
            } else {
                alert('Pay silinirken bir hata oluştu!');
            }
        } catch (error) {
            console.error('Pay silme hatası:', error);
            alert('Pay silinirken bir hata oluştu!');
        }
    }
} 