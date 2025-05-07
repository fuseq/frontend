import {
    renderFromToEvents,
    renderFromToEventsByStart,
    renderSearchedEvents,
    renderTop5SearchedTerms,
    renderDailyEvents,
    renderHourlyEvents,
    renderOperatingSystemDistribution,
    renderLanguageDistribution,
    renderStoreCategoriesDonutChart,
    summarizeTitlesWithDetails,
    summarizeTopStoresByCategory,
    categorizeEventsByDayAndCategory,
    cleanCampaignData,
    getTotalActionsByFloor,
    findEventFloor,
    renderTopUnitsTable,
    renderTopStoresTable,
    summarizeTopFoodStoresByCategory,
    summarizeTopServicesByCategory,
    renderFoodPlacesTable,
    renderServicesTable,
    renderFloorsTable,
    renderKiosksTable,
    renderStoreCategoriesAreaChart,
    categorizeTitlesWithJson
} from './dataHandlers.js';

let globalSiteId = ''; // 🌐 Varsayılan site ID


document.addEventListener('DOMContentLoaded', () => {

    // Sayfa yüklendiğinde selectedSiteId'yi kontrol et
    const storedSiteId = localStorage.getItem('selectedSiteId');
    if (storedSiteId) {
        globalSiteId = storedSiteId;
        // Eğer startDate ve endDate mevcutsa, onları al
        const storedStartDate = localStorage.getItem('startDate');
        const storedEndDate = localStorage.getItem('endDate');
        if (storedStartDate && storedEndDate) {
            fetchAllData(storedStartDate, storedEndDate);
        } else {
            // Eğer startDate ve endDate yoksa, selectedRange değerini al ve verileri yükle
            const selectedRange = localStorage.getItem('selectedRange');
            if (selectedRange) {
                handleQuickRange(parseInt(selectedRange));
            }
        }
    }

    // globalSiteId değiştiğinde form elemanlarını aktif hale getirme
    function enableFormElements() {
        const inputs = document.querySelectorAll('#date-form input, #date-form button');
        inputs.forEach(input => {
            input.disabled = false;
        });
    }





    const form = document.getElementById('date-form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        localStorage.setItem('startDate', startDate);
        localStorage.setItem('endDate', endDate);
        localStorage.removeItem('selectedRange');

        fetchAllData(startDate, endDate);
    });

    // Hızlı seçim butonları
    document.getElementById('btn-1g').addEventListener('click', () => {
        localStorage.setItem('selectedRange', '1');
        localStorage.removeItem('startDate');
        localStorage.removeItem('endDate');
        handleQuickRange(1);
    });

    document.getElementById('btn-1h').addEventListener('click', () => {
        localStorage.setItem('selectedRange', '7');
        localStorage.removeItem('startDate');
        localStorage.removeItem('endDate');
        handleQuickRange(7);
    });

    document.getElementById('btn-1a').addEventListener('click', () => {
        localStorage.setItem('selectedRange', '30');
        localStorage.removeItem('startDate');
        localStorage.removeItem('endDate');
        handleQuickRange(30);
    });

    document.getElementById('btn-1y').addEventListener('click', () => {
        localStorage.setItem('selectedRange', '365');
        localStorage.removeItem('startDate');
        localStorage.removeItem('endDate');
        handleQuickRange(365);
    });

    const dropdownContent = document.getElementById('site-dropdown');

    // API'den site verilerini almak
    fetch('http://localhost:3001/api/sites')
        .then(response => response.json())
        .then(sites => {
            sites.forEach(site => {
                const siteItem = document.createElement('a');
                siteItem.href = '#';
                siteItem.textContent = site.name;

                // Stil sınıfı ekleyin (isteğe bağlı, CSS kısmı aşağıda)
                siteItem.classList.add('dropdown-item');

                siteItem.addEventListener('click', function () {
                    // Önce tüm item'lardan 'selected' sınıfını kaldır
                    document.querySelectorAll('.dropdown-item').forEach(item => {
                        item.classList.remove('selected');
                    });

                    // Tıklanan elemana 'selected' sınıfı ekle
                    siteItem.classList.add('selected');

                    localStorage.setItem('selectedSiteId', site.id);
                    localStorage.removeItem('startDate');
                    localStorage.removeItem('endDate');
                    localStorage.removeItem('selectedRange');

                    globalSiteId = site.id;
                    enableFormElements();

                    const startDate = document.getElementById('startDate').value;
                    const endDate = document.getElementById('endDate').value;
                    fetchAllData(startDate, endDate);
                });

                dropdownContent.appendChild(siteItem);
            });
        })
        .catch(error => {
            console.error('Veri alırken bir hata oluştu:', error);
        });

    const dropdownBtn = document.querySelector('.dropdown-btn');
    dropdownBtn.addEventListener('click', function () {
        dropdownContent.style.display = dropdownContent.style.display === 'block' ? 'none' : 'block';
    });

    window.addEventListener('click', function (event) {
        if (!event.target.matches('.dropdown-btn')) {
            dropdownContent.style.display = 'none';
        }
    });
});




