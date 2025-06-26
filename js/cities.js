const API_URL = 'https://socialieve.com/api';
// Şehir ve ilçe işlemleri
const cities = {
    // Şehirleri yükle
    async loadCities() {
        try {
            const result = await api.get(`${API_URL}/CitiesDistricts/GetAll`, false);
            if (result && result.data) {
                const citySelect = document.getElementById('cityID');
                if (!citySelect) return;

                citySelect.innerHTML = '<option value="">Şehir Seçiniz</option>';
                result.data.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city.id;
                    option.textContent = city.name;
                    citySelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Şehirler yüklenirken hata:', error);
        }
    },

    // İlçeleri yükle
    async loadDistricts(cityID) {
        try {
            const result = await api.get(`${API_URL}/CitiesDistricts/Get?CityID=${cityID}`);
            if (result.success && result.data) {
                const districtSelect = document.getElementById('districtID');
                if (!districtSelect) return;

                districtSelect.innerHTML = '<option value="">Seçiniz</option>';
                result.data.forEach(district => {
                    const option = document.createElement('option');
                    option.value = district.id;
                    option.textContent = district.name;
                    districtSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('İlçe yükleme hatası:', error);
            alert('İlçeler yüklenirken bir hata oluştu');
        }
    },

    // Kullanıcı formu için şehirleri yükle
    async loadUserCities() {
        try {
            const result = await api.get(`${API_URL}/CitiesDistricts/GetAll`, false);
            if (result && result.data) {
                const citySelect = document.getElementById('userCityID');
                citySelect.innerHTML = '<option value="">Şehir Seçiniz</option>';
                result.data.forEach(city => {
                    const option = document.createElement('option');
                    option.value = city.id;
                    option.textContent = city.name;
                    citySelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Kullanıcı şehirleri yüklenirken hata:', error);
        }
    },

    // Kullanıcı formu için ilçeleri yükle
    async loadUserDistricts(cityID) {
        try {
            const result = await api.get(`${API_URL}/CitiesDistricts/Get?CityID=${cityID}`);
            if (result.success && result.data) {
                const userDistrictSelect = document.getElementById('userDistrictID');
                userDistrictSelect.innerHTML = '<option value="">Seçiniz</option>';
                result.data.forEach(district => {
                    const option = document.createElement('option');
                    option.value = district.id;
                    option.textContent = district.name;
                    userDistrictSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('İlçe yükleme hatası:', error);
            alert('İlçeler yüklenirken bir hata oluştu');
        }
    }
}; 