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

    // API endpoint'i ve parametreleriniz
    const apiEndpoint = `http://localhost:3001/api/events/daily-count${params}`;

    fetch(apiEndpoint)
        .then(res => {
            // Yanıtın başarılı olup olmadığını kontrol edin
            if (!res.ok) {
                throw new Error(`API isteği başarısız oldu, durum: ${res.status}`);
            }
            return res.json();
        })
        .then(data => {
            // Gelen verinin formatını kontrol edin (örneğin, boş dizi olup olmadığını)
            if (!Array.isArray(data) || data.length === 0) {
                console.warn('API\'den boş veya geçersiz veri döndü.');
                const dailyEventsElement = document.getElementById('daily-events');
                if (dailyEventsElement) {
                    dailyEventsElement.innerText = 'Veri bulunamadı veya geçersiz format.';
                } else {
                    console.error('Hata veya veri bulunamadı mesajını gösterecek HTML elementi (id="daily-events") bulunamadı.');
                }
                return; // İşlemi durdur
            }

            // Veriyi tarihe göre artan sırada sırala (en eskiden en yeniye)
            data.sort((a, b) => new Date(a.date) - new Date(b.date));

            // renderDailyEvents fonksiyonunu çağırarak veriyi render et (isteğe bağlı)
            // renderDailyEvents(data, 'daily-events');

            const significantIncreaseDates = []; // Önemli artış gösteren tarihleri saklayacak dizi

            // Yapılandırılabilir eşikler (thresholds)
            const minEventDifference = 500; // Önceki güne göre minimum mutlak artış sayısı
            const minPreviousCount = 100; // Artışın dikkate alınması için önceki gün minimum etkinlik sayısı
            const minPercentageIncrease = 20; // Minimum yüzde artış oranı (% olarak)

            // Veri üzerinde döngü yap, ilk elemanı atla (önceki gün yok)
            for (let i = 1; i < data.length; i++) {
                const previousDayData = data[i - 1]; // Önceki günün verisi
                const currentDayData = data[i];     // İçinde bulunulan günün verisi

                const previousCount = previousDayData.totalEvents;
                const currentCount = currentDayData.totalEvents;

                // Olası artış miktarını hesapla
                const increaseAmount = currentCount - previousCount;

                // Yüzde artışı hesapla (karşılaştırma için ondalıklı değer)
                // previousCount 0 ise yüzde hesaplanamaz, bu durumu 0 olarak ele alalım
                const rawPercentageIncrease = (previousCount > 0) ? (increaseAmount / previousCount) * 100 : 0;


                if (currentCount > previousCount &&
                    increaseAmount >= minEventDifference &&
                    previousCount >= minPreviousCount &&
                    rawPercentageIncrease >= minPercentageIncrease) // <-- Yeni Koşul Eklendi
                {
                    // Eğer tüm koşullar sağlanırsa, yüzdeyi iki ondalık basamağa yuvarla
                    const percentageIncreaseFormatted = rawPercentageIncrease.toFixed(2);

                    significantIncreaseDates.push({
                        date: currentDayData.date, // Artışın yaşandığı gün (güncel tarih)
                        previousDate: previousDayData.date, // Karşılaştırılan önceki gün
                        previousCount: previousCount,
                        currentCount: currentCount,
                        increaseAmount: increaseAmount, // Mutlak artış miktarı (sayı olarak)
                        increasePercentage: percentageIncreaseFormatted // Yüzde artış oranı (% olarak, formatlı)
                    });
                }
            }

            // En çok etkinlik olan günü de bulma (isteğe bağlı, ayrı bir işlem)
            let mostEventsDate = '';
            let mostEventsCount = 0;
            // Sıralanmış veri üzerinde bulabiliriz, son tarihler dizinin sonundadır
            data.forEach(item => {
                if (item.totalEvents > mostEventsCount) {
                    mostEventsCount = item.totalEvents;
                    mostEventsDate = item.date;
                }
            });


            // Sonuçları konsola yazdır ve localStorage'a kaydet

            // En çok etkinlik olan günü ve sayısını localStorage'a kaydet
            const mostEventsData = {
                date: mostEventsDate,
                totalEvents: mostEventsCount
            };
            localStorage.setItem('mostEventsData', JSON.stringify(mostEventsData));
            console.log('En çok etkinlik olan gün:', mostEventsData);


            // Aşırı yükselme gösteren tarihler varsa, bunları loglayalım ve kaydedelim
            if (significantIncreaseDates.length > 0) {
                console.log('Günlük etkinlik sayısında önceki güne göre aşırı YÜKSELME olan tarihler (Min %' + minPercentageIncrease + ' Artış):', significantIncreaseDates);
                localStorage.setItem('significantIncreaseDates', JSON.stringify(significantIncreaseDates));
            } else {
                console.log('Belirtilen koşullara uygun (Min %' + minPercentageIncrease + ' Artış) aşırı etkinlik yükselmesi olan tarih bulunamadı.');
                // Eğer daha önce kaydedilmiş veri varsa temizle
                localStorage.removeItem('significantIncreaseDates');
            }
            renderDailyEvents(data, 'daily-events');

        })
        .catch(err => {
            console.error('Günlük etkinlik verisi alınırken hata oluştu:', err);
            // Hata durumunda kullanıcıya bilgi verin
            const dailyEventsElement = document.getElementById('daily-events');
            if (dailyEventsElement) {
                dailyEventsElement.innerText = 'Veri alınamadı.';
            } else {
                console.error('Hata mesajını gösterecek HTML elementi (id="daily-events") bulunamadı.');
            }
        });


    function analyzeHourlyVisits(hourlyVisits) {
        // Toplam ve ortalama hesapla
        const totalVisits = hourlyVisits.reduce((sum, val) => sum + val, 0);
        const average = totalVisits / hourlyVisits.length;
        const roundedAverage = Math.ceil(average);

        // Ortalamanın üzerindekileri filtrele
        const aboveAverage = hourlyVisits
            .map((value, hour) => ({ hour, value }))
            .filter(item => item.value > average);

        // En yüksek 3 saat
        const top3AboveAverage = [...aboveAverage]
            .sort((a, b) => b.value - a.value)
            .slice(0, 3)
            .map(({ hour, value }) => ({
                hour,
                visits: Math.ceil(value)
            }));

        // En yüksek saat
        const maxValue = Math.max(...hourlyVisits);
        const peakHour = hourlyVisits.indexOf(maxValue);
        const roundedMax = Math.ceil(maxValue);

        // Kaydedilecek veri
        const result = {
            totalVisits: Math.ceil(totalVisits),
            roundedAverage,
            top3AboveAverage,
            peakHour,
            peakValue: roundedMax
        };

        // localStorage'a kaydet
        localStorage.setItem('hourlyVisitAnalysis', JSON.stringify(result));

        // Konsola yaz
        console.log(`📈 Total Visits: ${Math.ceil(totalVisits)}`);
        console.log(`📊 Average visits/hour (rounded): ${roundedAverage}`);
        console.log("🔥 Top 3 hours above average:");
        top3AboveAverage.forEach(({ hour, visits }) => {
            console.log(`  - ${hour}:00 → ${visits} visits`);
        });
        console.log(`🚀 Peak Hour: ${peakHour}:00 with ${roundedMax} visits`);

        return result;
    }

    // Örnek kullanım
    fetch(`http://localhost:3001/api/hourly-visits${params}`)
        .then(res => res.json())
        .then(data => {
            console.log('saatlik Yanıtı:', data);
            if (data.success) {
                renderHourlyEvents(data.hourlyVisits, 'hourly-events');

                // 📈 Analiz işlemi burada
                analyzeHourlyVisits(data.hourlyVisits);
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
        .then(response => {
            if (!response.ok) { // İyi bir pratik: ilk fetch hatalarını kontrol edin
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(async searchedData => {
            const titleEventsMap = {}; // Sadece 'searched' verisinden gelen başlık ve sayıları
            // let totalEvents = 0; // Sadece 'searched' toplamı, artık birleşmiş toplamı kullanıyoruz

            // Searched verisini işle
            searchedData.forEach(item => {
                const labelParts = item.label.split('->');
                if (labelParts.length > 1) {
                    const eventName = labelParts[1].trim();
                    const nbEvents = item.nb_events || 0; // item'ın kendi nb_events'ini kullan

                    titleEventsMap[eventName] = (titleEventsMap[eventName] || 0) + nbEvents;
                    // totalEvents += nbEvents;
                }
            });

            console.log("Title Event Map (Searched):", titleEventsMap);
            // console.log("Total Events (Searched):", totalEvents);


            // --- Mevcut Kod (Opsiyonel): Sadece searched verisinden en çok aranan tek birimi bulup kaydetme ---
            // Eğer sadece searched verisinden en çok arananı ayrıca kaydetmeye devam etmek isterseniz bu kısmı tutun.
            // Yeni gereksinim birleşmiş veriden en çok aranan 3'ü bulmak.
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
                console.log("Most Searched Unit (from searched data):", mostSearchedData);
            } else {
                localStorage.removeItem("mostSearchedUnit");
                console.log("No searched data to determine most searched unit.");
            }
            // --- Mevcut Kod Sonu ---


            // Touched verisini al
            const touchedResponse = await fetch(`http://localhost:3001/api/events/touched${params}`);
            if (!touchedResponse.ok) { // İkinci fetch hatalarını kontrol edin
                throw new Error(`HTTP error! status: ${touchedResponse.status}`);
            }
            const touchedData = await touchedResponse.json(); // touchedData'nın { title: count, ... } formatında geldiğini varsayıyoruz

            const mergedMap = {}; // Birleşmiş başlık ve sayıları

            // Searched sayılarını mergedMap'e ekle
            for (const [title, count] of Object.entries(titleEventsMap)) {
                mergedMap[title] = count;
            }

            // Touched sayılarını mergedMap'e ekle (birleştir)
            for (const [title, count] of Object.entries(touchedData)) {
                if (mergedMap[title]) {
                    mergedMap[title] += count; // Eğer başlık varsa, touched sayısını üzerine ekle
                } else {
                    mergedMap[title] = count; // Eğer başlık yoksa, touched sayısıyla yeni giriş oluştur
                }
            }

            console.log("Birleşmiş Veri (Başlık -> Toplam Sayı):", mergedMap);

            // Birleşmiş veriden toplam etkinik sayısını hesapla
            const combinedTotalEvents = Object.values(mergedMap).reduce((sum, count) => sum + count, 0);
            console.log("Birleşmiş Toplam Etkinlik Sayısı (Searched + Touched):", combinedTotalEvents);


            // --- Yeni Kısım: Birleşmiş Veriden En Çok Kullanılan 3 Birimi Bul ---

            // mergedMap'teki veriyi sıralanabilir bir diziye dönüştür
            const sortedMergedUnits = Object.keys(mergedMap)
                .map(unit => ({ unit: unit, count: mergedMap[unit] })) // { unit: "Birim Adı", count: 25 } formatına çevir
                .sort((a, b) => b.count - a.count); // Kullanım sayısına göre azalan sırada sırala

            // En üstteki 3 birimi al
            const top3CombinedUnits = sortedMergedUnits.slice(0, 3);

            console.log("En Çok Kullanılan 3 Birim (Toplamdan):", top3CombinedUnits);

            // --- localStorage'a Kaydetme: En Çok Kullanılan 3 Birim (Toplamdan) ---
            // localStorage sadece string saklar, bu yüzden diziyi JSON stringine çevirin
            if (top3CombinedUnits.length > 0) { // Kaydedilecek bir birim olup olmadığını kontrol et
                localStorage.setItem('top3CombinedUnits', JSON.stringify(top3CombinedUnits));
                console.log('En çok kullanılan 3 birim (toplamdan) localStoragea kaydedildi.');
            } else {
                // localStorage.removeItem('top3CombinedUnits'); // İsteğe bağlı: Veri yoksa temizle
                console.warn('Kaydedilecek en çok kullanılan 3 birim (toplamdan) bulunamadı.');
            }
            // --- Yeni Kısım Sonu ---


            // Kategorize etme ve Render etme (birleşmiş veriyi summarizeTitlesWithDetails'a göndererek)
            // summarizeTitlesWithDetails fonksiyonunun mergedMap objesini beklediğini varsayıyoruz
            const categoryData = await summarizeTitlesWithDetails(mergedMap, `./assets/${globalSiteId}.json`, combinedTotalEvents);
            renderTopUnitsTable(categoryData, "top-units-table-container", combinedTotalEvents);

            // Diğer render işlemleri (categoryData veya searchedData'yı kullanarak)
            // renderSearchedEvents(searchedData, 'searched-events'); // Eğer gerekli ise
            // renderStoreCategoriesDonutChart(categoryData, "donut-container"); // Eğer kategori donut chartı gerekli ise

        })
        .catch(error => {
            console.error("Hata oluştu:", error);
            // Hata yönetimi: Kullanıcıya bilgi ver, UI'ı güncelle, localStorage'ı temizle
            // localStorage.removeItem("mostSearchedUnit"); // Eğer kullanılıyorsa
            // localStorage.removeItem("top3CombinedUnits");
        });


    fetch(`http://localhost:3001/api/events/searched${params}`)
        .then(response => response.json())
        .then(async searchedData => {
            const titleEventsMap = {}; // { 'storeName': toplamEventSayısı }
            let totalEvents = 0;

            // Searched verisini işle
            searchedData.forEach(item => {
                const labelParts = item.label.split('->');
                if (labelParts.length > 1) {
                    const eventName = labelParts[1].trim();
                    const nbEvents = item.nb_events;

                    titleEventsMap[eventName] = (titleEventsMap[eventName] || 0) + nbEvents;
                    totalEvents += nbEvents;
                }
            });

            // Touched verisini al
            const touchedResponse = await fetch(`http://localhost:3001/api/events/touched${params}`);
            const touchedData = await touchedResponse.json();

            // Touched verisini titleEventsMap'e ekle
            for (const [title, count] of Object.entries(touchedData)) {
                titleEventsMap[title] = (titleEventsMap[title] || 0) + count;
                totalEvents += count;
            }

            console.log("Store-Toplam Etkinlik Sayısı (Searched + Touched):", totalEvents);
            console.log("Birleştirilmiş titleEventsMap:", titleEventsMap);

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
        .then(async searchedData => {
            console.log("Gelen event verileri (searched):", searchedData);

            const titleEventCountMap = {};
            let totalEvents = 0;

            // Searched verisini işle
            searchedData.forEach(item => {
                const labelParts = item.label.split('->');
                if (labelParts.length > 1) {
                    const eventName = labelParts[1].trim();
                    const nbEvents = item.nb_events;

                    titleEventCountMap[eventName] = (titleEventCountMap[eventName] || 0) + nbEvents;
                    totalEvents += nbEvents;
                }
            });

            // Touched verisini al
            const touchedResponse = await fetch(`http://localhost:3001/api/events/touched${params}`);
            const touchedData = await touchedResponse.json();
            console.log("Gelen event verileri (touched):", touchedData);

            // Touched verisini işle
            for (const [eventName, count] of Object.entries(touchedData)) {
                titleEventCountMap[eventName] = (titleEventCountMap[eventName] || 0) + count;
                totalEvents += count;
            }

            // titleEventCountMap’i titlesWithCounts formatına çevir
            const titlesWithCounts = Object.entries(titleEventCountMap).map(([eventName, nbEvents]) => ({
                eventName,
                nbEvents
            }));

            console.log("Toplam Etkinlik Sayısı (Searched + Touched):", totalEvents);
            console.log("titlesWithCounts:", titlesWithCounts);

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
        .then(async searchedData => {
            console.log("Gelen event verileri (searched):", searchedData);

            const titleEventCountMap = {};
            let totalEvents = 0;

            // Searched verisini işle
            searchedData.forEach(item => {
                const labelParts = item.label.split('->');
                if (labelParts.length > 1) {
                    const eventName = labelParts[1].trim();
                    const nbEvents = item.nb_events;

                    titleEventCountMap[eventName] = (titleEventCountMap[eventName] || 0) + nbEvents;
                    totalEvents += nbEvents;
                }
            });

            // Touched verisini al
            const touchedResponse = await fetch(`http://localhost:3001/api/events/touched${params}`);
            const touchedData = await touchedResponse.json();
            console.log("Gelen event verileri (touched):", touchedData);

            // Touched verisini işle
            for (const [eventName, count] of Object.entries(touchedData)) {
                titleEventCountMap[eventName] = (titleEventCountMap[eventName] || 0) + count;
                totalEvents += count;
            }

            // titleEventCountMap’i titlesWithCounts formatına çevir
            const titlesWithCounts = Object.entries(titleEventCountMap).map(([eventName, nbEvents]) => ({
                eventName,
                nbEvents
            }));

            console.log("Toplam Etkinlik Sayısı (Searched + Touched):", totalEvents);
            console.log("titlesWithCounts:", titlesWithCounts);

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

            // Kiosk verisi içinde "web" veya "mobile-android" varsa tabloyu render etme
            const isExcludedKiosk = cleanedData.some(kiosk => kiosk.kiosk === "web" || kiosk.kiosk === "mobile-android");
            if (isExcludedKiosk) {
                console.warn("Kiosk verisi 'web' veya 'mobile-android' içeriyor, işlem yapılmadı.");
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
    const summary13Element = document.getElementById("summary-13");
    const summary14Element = document.getElementById("summary-14");
    const summary15Element = document.getElementById("summary-15");
    const summary16Element = document.getElementById("summary-16");

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

    if (mostUsedCategory === "Stand") {
        summary4Element.style.display = "none";
    } else if (mostUsedCategory) {
        summary4Element.style.display = "block"; // Eğer daha önce gizlendiyse yeniden göster
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
        summary3Element.innerHTML = `En çok işlem yapılan gün <strong>${mostEventsCount.toLocaleString("tr-TR")}</strong> kez ile <strong>${mostEventsFormattedDate}</strong> <strong>${mostEventsDayName}</strong> günü olmuştur.`;
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
        summary12Element.innerHTML = `<li>En çok kullanılan kiosk <strong>${mostUsedKioskId}</strong> olup, kullanım yüzdesi <strong>${usagePercentage}%</strong> olarak ölçülmüştür.</li>`;
    } else {
        summary12Element.style.display = 'none'; // gizle
    }
    const hourlyVisitAnalysis = JSON.parse(localStorage.getItem("hourlyVisitAnalysis"));
    summary13Element.textContent = "";

    if (hourlyVisitAnalysis && hourlyVisitAnalysis.roundedAverage) {
        const roundedAverage = hourlyVisitAnalysis.roundedAverage;
        summary13Element.innerHTML = `Saatlik ortalama ziyaret sayısı <strong>${roundedAverage}</strong> olarak hesaplanmıştır.`;
    }
    summary14Element.textContent = "";

    if (hourlyVisitAnalysis && hourlyVisitAnalysis.top3AboveAverage && hourlyVisitAnalysis.peakHour !== undefined) {
        const top3AboveAverage = hourlyVisitAnalysis.top3AboveAverage;
        const peakHour = hourlyVisitAnalysis.peakHour;
        const peakValue = hourlyVisitAnalysis.peakValue;

        summary14Element.style.display = 'block'; // görünür yap

        summary14Element.innerHTML = `
       <li> En çok ziyaret edilen saatler:
        <ul>
            ${top3AboveAverage.map(({ hour, visits }) => `<li><strong>${hour}:00</strong> - ${Math.ceil(visits)} ziyaret</li>`).join('')}
        </ul></li>`;
    } else {
        summary14Element.style.display = 'none'; // gizle
    }

    const significantIncreaseDates = JSON.parse(localStorage.getItem('significantIncreaseDates')) || [];

    summary15Element.textContent = "";

    // significantIncreaseDates'i artış yüzdesine göre azalan sırayla sıralayalım
    const sortedIncreaseDates = significantIncreaseDates.sort((a, b) => parseFloat(b.increasePercentage) - parseFloat(a.increasePercentage));

    // İlk 3 öğeyi al
    const top3SignificantIncreases = sortedIncreaseDates.slice(0, 3);

    // summary15 elementini temizle
    summary15Element.textContent = "";

    // Eğer significantIncreaseDates verisi varsa, summary15 elementini güncelle
    if (top3SignificantIncreases.length > 0) {
        summary15Element.style.display = 'block'; // Görünür yap

        summary15Element.innerHTML = `
        <li>Kullanımda sıçrama olan tarihler:
            <ul>
                ${top3SignificantIncreases.map(({ date, increasePercentage }) => `
                    <li>
                        <strong>${date}</strong> tarihinde ortalamaya göre %${increasePercentage} artış
                    </li>`).join('')}
            </ul>
        </li>`;
    } else {
        summary15Element.style.display = 'none'; // Gizle
    }

    const top3CombinedUnits = JSON.parse(localStorage.getItem("top3CombinedUnits"));
    summary16Element.textContent = ""; // Önce içeriği temizle

    if (top3CombinedUnits && Array.isArray(top3CombinedUnits)) {
        const sentence = top3CombinedUnits
            .map((item, index) => `<strong>${item.unit}</strong> (${item.count} kez)`)
            .join(", ");

        summary16Element.innerHTML = `Kullanıcılar arasında en çok ilgi gören ilk 3 birim sırasıyla: ${sentence}.`;
    } else {
        summary16Element.textContent = "Henüz bir kombinasyon verisi bulunmamaktadır.";
    }
}






window.addEventListener("DOMContentLoaded", function () {
    populateSummaryData();
});