function handleQuickRange(days) {
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');

    let startDate, endDate;

    const today = new Date();

    if (days === 30) {
        // Bugünün bulunduğu ayın ilk günü
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        // Ayın son günü: bir sonraki ayın 0. günü (yani bir önceki ayın son günü)
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (days === 365) {
        // Yılın ilk ve son günü
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
    } else if (days) {
        // Günlük/haftalık gibi normal aralıklar
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(endDate.getDate() - days + 1);
    } else {
        // days undefined veya 0 ise inputları temizle
        startDateInput.value = '';
        endDateInput.value = '';
        fetchAllData();
        return;
    }

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    startDateInput.value = startStr;
    endDateInput.value = endStr;

    fetchAllData(startStr, endStr);
}

function fetchAllData(startDate, endDate, siteId = globalSiteId) {
    const params = startDate && endDate
        ? `?startDate=${startDate}&endDate=${endDate}&siteId=${siteId}`
        : `?siteId=${siteId}`;

    fetch(`http://localhost:3001/api/user-statistics${params}`)
        .then(res => res.json())
        .then(data => {

            localStorage.setItem("totalVisits", data.totalVisits);
            localStorage.setItem("bounceRate", data.bounceRate);
            localStorage.setItem("mostVisitedDeviceType", data.mostVisitedDeviceType);
            localStorage.setItem("avgTimeOnPage", data.avgTimeOnPage);

            renderStatistics(data);
        })
        .catch(() => {
            document.getElementById('user-statistics').innerText = 'Veri alınamadı';
        });

    fetch(`http://localhost:3001/api/events/from-to-names${params}`)
        .then(res => res.json())
        .then(data => renderFromToEvents(data, 'from-to-events'));

    fetch(`http://localhost:3001/api/events/from-to-names${params}`)
        .then(res => res.json())
        .then(data => renderFromToEventsByStart(data, 'start-to-end-events'));

    fetch(`http://localhost:3001/api/events/searched${params}`)
        .then(res => res.json())
        .then(data => renderSearchedEvents(data, 'searched-events'));

    fetch(`http://localhost:3001/api/events/searched${params}`)
        .then(res => res.json())
        .then(data => renderTop5SearchedTerms(data, 'top-searchs'));

    fetch(`http://localhost:3001/api/os-distribution${params}`)
        .then(async res => {
            const text = await res.text();
            console.log("Gelen response (ham hali):", text);

            try {
                const data = JSON.parse(text);
                renderOperatingSystemDistribution(data, 'operating-systems');
                renderOperatingSystemDistribution(data, 'pdf-operating-systems');
            } catch (err) {
                console.error("JSON parse hatası:", err);
            }
        })
        .catch(err => {
            console.error("Fetch hatası:", err);
        });
    fetch(`http://localhost:3001/api/events/summary-counts${params}`)
        .then(res => res.json())
        .then(data => {
            // Gelen veriyi localStorage'a her birini ayrı kaydediyoruz
            localStorage.setItem('fromTo', data.fromTo);
            localStorage.setItem('searched', data.searched);
            localStorage.setItem('touched', data.touched);
            localStorage.setItem('total', data.total);

            // Veriyi render et
            renderEventSummary(data);
        })
        .catch(err => {
            console.error('Etkinlik verisi alınırken hata oluştu:', err);
            document.getElementById('event-summary').innerText = 'Veri alınamadı';
        });

    fetch(`http://localhost:3001/api/user-language-distribution${params}`)
        .then(async res => {
            const text = await res.text();
            console.log("Gelen response (ham hali):", text);

            try {
                const data = JSON.parse(text);
                renderLanguageDistribution(data, 'language-distribution');
            } catch (err) {
                console.error("JSON parse hatası:", err);
            }
        })
        .catch(err => {
            console.error("Fetch hatası:", err);
        });

    fetch(`http://localhost:3001/api/events/daily-count${params}`)
        .then(res => res.json())
        .then(data => {
            // renderDailyEvents fonksiyonunu çağırarak veriyi render et
            renderDailyEvents(data, 'daily-events');

            // En çok etkinlik sayısına sahip tarihi ve etkinlik sayısını belirle
            let mostEventsDate = '';
            let mostEventsCount = 0;

            data.forEach(item => {
                if (item.totalEvents > mostEventsCount) {
                    mostEventsCount = item.totalEvents;
                    mostEventsDate = item.date;
                }
            });

            // En çok etkinlik olan günü ve sayısını localStorage'a kaydet
            const mostEventsData = {
                date: mostEventsDate,
                totalEvents: mostEventsCount
            };
            localStorage.setItem('mostEventsData', JSON.stringify(mostEventsData));
        })
        .catch(err => {
            console.error('Günlük etkinlik verisi alınırken hata oluştu:', err);
            document.getElementById('daily-events').innerText = 'Veri alınamadı';
        });

    fetch(`http://localhost:3001/api/hourly-visits${params}`)
        .then(res => res.json())
        .then(data => {
            console.log('API Yanıtı:', data);
            if (data.success) {
                renderHourlyEvents(data.hourlyVisits, 'hourly-events');
            } else {
                console.error('API başarısız:', data.message);
            }
        })
        .catch(err => {
            console.error('API isteği sırasında bir hata oluştu:', err);
        });


    console.log("🔍 Fetch başlatılıyor: ", `http://localhost:3001/api/events/searched${params}`);

    fetch(`http://localhost:3001/api/events/searched${params}`)
        .then(response => response.json())
        .then(async data => {
            const titles = [];

            data.forEach(item => {
                const labelParts = item.label.split('->');
                if (labelParts.length > 1) {
                    const eventName = labelParts[1].trim();
                    titles.push(eventName);
                }
            });

            // Kategorize etme işlemi
            const categoryData = await categorizeTitlesWithJson(titles, `./assets/${globalSiteId}.json`);

            console.log("Kategoriler ve Etkinlik Sayıları:", categoryData);
            // En çok kullanılan kategoriyi bul
            let maxCategory = null;
            let maxCount = 0;

            categoryData.forEach(category => {
                if (category.nb_events > maxCount) {
                    maxCount = category.nb_events;
                    maxCategory = category.label;
                }
            });

            // Sadece kategoriyi localStorage'a kaydet
            if (maxCategory) {
                localStorage.setItem('mostUsedCategory', maxCategory);
            }

            // Donut chart'ı render etme
            renderStoreCategoriesDonutChart(categoryData, "donut-container");
        })
        .catch(error => {
            console.error("Hata oluştu:", error);
        });

    fetch(`http://localhost:3001/api/events/searched${params}`)
        .then(response => response.json())
        .then(async data => {
            const titleEventsMap = {};
            let totalEvents = 0;

            data.forEach(item => {
                const labelParts = item.label.split('->');
                if (labelParts.length > 1) {
                    const eventName = labelParts[1].trim();
                    const nbEvents = item.nb_events || 0;

                    titleEventsMap[eventName] = (titleEventsMap[eventName] || 0) + nbEvents;
                    totalEvents += nbEvents;
                }
            });

            console.log("Toplam Etkinlik Sayısı:", totalEvents);
            console.log("Title Event Map:", titleEventsMap);

            const entries = Object.entries(titleEventsMap);
            if (entries.length > 0) {
                const [mostSearchedUnit, maxCount] = entries.reduce((maxEntry, currentEntry) =>
                    currentEntry[1] > maxEntry[1] ? currentEntry : maxEntry
                );

                const mostSearchedData = {
                    unit: mostSearchedUnit,
                    count: maxCount
                };

                localStorage.setItem("mostSearchedUnit", JSON.stringify(mostSearchedData));
            }

            // Kategorize etme işlemi
            const categoryData = await summarizeTitlesWithDetails(titleEventsMap, `./assets/${globalSiteId}.json`, totalEvents);

            renderTopUnitsTable(categoryData, "top-units-table-container", totalEvents);
        })
        .catch(error => {
            console.error("Hata oluştu:", error);
        });

    fetch(`http://localhost:3001/api/events/searched${params}`)
        .then(response => response.json())
        .then(async data => {
            const titleEventsMap = {}; // { 'storeName': toplamEventSayısı }
            let totalEvents = 0;

            data.forEach(item => {
                const labelParts = item.label.split('->');
                if (labelParts.length > 1) {
                    const eventName = labelParts[1].trim();
                    const nbEvents = item.nb_events;

                    // Eğer bu başlık zaten varsa, event sayısını üzerine ekle
                    if (titleEventsMap[eventName]) {
                        titleEventsMap[eventName] += nbEvents;
                    } else {
                        titleEventsMap[eventName] = nbEvents;
                    }

                    totalEvents += nbEvents;
                }
            });

            console.log("Store-Toplam Etkinlik Sayısı:", totalEvents);

            // Yeni yapıya uygun çağrı
            const categoryData = await summarizeTopStoresByCategory(titleEventsMap, `./assets/${globalSiteId}.json`, totalEvents);
            console.log("cat-data", categoryData);

            renderTopStoresTable(categoryData, 'top-stores-container', totalEvents);
        })
        .catch(error => {
            console.error("Hata oluştu:", error);
        });
    fetch(`http://localhost:3001/api/events/searched${params}`)
        .then(response => response.json())
        .then(async data => {
            console.log("Gelen event verileri:", data); // << BURADA TÜM VERİYİ GÖSTERİR

            const titlesWithCounts = [];
            let totalEvents = 0; // Toplam event sayısı için bir değişken

            data.forEach(item => {
                const labelParts = item.label.split('->');
                if (labelParts.length > 1) {
                    const eventName = labelParts[1].trim();
                    const nbEvents = item.nb_events; // Event'e ait sayıyı alıyoruz
                    titlesWithCounts.push({ eventName, nbEvents }); // Etkinlik ismi ve sayısını bir obje olarak ekliyoruz

                    totalEvents += nbEvents; // Toplam etkinlik sayısına ekliyoruz
                }
            });

            // Toplam etkinlik sayısının doğru hesaplanıp hesaplanmadığını kontrol et
            console.log("Toplam Etkinlik Sayısı:", totalEvents); // Toplam etkinlik sayısını yazdırıyoruz

            // Kategorize etme işlemi
            const categoryData = await summarizeTopFoodStoresByCategory(titlesWithCounts, `./assets/${globalSiteId}.json`, totalEvents);
            console.log("food-data", categoryData);

            if (categoryData.length > 0) {
                const topFoodPlace = categoryData.reduce((max, current) =>
                    current.Count > max.Count ? current : max
                );

                localStorage.setItem("mostSearchedFoodPlace", JSON.stringify({
                    title: topFoodPlace.Title,
                    count: topFoodPlace.Count
                }));
            }

            renderFoodPlacesTable(categoryData, 'food-places-container', totalEvents);
        })
        .catch(error => {
            console.error("Hata oluştu:", error);
        });


    fetch(`http://localhost:3001/api/events/searched${params}`)
        .then(response => response.json())
        .then(async data => {
            console.log("Gelen event verileri:", data); // << BURADA TÜM VERİYİ GÖSTERİR

            const titlesWithCounts = [];
            let totalEvents = 0; // Toplam event sayısı için bir değişken

            data.forEach(item => {
                const labelParts = item.label.split('->');
                if (labelParts.length > 1) {
                    const eventName = labelParts[1].trim();
                    const nbEvents = item.nb_events; // Event'e ait sayıyı alıyoruz
                    titlesWithCounts.push({ eventName, nbEvents }); // Etkinlik ismi ve sayısını bir obje olarak ekliyoruz

                    totalEvents += nbEvents; // Toplam etkinlik sayısına ekliyoruz
                }
            });

            // Toplam etkinlik sayısının doğru hesaplanıp hesaplanmadığını kontrol et
            console.log("Toplam Etkinlik Sayısı:", totalEvents); // Toplam etkinlik sayısını yazdırıyoruz

            // Kategorize etme işlemi
            const categoryData = await summarizeTopServicesByCategory(titlesWithCounts, `./assets/${globalSiteId}.json`, totalEvents);
            console.log("cat-data", categoryData);

            renderServicesTable(categoryData, 'services-container', totalEvents);
        })
        .catch(error => {
            console.error("Hata oluştu:", error);
        });





    fetch(`http://localhost:3001/api/campaigns${params}`)
        .then(res => res.json())
        .then(data => {
            // Kampanya verisini temizleyelim
            const cleanedData = cleanCampaignData(data);
            console.log('Kiosk Verisi:', cleanedData);

            // Eğer veri boşsa işlemleri iptal et
            if (!cleanedData || cleanedData.length === 0) {
                // LocalStorage temizle
                localStorage.removeItem('mostUsedKioskId');
                localStorage.removeItem('usagePercentage');

                // Kiosk container'ı temizle
                const container = document.getElementById("kiosks-container");
                if (container) container.innerHTML = "";
                console.warn("Kiosk verisi boş, işlem yapılmadı.");
                return;
            }

            // Toplam kullanım sayısını hesapla
            const totalActions = cleanedData.reduce((total, kiosk) => total + kiosk.actions, 0);

            // En çok kullanılan kiosku bul
            const mostUsedKiosk = cleanedData.reduce((max, kiosk) => kiosk.actions > max.actions ? kiosk : max, cleanedData[0]);

            // En çok kullanılan kioskun ID'si ve yüzdesi
            const mostUsedKioskId = mostUsedKiosk.kiosk;
            const usagePercentage = ((mostUsedKiosk.actions / totalActions) * 100).toFixed(2);

            // Veriyi localStorage'a kaydet
            localStorage.setItem('mostUsedKioskId', mostUsedKioskId);
            localStorage.setItem('usagePercentage', usagePercentage);

            console.log(`En çok kullanılan kiosk: ${mostUsedKioskId}, Kullanım Yüzdesi: ${usagePercentage}%`);
            renderKiosksTable(cleanedData, "kiosks-container");
        })
        .catch(error => {
            console.error("Kampanya verisi alınırken hata oluştu:", error);
        });

    let ccpoResult = null;
    let eventResult = null;

    // Katlar
    const allFloors = [-3, -2, -1, 0, 1, 2, 3];

    // Tek seferlik kontrol
    function checkAndMerge() {
        if (ccpoResult !== null && eventResult !== null) {
            const mergedResults = [];

            // Toplamları hesapla
            const totalCCPO = Object.values(ccpoResult).reduce((sum, val) => sum + val, 0);
            const totalEvents = Object.values(eventResult).reduce((sum, val) => sum + val, 0);

            allFloors.forEach(floor => {
                const ccpo = ccpoResult?.[floor] || 0;
                const events = eventResult?.[floor] || 0;

                const kioskUsagePercent = totalCCPO > 0 ? ((ccpo / totalCCPO) * 100).toFixed(2) : '0.00';
                const unitSearchPercent = totalEvents > 0 ? ((events / totalEvents) * 100).toFixed(2) : '0.00';

                mergedResults.push({
                    floor,
                    kioskUsagePercent,
                    unitSearchPercent
                });
            });

            // 🔥 Tabloyu render et
            renderFloorsTable(mergedResults, 'floors-container');
        }
    }

    // Kampanya verisini al
    fetch(`http://localhost:3001/api/campaigns${params}`)
        .then(res => res.json())
        .then(data => {
            ccpoResult = getTotalActionsByFloor(data);
            console.log("CCPO bak", ccpoResult);

            // Tüm değerlerin 0 olup olmadığını kontrol et
            const allZeros = Object.values(ccpoResult).every(value => value === 0);

            if (allZeros) {
                console.log("Gelen tüm veri 0. checkAndMerge() çağrılmıyor ve floors-container temizleniyor.");
                const floorsContainer = document.getElementById('floors-container');
                if (floorsContainer) {
                    floorsContainer.innerHTML = '';
                }
            } else {
                checkAndMerge();
            }
        })
        .catch(error => {
            console.error("Kampanya verisi alınırken hata oluştu:", error);
        });

    // Etkinlik verisini al
    fetch(`http://localhost:3001/api/events/searched${params}`)
        .then(response => response.json())
        .then(async data => {
            console.log("Gelen event verileri:", data);

            const titlesWithCounts = data
                .filter(item => item.label.includes('->'))
                .map(item => {
                    const eventName = item.label.split('->')[1].trim();
                    return { eventName, nbEvents: item.nb_events };
                });

            const filepath = `./assets/${globalSiteId}.json`;
            eventResult = await findEventFloor(titlesWithCounts, filepath);
            console.log("Etkinlik ve Kat Bilgileri:", eventResult);

            const maxEventFloor = Object.entries(eventResult).reduce((max, [floor, nbEvents]) => {
                if (nbEvents > max.nbEvents) {
                    return { floor, nbEvents };
                }
                return max;
            }, { floor: null, nbEvents: 0 });

            // En çok işlem yapılan kat ve işlem sayısını localStorage'a kaydet
            if (maxEventFloor.floor !== null) {
                localStorage.setItem("maxEventFloor", maxEventFloor.floor);
                localStorage.setItem("maxEventNbEvents", maxEventFloor.nbEvents);
                console.log("En çok işlem yapılan kat:", maxEventFloor.floor);
                console.log("İşlem sayısı:", maxEventFloor.nbEvents);
            }

            // Eğer birden fazla kat varsa checkAndMerge çağrılır
            const floorCount = Object.keys(eventResult).length;
            if (floorCount > 1) {
                checkAndMerge();
            } else {
                localStorage.removeItem("maxEventFloor");
                localStorage.removeItem("maxEventNbEvents");
                const floorsContainer = document.getElementById('floors-container');
                floorsContainer.innerHTML = '';
                console.log("Yalnızca tek kat bulundu, checkAndMerge çağrılmayacak.");
            }
        })
        .catch(error => {
            console.error("Etkinlik verisi alınırken hata oluştu:", error);
        });



    fetch(`http://localhost:3001/api/events/searched-daily${params}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Veriler alınırken bir hata oluştu.');
            }
            return response.json();
        })
        .then(data => {
            console.log('Daily Gelen Veri:', data);

            // JSON dosyasını yükleyelim
            const jsonFilePath = `./assets/${globalSiteId}.json`;

            categorizeEventsByDayAndCategory(data, jsonFilePath)
                .then(categorizedData => {
                    console.log('Günlük Kategorize Edilmiş Veriler:', categorizedData);
                    renderStoreCategoriesAreaChart(categorizedData, "area-chart-container");
                    // Burada, kategorize edilmiş verileri kullanarak gerekli işlemleri yapabilirsiniz
                })
                .catch(error => {
                    console.error('Kategorize etme sırasında hata oluştu:', error);
                });
        })
        .catch(error => {
            console.error('Hata:', error);
        });




}



const deviceMap = {
    desktop: 'Masaüstü',
    mobile: 'Mobil',
    tablet: 'Tablet',
    other: 'Diğer'
};

function renderStatistics(data) {
    const totalVisits = document.getElementById('total-visits');
    const bounceRate = document.getElementById('bounce-rate');
    const mostVisitedDevice = document.getElementById('most-visited-device');
    const avgTime = document.getElementById('avg-time');

    totalVisits.innerHTML = `
        <div class="card text-white bg-primary mb-3">
            <div class="card-body">
                <h5 class="card-title">Toplam Ziyaret</h5>
                <p class="card-text">${data.totalVisits}</p>
            </div>
        </div>
    `;



    mostVisitedDevice.innerHTML = `
        <div class="card text-white bg-info mb-3">
            <div class="card-body">
                <h5 class="card-title">En Çok Kullanılan Cihaz</h5>
                <p class="card-text">${deviceMap[data.mostVisitedDeviceType?.toLowerCase()] || data.mostVisitedDeviceType}</p>
            </div>
        </div>
    `;

    avgTime.innerHTML = `
        <div class="card text-white bg-warning mb-3">
            <div class="card-body">
                <h5 class="card-title">Sayfada Ortalama Kalma Süresi</h5>
                <p class="card-text">${data.avgTimeOnPage} saniye</p>
            </div>
        </div>
    `;
    bounceRate.innerHTML = `
    <div class="card text-white bg-success mb-3">
        <div class="card-body">
            <h5 class="card-title">Ziyaretçi İlgisi</h5>
            <p class="card-text">
                ${data.bounceRate
            ? (() => {
                const rate = parseFloat(data.bounceRate);
                if (rate < 30) {
                    return 'Mükemmel';
                } else if (rate >= 30 && rate < 50) {
                    return 'İyi';
                } else if (rate >= 50 && rate < 70) {
                    return 'Ortalama';
                } else {
                    return 'Yüksek';
                }
            })()
            : 'Veri mevcut değil'
        }
            </p>
        </div>
    </div>
`;
}

function populateSummaryData() {
    // localStorage'dan verileri al ve sayı olarak parse et
    const fromTo = parseInt(localStorage.getItem("fromTo") || "0");
    const searched = parseInt(localStorage.getItem("searched") || "0");
    const touched = parseInt(localStorage.getItem("touched") || "0");

    // Toplam kullanım sayısını hesapla
    const total = fromTo + searched + touched;
    let date = ""; // Burada let kullanıyoruz çünkü sonrasında değiştireceğiz
    const selectedRange = localStorage.getItem("selectedRange");
    const startDateStr = localStorage.getItem("startDate");
    const endDateStr = localStorage.getItem("endDate");

    const formatDate = (date) => {
        return date.toLocaleDateString("tr-TR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const getDayName = (date) => {
        return date.toLocaleDateString("tr-TR", { weekday: "long" });
    };

    const now = new Date();

    // selectedRange'e göre tarih formatını belirleyin
    if (selectedRange) {
        const range = parseInt(selectedRange);
        let text = "";

        if (range === 1) {
            // Günlük tarih aralığı
            const dayName = getDayName(now);
            text = `${formatDate(now)} - ${dayName}, Günlük`;
        } else if (range === 7) {
            // Haftalık tarih aralığı
            const past = new Date(now);
            past.setDate(now.getDate() - 6);
            text = `${formatDate(past)} - ${formatDate(now)}, Haftalık`;
        } else if (range === 30) {
            // Aylık tarih aralığı
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const year = now.getFullYear();
            text = `${month}/${year}, Aylık`;
        } else if (range === 365) {
            // Yıllık tarih aralığı
            const year = now.getFullYear();
            text = `${year}, Yıllık`;
        }

        date = text;
    } else if (startDateStr && endDateStr) {
        // Eğer startDateStr ve endDateStr varsa
        const start = new Date(startDateStr);
        const end = new Date(endDateStr);
        date = `${formatDate(start)} - ${formatDate(end)}`;
    } else {
        date = "Tarih aralığı bulunamadı.";
    }

    // En çok kullanılan tarihi localStorage'dan al


    // HTML elemanlarına erişim
    const summary1Element = document.getElementById("summary-1");
    const summary2Element = document.getElementById("summary-2");
    const summary3Element = document.getElementById("summary-3");
    const summary4Element = document.getElementById("summary-4");
    const summary5Element = document.getElementById("summary-5");
    const summary6Element = document.getElementById("summary-6");
    const summary7Element = document.getElementById("summary-7");
    const summary8Element = document.getElementById("summary-8");
    const summary9Element = document.getElementById("summary-9");
    const summary10Element = document.getElementById("summary-10");
    const summary11Element = document.getElementById("summary-11");
    const summary12Element = document.getElementById("summary-12");

    if (summary1Element && summary2Element) {
        // İlk özet cümlesini güncelle
        summary1Element.innerHTML = `${date}  toplam <strong>${total.toLocaleString("tr-TR")}</strong> kez kullanım (arama, tıklama, rota çizdirme) yapılmıştır.`;

        // İkinci özet cümlesini güncelle
        summary2Element.innerHTML = `Kullanım Sayıları <strong>${fromTo.toLocaleString("tr-TR")}</strong> rota çizdirme, <strong>${searched.toLocaleString("tr-TR")}</strong> arama ve <strong>${touched.toLocaleString("tr-TR")}</strong> tıklama olarak dağılım göstermiştir.`;

        // Üçüncü özet cümlesini güncelle
        if (summary3Element) {
            summary3Element.textContent = '';
        }
    }

    const mostUsedCategory = localStorage.getItem("mostUsedCategory");
    summary4Element.textContent = "";

    if (mostUsedCategory) {
        summary4Element.innerHTML = `Kullanıcılar arasında en çok ilgi gören kategori <strong>${mostUsedCategory}</strong> olmuştur.`;
    }

    const mostSearchedUnitData = localStorage.getItem("mostSearchedUnit");
    summary5Element.textContent = "";

    if (mostSearchedUnitData) {
        const parsedData = JSON.parse(mostSearchedUnitData);
        const unit = parsedData.unit;
        const count = parsedData.count;

        summary5Element.innerHTML = `Kullanıcılar tarafından en çok aranan birim <strong>${count.toLocaleString("tr-TR")}</strong> kez ile <strong>${unit}</strong> olmuştur.`;
    }

    const mostSearchedFoodPlaceData = localStorage.getItem("mostSearchedFoodPlace");
    summary6Element.textContent = "";

    if (mostSearchedFoodPlaceData) {
        const parsedData = JSON.parse(mostSearchedFoodPlaceData);
        const title = parsedData.title;
        const count = parsedData.count;

        summary6Element.innerHTML = `Kullanıcılar tarafından en çok aranan yeme-içme mekanı <strong>${count.toLocaleString("tr-TR")}</strong> kez ile <strong>${title}</strong> olmuştur.`;
    }

    const mostEventsData = JSON.parse(localStorage.getItem('mostEventsData'));
    summary3Element.textContent = "";

    if (mostEventsData) {
        const mostEventsDate = mostEventsData.date;
        const mostEventsCount = mostEventsData.totalEvents;
        const mostEventsDateObj = new Date(mostEventsDate);
        const mostEventsFormattedDate = formatDate(mostEventsDateObj);
        const mostEventsDayName = getDayName(mostEventsDateObj);

        // summary3 cümlesini oluştur
        summary3Element.innerHTML = `En çok kullanılan gün <strong>${mostEventsCount.toLocaleString("tr-TR")}</strong> kez ile <strong>${mostEventsFormattedDate}</strong> <strong>${mostEventsDayName}</strong> günü olmuştur.`;
    }

    // 7. özet: Cihaz türü
    const mostVisitedDeviceType = localStorage.getItem("mostVisitedDeviceType");
    summary7Element.textContent = "";

    if (mostVisitedDeviceType) {
        summary7Element.innerHTML = `Kullanıcılar en çok <strong>${mostVisitedDeviceType.toLowerCase()}</strong> bir cihaz ile sistemi ziyaret etmiştir.`;
    }

    // 8. özet: Toplam ziyaret sayısı
    const totalVisits = localStorage.getItem("totalVisits");
    summary8Element.textContent = "";

    if (totalVisits) {
        summary8Element.innerHTML = `Toplam <strong>${parseInt(totalVisits).toLocaleString("tr-TR")}</strong> kez ziyaret gerçekleşmiştir.`;
    }

    const bounceRate = localStorage.getItem("bounceRate");
    summary9Element.textContent = "";

    if (bounceRate) {
        const rate = parseFloat(bounceRate);
        const description = `Ziyaretçilerin %${100 - rate} kadarı içeriklerle ilgilenmiş, sitede vakit geçirmiş ve tekrar ziyaret etmiştir.`;

        summary9Element.textContent = `${description}`;
    }

    // 10. özet: Ortalama sayfada kalma süresi
    const avgTimeOnPage = localStorage.getItem("avgTimeOnPage");
    summary10Element.textContent = "";

    if (avgTimeOnPage) {
        const seconds = parseInt(avgTimeOnPage);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        summary10Element.innerHTML = `Kullanıcılar sayfada ortalama <strong>${minutes}</strong> dakika <strong>${remainingSeconds}</strong> saniye kalmıştır.`;
    }

    // 11. özet: En çok işlem yapılan kat ve işlem sayısı
    const maxEventFloor = localStorage.getItem("maxEventFloor");
    const maxEventNbEvents = localStorage.getItem("maxEventNbEvents");

    summary11Element.textContent = "";

    if (maxEventFloor && maxEventNbEvents) {
        summary11Element.style.display = "block"; // görünür yap
        summary11Element.innerHTML = `En çok işlem yapılan kat, <strong>${maxEventFloor}</strong> olup toplamda <strong>${maxEventNbEvents}</strong> işlem gerçekleştirilmiştir.`;
    } else {
        summary11Element.style.display = "none"; // gizle
    }

    const mostUsedKioskId = localStorage.getItem('mostUsedKioskId');
    const usagePercentage = localStorage.getItem('usagePercentage');

    summary12Element.textContent = '';

    if (mostUsedKioskId && usagePercentage) {
        summary12Element.style.display = 'block'; // görünür yap
        summary12Element.innerHTML = `En çok kullanılan kiosk <strong>${mostUsedKioskId}</strong> olup, kullanım yüzdesi <strong>${usagePercentage}%</strong> olarak ölçülmüştür.`;
    } else {
        summary12Element.style.display = 'none'; // gizle
    }
}






window.addEventListener("DOMContentLoaded", function () {
    populateSummaryData();
});