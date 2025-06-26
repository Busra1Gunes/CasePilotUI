// UI işlemleri ve yardımcı fonksiyonlar
const ui = {
    // Bölüm gösterme/gizleme
    showSection(sectionName) {
        // Tüm bölümleri gizle
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        // Tüm linklerin active sınıfını kaldır
        document.querySelectorAll('.sidebar-nav a').forEach(link => {
            link.classList.remove('active');
        });
        // Seçilen bölümü göster
        const selectedSection = document.getElementById(`${sectionName}Section`);
        if (selectedSection) selectedSection.classList.add('active');
        // Seçilen linki aktif yap
        const selectedLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (selectedLink) selectedLink.classList.add('active');
    },

    // Tab gösterme
    showTab(tabName) {
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
    },

    // Tarih formatla
    formatDate(dateString) {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR');
    },

    // Para birimi formatla
    formatCurrency(amount) {
        if (!amount) return '-';
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(amount);
    },

    // Hata mesajı göster
    showError(message) {
        alert(message);
    },

    // Başarı mesajı göster
    showSuccess(message) {
        alert(message);
    },

    // Form temizle
    resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    },

    // Form göster/gizle
    toggleForm(formId, show) {
        const form = document.getElementById(formId);
        if (form) {
            form.style.display = show ? 'block' : 'none';
        }
    },

    showMessage(message, type = 'info') {
        alert(message); // Geliştirilebilir: özel modal veya toast
    }
};

/**
 * İlgili bölümü (section) gösterir ve diğerlerini gizler.
 * Sidebar'daki aktif linki günceller.
 * @param {string} sectionName - Gösterilecek bölümün adı (ör: 'users')
 */
export function showSection(sectionName) {
    // Tüm bölümlerden 'active' class'ını kaldır
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    // Sidebar'daki tüm linklerden 'active' class'ını kaldır
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.classList.remove('active');
    });
    // Seçilen bölüme 'active' class'ı ekle
    const selectedSection = document.getElementById(`${sectionName}Section`);
    if (selectedSection) selectedSection.classList.add('active');
    // Sidebar'da ilgili linki aktif yap
    const selectedLink = document.querySelector(`[data-section="${sectionName}"]`);
    if (selectedLink) selectedLink.classList.add('active');
}

/**
 * Kullanıcıya mesaj gösterir (alert ile).
 * @param {string} message - Gösterilecek mesaj
 * @param {string} [type='info'] - Mesaj tipi (info, success, error)
 */
export function showMessage(message, type = 'info') {
    alert(message); // Geliştirilebilir: özel modal veya toast
} 