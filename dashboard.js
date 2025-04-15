document.addEventListener('DOMContentLoaded', () => {
    // Token kontrolü
    const token = localStorage.getItem('token');
    const tokenExpiration = localStorage.getItem('tokenExpiration');
    const userName = localStorage.getItem('userName');
    
    // Token süresi dolmuş mu kontrol et
    if (!token || !tokenExpiration || new Date(tokenExpiration) < new Date()) {
        localStorage.clear();
        window.location.href = 'index.html';
        return;
    }

    const API_URL = 'http://localhost:7285';
    const sidebar = document.querySelector('.sidebar');
    const toggleButton = document.getElementById('toggleSidebar');
    const logoutButton = document.getElementById('logoutButton');
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const sections = document.querySelectorAll('.section');
    const userNameDisplay = document.getElementById('userNameDisplay');

    // Kullanıcı adını göster
    if (userNameDisplay && userName) {
        userNameDisplay.textContent = `Hoş geldiniz, ${userName}`;
    }

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
                loadSectionData(sectionId);
            }
        });
    });

    // Section verilerini yükleme
    async function loadSectionData(sectionId) {
        const container = document.querySelector(`#${sectionId}Section .${sectionId}-list`);
        if (!container) return;

        try {
            container.innerHTML = '<div class="loading">Yükleniyor...</div>';
            
            const response = await fetch(`${API_URL}/${sectionId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });

            if (!response.ok) {
                throw new Error('Veri yükleme başarısız');
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Veri yükleme başarısız');
            }

            updateSectionContent(sectionId, result.data, container);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
            container.innerHTML = '<div class="error">Veriler yüklenirken bir hata oluştu.</div>';
        }
    }

    // Section içeriğini güncelleme
    function updateSectionContent(sectionId, data, container) {
        if (!Array.isArray(data)) {
            container.innerHTML = '<div class="error">Geçersiz veri formatı</div>';
            return;
        }

        switch (sectionId) {
            case 'cases':
                container.innerHTML = data.length ? data.map(item => `
                    <div class="case-item">
                        <h3>${escapeHtml(item.title)}</h3>
                        <p>${escapeHtml(item.description)}</p>
                        <span class="status">${escapeHtml(item.status)}</span>
                    </div>
                `).join('') : '<div class="empty">Henüz dosya bulunmuyor.</div>';
                break;

            case 'users':
                container.innerHTML = data.length ? data.map(user => `
                    <div class="user-item">
                        <h3>${escapeHtml(user.name)}</h3>
                        <p>${escapeHtml(user.email)}</p>
                        <span class="role">${escapeHtml(user.role)}</span>
                    </div>
                `).join('') : '<div class="empty">Henüz kullanıcı bulunmuyor.</div>';
                break;

            default:
                container.innerHTML = '<div class="error">Bu bölüm henüz hazır değil.</div>';
        }
    }

    // HTML escape fonksiyonu
    function escapeHtml(str) {
        if (str === null || str === undefined) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}); 