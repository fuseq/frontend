// Ziyaretçi verisini çeker ve bar chart oluşturur


export const renderFromToEvents = (data, containerId) => {
    const startPoints = {};
    const endPoints = {};

    // Organize the data by start and end points
    data.forEach(item => {
        const [start, end] = item.label.split('->');
        startPoints[start.trim()] = (startPoints[start.trim()] || 0) + item.nb_events;
        endPoints[end.trim()] = (endPoints[end.trim()] || 0) + item.nb_events;
    });

    // Get the top 5 start and end points
    const topStartPoints = Object.entries(startPoints).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topEndPoints = Object.entries(endPoints).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Create labels for the x-axis based on the end points
    const startLabels = topStartPoints.map(([start]) => start);
    const endLabels = topEndPoints.map(([end]) => end);

    // Prepare datasets for each start point with its corresponding end points
    const datasets = topStartPoints.map(([start, startCount]) => {
        return {
            label: start,
            data: topEndPoints.map(([end]) => {
                // Count how many times this start point has the respective end point
                return data.filter(item => {
                    const [itemStart, itemEnd] = item.label.split('->');
                    return itemStart.trim() === start && itemEnd.trim() === end;
                }).reduce((sum, item) => sum + item.nb_events, 0);
            }),
            backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`, // Random color for each dataset
            stack: 'fromTo',
        };
    });

    // Create the chart
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Clear the container

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: endLabels, // The end points on the x-axis
            datasets: datasets,
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'En Çok Gidilen Yerler ve Nerelerden Gidildiği',
                },
                legend: {
                    display: false, // Remove the legend
                },
                datalabels: {
                    color: 'white',
                    anchor: 'center',
                    align: 'center',
                    formatter: (value, context) => {
                        if (value > 0) {
                            return context.dataset.label; // Show the start point label on top of each bar
                        }
                        return '';
                    },
                    font: {
                        weight: 'bold',
                        size: 12,
                    },
                },
            },
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Bitiş Noktaları',
                    },
                    ticks: {
                        display: true // Hide x-axis labels
                    }
                },
                y: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Toplam Seçim Sayısı',
                    },
                    beginAtZero: true,
                },
            },
        },
        plugins: [ChartDataLabels], // Plugin to show data labels
    });
};

export const renderFromToEventsByStart = (data, containerId) => {
    const startPoints = {};
    const endPoints = {};

    // Organize the data by start and end points
    data.forEach(item => {
        const [start, end] = item.label.split('->');
        startPoints[start.trim()] = (startPoints[start.trim()] || 0) + item.nb_events;
        endPoints[end.trim()] = (endPoints[end.trim()] || 0) + item.nb_events;
    });

    // Get the top 5 start and end points
    const topStartPoints = Object.entries(startPoints).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topEndPoints = Object.entries(endPoints).sort((a, b) => b[1] - a[1]).slice(0, 5);

    // Create labels for the x-axis based on the start points
    const startLabels = topStartPoints.map(([start]) => start);
    const endLabels = topEndPoints.map(([end]) => end);

    // Prepare datasets for each end point with its corresponding start points
    const datasets = topEndPoints.map(([end, endCount]) => {
        return {
            label: end,
            data: topStartPoints.map(([start]) => {
                // Count how many times this end point has the respective start point
                return data.filter(item => {
                    const [itemStart, itemEnd] = item.label.split('->');
                    return itemEnd.trim() === end && itemStart.trim() === start;
                }).reduce((sum, item) => sum + item.nb_events, 0);
            }),
            backgroundColor: `hsl(${Math.random() * 360}, 70%, 60%)`, // Random color for each dataset
            stack: 'fromTo',
        };
    });

    // Create the chart
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Clear the container

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: startLabels, // The start points on the x-axis
            datasets: datasets,
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Başlangıç Noktalarına Göre Hedef Dağılımı',
                },
                legend: {
                    display: false, // Remove the legend
                },
                datalabels: {
                    color: 'white',
                    anchor: 'center',
                    align: 'center',
                    formatter: (value, context) => {
                        if (value > 0) {
                            return context.dataset.label; // Show the end point label on top of each bar
                        }
                        return '';
                    },
                    font: {
                        weight: 'bold',
                        size: 12,
                    },
                },
            },
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Başlangıç Noktaları',
                    },
                    ticks: {
                        display: true // Show x-axis labels
                    }
                },
                y: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Toplam Seçim Sayısı',
                    },
                    beginAtZero: true,
                },
            },
        },
        plugins: [ChartDataLabels], // Plugin to show data labels
    });
};



export const renderSearchedEvents = (data, containerId) => {
    const placeMap = {};

    data.forEach(item => {
        const [searchTerm, selectedPlace] = item.label.split('->').map(str => str.trim());

        if (!placeMap[selectedPlace]) {
            placeMap[selectedPlace] = {};
        }

        placeMap[selectedPlace][searchTerm] =
            (placeMap[selectedPlace][searchTerm] || 0) + item.nb_events;
    });

    // 🔽 Calculate total events per place and get top 10
    const placeTotals = Object.entries(placeMap).map(([place, terms]) => {
        const total = Object.values(terms).reduce((sum, count) => sum + count, 0);
        return { place, total };
    });

    const topPlaces = placeTotals
        .sort((a, b) => b.total - a.total)
        .slice(0, 10)
        .map(entry => entry.place);

    const labels = topPlaces;

    // 🔽 Get unique search terms from only top 10 places
    const allSearchTermsSet = new Set();
    labels.forEach(place => {
        const terms = placeMap[place];
        if (terms) {
            Object.keys(terms).forEach(term => allSearchTermsSet.add(term));
        }
    });

    const allSearchTerms = Array.from(allSearchTermsSet);

    const datasets = allSearchTerms.map((term, index) => ({
        label: term,
        data: labels.map(place => placeMap[place][term] || 0),
        backgroundColor: `hsl(${(index * 60) % 360}, 70%, 60%)`,
        stack: 'search'
    }));

    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels,
            datasets
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'En Çok Seçilen Yerler ve Arama Kaynakları (İlk 10)'
                },
                legend: {
                    display: false
                },
                datalabels: {
                    color: 'white',
                    anchor: 'center',
                    align: 'center',
                    formatter: (value, context) => {
                        if (value > 0) {
                            return context.dataset.label;
                        }
                        return '';
                    },
                    font: {
                        weight: 'bold',
                        size: 12
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Seçilen Yer'
                    }
                },
                y: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Toplam Seçim Sayısı'
                    },
                    beginAtZero: true
                }
            }
        },
        plugins: [ChartDataLabels]
    });
};


export const renderTop5SearchedTerms = (data, containerId) => {
    const searchTermMap = {};

    data.forEach(item => {
        const [searchTerm] = item.label.split('->').map(str => str.trim());

        searchTermMap[searchTerm] =
            (searchTermMap[searchTerm] || 0) + item.nb_events;
    });

    // Arama terimlerini toplam seçim sayısına göre azalan sırayla sıralıyoruz
    const sortedSearchTerms = Object.entries(searchTermMap)
        .sort((a, b) => b[1] - a[1]) // b[1] > a[1] ile azalan sıralama
        .slice(0, 5); // En çok yapılan 5 aramayı alıyoruz

    const labels = sortedSearchTerms.map(([term]) => term);
    const dataValues = sortedSearchTerms.map(([, count]) => count);

    const datasets = [{
        label: 'En Çok Yapılan Aramalar',
        data: dataValues,
        backgroundColor: labels.map((_, index) => `hsl(${(index * 60) % 360}, 70%, 60%)`),
    }];

    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    new Chart(canvas, {
        type: 'bar', // Düz bar grafiği için bar tipini kullanıyoruz
        data: {
            labels,
            datasets
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'En Çok Yapılan 5 Arama'
                },
                legend: {
                    display: false // Alt legend'ı kaldırıyoruz
                },
                datalabels: {
                    display: false // Veri etiketlerini gizliyoruz
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Arama Terimi'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Toplam Seçim Sayısı'
                    },
                    beginAtZero: true
                }
            },
            interaction: {
                mode: 'index',  // Kullanıcı etkileşimini daha basit tutuyoruz
                intersect: false
            }
        },
        plugins: [ChartDataLabels] // Plugin'i aktif ediyoruz
    });
};


export const renderTouchedEvents = (data, containerId) => {
    const table = document.createElement('table');
    table.border = 1;
    table.style.marginTop = '10px';
    table.style.borderCollapse = 'collapse';
    table.innerHTML = "<tr><th>Harita Üzerinden En Çok Seçilen</th><th>Seçim Sayısı</th></tr>";

    data.forEach(item => {
        table.innerHTML += `
            <tr>
                <td style="padding:5px">${item.label}</td>
                <td style="padding:5px">${item.nb_events}</td>
            </tr>
        `;
    });

    const container = document.getElementById(containerId);
    container.innerHTML = '';
    container.appendChild(table);
};

export const renderDailyEvents = (data, containerId) => {
    console.log("Gelen Veriler:", data); // Veriyi konsola yazdır

    // Günlük etkinliklerin düzenlenmesi
    const dailyData = {};

    data.forEach(item => {
        const date = item.date; // Tarih bilgisini al
        dailyData[date] = (dailyData[date] || 0) + item.totalEvents; // totalEvents kullanın
    });

    // Tarihler ve etkinlik sayıları için etiketler
    const labels = Object.keys(dailyData);
    const eventCounts = Object.values(dailyData);

    console.log("Düzenlenmiş Etkinlik Verisi:", dailyData); // Düzenlenmiş veriyi konsola yazdır

    // Grafik için canvas elementini oluştur
    const container = document.getElementById(containerId);

    if (!container) {
        console.error(`Container '${containerId}' bulunamadı.`);
        return; // Fonksiyonu burada sonlandır
    }

    container.innerHTML = ''; // Container'ı temizle

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    // Chart.js kullanarak line chart oluştur
    new Chart(canvas, {
        type: 'line', // Bar yerine line tipi seçtik
        data: {
            labels, // Tarih etiketleri
            datasets: [{
                label: 'Etkinlik Sayısı',
                data: eventCounts, // Etkinlik sayıları
                fill: false, // Dolgu yapılmasın
                borderColor: 'rgba(75, 192, 192, 1)', // Çizgi rengi
                backgroundColor: 'rgba(75, 192, 192, 0.2)', // Yarı şeffaf alan
                borderWidth: 2,
                tension: 0.1 // Yumuşak geçişler için
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Etkinlik Sayıları',
                },
                legend: {
                    display: true, // Legend'ı gösterebiliriz
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Tarihler'
                    },
                    ticks: {
                        autoSkip: true, // Eğer tarihler çok sıkışıyorsa, otomatik olarak kaydır
                        maxTicksLimit: 7 // Max 7 etiket gösterebiliriz
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Etkinlik Sayısı'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}
export const renderHourlyEvents = (hourlyVisits, containerId) => {
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));

    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: hours,
            datasets: [{
                label: 'Ziyaret Sayısı',
                data: hourlyVisits,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Saatlik Ziyaret Dağılımı'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Saatler'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Ziyaret Sayısı'
                    }
                }
            }
        }
    });
};

export const renderOperatingSystemDistribution = (data, containerId) => {
    const labels = data.map(item => item.osFamily);
    const values = data.map(item => item.visits);

    const backgroundColors = labels.map((_, i) => `hsl(${(i * 360 / labels.length)}, 70%, 60%)`);

    const datasets = [{
        label: 'İşletim Sistemi Dağılımı',
        data: values,
        backgroundColor: backgroundColors,
    }];

    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    new Chart(canvas, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'İşletim Sistemi Dağılımı'
                },
                legend: {
                    position: 'right'
                },
                datalabels: {
                    color: '#fff',
                    formatter: (value, context) => {
                        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${percentage}%`;
                    },
                    font: {
                        weight: 'bold',
                        size: 12
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
};

let others = [];

export const renderLanguageDistribution = (data, containerId) => {
    const sortedEntries = Object.entries(data).sort((a, b) => b[1] - a[1]);

    const top5 = sortedEntries.slice(0, 5);
    others = sortedEntries.slice(5); // Global değişken

    const labels = top5.map(([language]) => language.split(' (')[0]);
    const values = top5.map(([, value]) => value);

    if (others.length > 0) {
        const otherTotal = others.reduce((sum, [, value]) => sum + value, 0);
        labels.push('Diğer');
        values.push(otherTotal);
    }

    const backgroundColors = labels.map((_, i) => `hsl(${(i * 360 / labels.length)}, 70%, 60%)`);

    const datasets = [{
        label: 'Dil Dağılımı',
        data: values,
        backgroundColor: backgroundColors,
    }];

    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    new Chart(canvas, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Dil Dağılımı (Top 5 + Diğer)'
                },
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function (tooltipItem) {
                            const label = tooltipItem.label;
                            const value = tooltipItem.raw;

                            if (label === 'Diğer') {
                                const otherLabels = others.map(([lang]) => lang.split(' (')[0]);
                                return [`${label}: ${value}`, ...otherLabels.map(l => `• ${l}`)];
                            }

                            return `${label}: ${value}`;
                        }
                    }
                },
                datalabels: {
                    color: '#fff',
                    formatter: (value, context) => {
                        const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${percentage}%`;
                    },
                    font: {
                        weight: 'bold',
                        size: 12
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
};

export async function categorizeTitlesWithJson(titles, jsonFilePath) {
    try {
        console.log(`📁 JSON dosyası yükleniyor: ${jsonFilePath}`);
        const response = await fetch(jsonFilePath);
        if (!response.ok) {
            throw new Error(`Dosya yüklenemedi: ${response.status}`);
        }

        const excelData = await response.json();
        console.log("✅ JSON verisi başarıyla alındı:", excelData);

        const result = {};

        // Başlıkların ID'lerini ve Cat_TR kategorilerini eşleştirelim
        titles.forEach(title => {
            const matched = excelData.find(item => item.Title === title); // Başlıkları JSON'da arıyoruz
            if (matched) {
                const category = matched.Cat_TR; // Kategoriyi alıyoruz

                if (category) {
                    if (!result[category]) {
                        result[category] = []; // Eğer kategori yoksa, yeni bir kategori oluşturuyoruz
                    }

                    result[category].push({ id: matched.ID, title: matched.Title }); // Kategorize edilen başlıkları ekliyoruz
                    console.log(`✅ "${matched.Title}" (${matched.ID}) kategorize edildi: ${category}`);
                } else {
                    console.warn(`⚠️ "${matched.Title}" başlığının kategorisi bulunamadı!`);
                }
            } else {
                console.warn(`⚠️ "${title}" başlığı JSON içinde bulunamadı!`);
            }
        });

        console.log("🗂️ Kategorize edilmiş veriler:", result);

        // Kategorilerin sayısını hesapla
        const categoryData = Object.entries(result).map(([category, items]) => ({
            label: category,
            nb_events: items.length
        }));

        console.log("📊 Kategoriler ve Etkinlik Sayıları:", categoryData);

        return categoryData; // Kategorileri döndürüyoruz
    } catch (error) {
        console.error("💥 Hata:", error);
        return [];
    }
}

export async function summarizeTitlesWithDetails(titleCountMap, jsonFilePath, totalEvents) {
    try {
        console.log(`📁 JSON dosyası yükleniyor: ${jsonFilePath}`);
        const response = await fetch(jsonFilePath);
        if (!response.ok) {
            throw new Error(`Dosya yüklenemedi: ${response.status}`);
        }

        const jsonData = await response.json();
        console.log("✅ JSON verisi başarıyla alındı:", jsonData);

        const result = [];

        Object.entries(titleCountMap).forEach(([title, count]) => {
            const matched = jsonData.find(item => item.Title === title);

            if (matched) {
                result.push({
                    Title: matched.Title,
                    Count: count,
                    Cat_TR: matched.Cat_TR || "Kategori Yok",
                    Description: matched.Description || "Açıklama Yok"
                });

                console.log(`✅ "${matched.Title}" (${count} kez) → Kategori: ${matched.Cat_TR}, Açıklama: ${matched.Description}`);
            } else {
                console.warn(`⚠️ "${title}" başlığı JSON içinde bulunamadı!`);
            }
        });

        console.log("📊 Özetlenen Başlıklar:", result);
        return result;
    } catch (error) {
        console.error("💥 Hata:", error);
        return [];
    }
}


export async function summarizeTopStoresByCategory(titleEventsMap, jsonFilePath) {
    try {
        console.log(`📁 JSON dosyası yükleniyor: ${jsonFilePath}`);
        const response = await fetch(jsonFilePath);
        if (!response.ok) {
            throw new Error(`Dosya yüklenemedi: ${response.status}`);
        }

        const jsonData = await response.json();
        console.log("✅ JSON verisi başarıyla alındı:", jsonData);

        const categoriesToInclude = [
            "Giyim", "Ayakkabı & Çanta", "Aksesuar & Mücevher", "Elektronik", "Çocuk",
            "Kozmetik & Sağlık", "Ev & Dekorasyon", "Lokum & Şekerleme", "Spor",
            "Market", "Kültür & Eğlence","Stand",
        ];

        const filteredResults = [];

        Object.entries(titleEventsMap).forEach(([title, count]) => {
            const matched = jsonData.find(item => item.Title === title && categoriesToInclude.includes(item.Cat_TR));
            if (matched) {
                filteredResults.push({
                    Title: matched.Title,
                    Count: count,
                    Cat_TR: matched.Cat_TR,
                    Description: matched.Description || "Açıklama Yok"
                });


            } else {

            }
        });

        const topResults = filteredResults
            .sort((a, b) => b.Count - a.Count)
            .slice(0, 10);

        return topResults;
    } catch (error) {
        console.error("💥 Hata:", error);
        return [];
    }
}

export async function categorizeEventsByDayAndCategory(dailyData, jsonFilePath) {
    try {
        console.log(`📁 JSON dosyası yükleniyor: ${jsonFilePath}`);

        // JSON dosyasını yükleme
        const response = await fetch(jsonFilePath);
        if (!response.ok) {
            throw new Error(`Dosya yüklenemedi: ${response.status}`);
        }

        // JSON verisini alma
        const jsonData = await response.json();
        console.log("✅ JSON verisi başarıyla alındı:", jsonData);

        // Kategorilere dahil etmek istediğimiz kategoriler
        const categoriesToInclude = [
            "Giyim", "Ayakkabı & Çanta", "Aksesuar & Mücevher", "Elektronik", "Çocuk",
            "Kozmetik & Sağlık", "Ev & Dekorasyon", "Lokum & Şekerleme", "Spor",
            "Market", "Kültür & Eğlence","Hizmet", "Otopark", "Stand", "Wc", "Yiyecek"
        ];

        // Günlük verileri tutacak nesne
        const categorizedData = {};

        // Her gün için işlem yapalım
        Object.entries(dailyData).forEach(([date, events]) => {
            const dailyCategories = {};

            // Gelen her etkinliği kontrol et
            events.forEach(event => {
                const title = event.label;
                const count = event.total_nb_events;

                // JSON dosyasındaki kategoriye uygun item'leri bulma
                const matched = jsonData.find(item => item.Title === title && categoriesToInclude.includes(item.Cat_TR));

                if (matched) {
                    // Kategorilere göre verileri gruplayalım
                    const category = matched.Cat_TR;

                    if (!dailyCategories[category]) {
                        dailyCategories[category] = 0;
                    }
                    dailyCategories[category] += count;
                }
            });

            // Gün için kategorize edilmiş veriyi kaydedelim
            categorizedData[date] = dailyCategories;
        });

        console.log("📊 Günlük kategorize edilmiş etkinlik verileri:", categorizedData);
        return categorizedData;
    } catch (error) {
        console.error("💥 Hata:", error);
        return {};
    }
}

export async function summarizeTopFoodStoresByCategory(titlesWithCounts, jsonFilePath) {
    try {
        console.log(`📁 JSON dosyası yükleniyor: ${jsonFilePath}`);
        const response = await fetch(jsonFilePath);
        if (!response.ok) {
            throw new Error(`Dosya yüklenemedi: ${response.status}`);
        }

        const jsonData = await response.json();
        console.log("✅ JSON verisi başarıyla alındı:", jsonData);

        // Başlık sayacı: titlesWithCounts içindeki aynı başlıkları toplamak için
        const combinedTitles = titlesWithCounts.reduce((accumulator, currentItem) => {
            // Eğer title zaten accumulator içinde varsa, nbEvents'ini arttır
            if (accumulator[currentItem.eventName]) {
                accumulator[currentItem.eventName] += currentItem.nbEvents;
            } else {
                accumulator[currentItem.eventName] = currentItem.nbEvents;
            }
            return accumulator;
        }, {});

        // Toplanan etkinliklerin toplam sayısını görmek için
        console.log("Toplanan etkinlikler:", combinedTitles);

        // JSON'dan filtrelenen sonuçları bul
        const categoriesToInclude = [
            "Restoran & Cafe",
            "Fast Food",
            "Yiyecek"
        ];

        const filteredResults = [];

        Object.entries(combinedTitles).forEach(([eventName, totalEvents]) => {
            const matched = jsonData.find(item => item.Title === eventName && categoriesToInclude.includes(item.Cat_TR));

            if (matched) {
                filteredResults.push({
                    Title: matched.Title,
                    Count: totalEvents,
                    Cat_TR: matched.Cat_TR,
                    Description: matched.Description || "Açıklama Yok"
                });


            } else {

            }
        });

        // Kategorilere göre en yüksek 10 birimi al
        const topResults = filteredResults
            .sort((a, b) => b.Count - a.Count)  // Sayıya göre azalan sırala
            .slice(0, 10);  // İlk 10 elemanı al

        console.log("📊 En Yüksek 10 Başlık:", topResults);
        return topResults;

    } catch (error) {
        console.error("💥 Hata:", error);
        return [];
    }
}

export async function summarizeTopServicesByCategory(titlesWithCounts, jsonFilePath) {
    try {
        console.log(`📁 JSON dosyası yükleniyor: ${jsonFilePath}`);
        const response = await fetch(jsonFilePath);
        if (!response.ok) {
            throw new Error(`Dosya yüklenemedi: ${response.status}`);
        }

        const jsonData = await response.json();
        console.log("✅ JSON verisi başarıyla alındı:", jsonData);

        // Başlık sayacı: titlesWithCounts içindeki aynı başlıkları toplamak için
        const combinedTitles = titlesWithCounts.reduce((accumulator, currentItem) => {
            // Eğer title zaten accumulator içinde varsa, nbEvents'ini arttır
            if (accumulator[currentItem.eventName]) {
                accumulator[currentItem.eventName] += currentItem.nbEvents;
            } else {
                accumulator[currentItem.eventName] = currentItem.nbEvents;
            }
            return accumulator;
        }, {});

        // Toplanan etkinliklerin toplam sayısını görmek için
        console.log("Toplanan etkinlikler:", combinedTitles);

        // JSON'dan filtrelenen sonuçları bul
        const categoriesToInclude = [
            "Hizmetler",
            "Hizmet Mağazaları",
            "Hizmet", 
            "Otopark",
            "Wc",
        ];

        const filteredResults = [];

        Object.entries(combinedTitles).forEach(([eventName, totalEvents]) => {
            const matched = jsonData.find(item => item.Title === eventName && categoriesToInclude.includes(item.Cat_TR));

            if (matched) {
                filteredResults.push({
                    Title: matched.Title,
                    Count: totalEvents,
                    Cat_TR: matched.Cat_TR,
                    Description: matched.Description || "Açıklama Yok"
                });


            } else {

            }
        });

        // Kategorilere göre en yüksek 10 birimi al
        const topResults = filteredResults
            .sort((a, b) => b.Count - a.Count)  // Sayıya göre azalan sırala
            .slice(0, 10);  // İlk 10 elemanı al

        console.log("📊 En Yüksek 10 Başlık:", topResults);
        return topResults;

    } catch (error) {
        console.error("💥 Hata:", error);
        return [];
    }
}
export function cleanCampaignData(data) {
    const floorMap = {
        "-3": "-3. kat",
        "-2": "-2. kat",
        "-1": "-1. kat",
        "0": "0. kat",
        "1": "1. kat",
        "2": "2. kat",
        "3": "3. kat"
    };

    return data.map(item => {
        const label = item.label;
        const nb_actions = item.nb_actions;

        // kattan sonra gelen sayı değerini alalım
        const match = label.match(/k-?(\d+)/i);
        let number = match ? parseInt(match[1], 10) : null;

        // Kat belirleme
        let floorKey;
        if (label.includes('-')) {
            // Negatif katlar
            floorKey = number >= 300 ? "-3"
                : number >= 200 ? "-2"
                    : number >= 100 ? "-1"
                        : "-1"; // default
        } else {
            // Pozitif katlar
            floorKey = number < 100 ? "0"
                : number < 200 ? "1"
                    : number < 300 ? "2"
                        : "3";
        }

        const floor = floorMap[floorKey] || "Bilinmeyen kat";

        return {
            kiosk: label,
            actions: nb_actions,
            floor: floor
        };
    });
}

export function getTotalActionsByFloor(data) {
    // Katlara göre toplam kullanım sayısını tutacak bir obje
    const totalActionsByFloor = {
        "-3": 0,
        "-2": 0,
        "-1": 0,
        "0": 0,
        "1": 0,
        "2": 0,
        "3": 0
    };

    // Veriyi işle
    data.forEach(item => {
        const label = item.label;
        const nb_actions = item.nb_actions;

        // kattan sonra gelen sayı değerini alalım
        const match = label.match(/k-?(\d+)/i);
        let number = match ? parseInt(match[1], 10) : null;

        // Kat belirleme
        let floorKey;
        if (label.includes('-')) {
            // Negatif katlar
            floorKey = number >= 300 ? "-3"
                : number >= 200 ? "-2"
                    : number >= 100 ? "-1"
                        : "-1"; // default
        } else {
            // Pozitif katlar
            floorKey = number < 100 ? "0"
                : number < 200 ? "1"
                    : number < 300 ? "2"
                        : "3";
        }

        // Toplam kullanım sayısını ilgili kat için artır
        if (totalActionsByFloor[floorKey] !== undefined) {
            totalActionsByFloor[floorKey] += nb_actions;
        }
    });

    // Toplam kullanım sayılarıyla birlikte döndür
    return totalActionsByFloor;
}


export function findEventFloor(titlesWithCounts, filepath) {
    // JSON dosyasındaki kat bilgilerini almak için fetch işlemi yapılıyor
    return fetch(filepath)
        .then(response => response.json())
        .then(floorData => {
            // Kat verilerini bir objeye dönüştürerek, etkinlik ismi ile ilişkilendiriyoruz
            const eventFloorMap = floorData.reduce((acc, item) => {
                // Title'ı düzgün bir şekilde alıyoruz
                const title = item.Title.trim(); // Title'ı temizliyoruz (boşlukları kaldırıyoruz)
                const floor = item.Floor; // Floor bilgisini alıyoruz
                acc[title] = floor; // Eşleme yapıyoruz
                return acc;
            }, {});

            console.log("Event Floor Map:", eventFloorMap); // Kat bilgileri haritasını kontrol edelim

            // Sonuçları toplamak için bir dizi oluşturuyoruz
            const results = titlesWithCounts.map(item => {
                const eventName = item.eventName.trim(); // eventName'in başındaki ve sonundaki boşlukları temizliyoruz

                // eventName ile eşleşen kat bilgisini eventFloorMap'ten alıyoruz
                const floor = eventFloorMap[eventName] || "Bilinmiyor"; // Kat bilgisi bulunmazsa "Bilinmiyor" döndürüyoruz

                return {
                    eventName: item.eventName,
                    floor: floor,
                    nbEvents: item.nbEvents
                };
            });

            // "Bilinmiyor" olan floor'ları temizliyoruz
            const filteredResults = results.filter(item => item.floor !== "Bilinmiyor");

            console.log("Filtered Results (without unknown floors):", filteredResults); // "Bilinmiyor" olanları temizledikten sonra veriyi kontrol edelim

            // Aynı eventName'lere sahip olanları birleştiriyoruz
            const mergedResults = filteredResults.reduce((acc, item) => {
                // Eğer eventName zaten acc içinde varsa, nbEvents'i topluyoruz
                const existingItem = acc.find(i => i.eventName === item.eventName);
                if (existingItem) {
                    existingItem.nbEvents += item.nbEvents; // nbEvents'i topluyoruz
                } else {
                    acc.push(item); // Yoksa yeni bir öğe ekliyoruz
                }
                return acc;
            }, []);

            // Total events per floor calculation
            const totalEventsByFloor = mergedResults.reduce((acc, item) => {
                // Kat bilgisi ile eşleşen nbEvents'i ekliyoruz
                const floor = item.floor;
                const nbEvents = item.nbEvents;

                if (!acc[floor]) {
                    acc[floor] = 0; // Kat yoksa başlatıyoruz
                }

                acc[floor] += nbEvents; // Katın toplam etkinlik sayısını ekliyoruz
                return acc;
            }, {});

            console.log("Total Events by Floor:", totalEventsByFloor); // Her kat için toplam etkinlik sayısını yazdıralım

            // Sonuçları döndürüyoruz
            return totalEventsByFloor;
        })
        .catch(error => {
            console.error("Hata oluştu:", error);
        });
}





export const renderStoreCategoriesDonutChart = (data, containerId) => {
    const categoryMap = {};

    // Kategori bazlı toplamları hesapla
    data.forEach(item => {
        const category = item.label.trim();
        categoryMap[category] = (categoryMap[category] || 0) + item.nb_events;
    });

    // Toplam etkinlik sayısını hesapla
    const totalEvents = Object.values(categoryMap).reduce((sum, count) => sum + count, 0);

    // 5%'in altındaki kategorileri "Diğer" olarak topla
    const updatedCategoryMap = {};
    let otherCategoryCount = 0;

    Object.keys(categoryMap).forEach(category => {
        const categoryCount = categoryMap[category];
        const percentage = (categoryCount / totalEvents) * 100;

        if (percentage < 5) {
            otherCategoryCount += categoryCount;  // %5'ten az olanları topluyoruz
        } else {
            updatedCategoryMap[category] = categoryCount;  // %5'ten büyük olanları olduğu gibi bırakıyoruz
        }
    });

    // "Diğer" kategorisini ekliyoruz
    if (otherCategoryCount > 0) {
        updatedCategoryMap["Diğer"] = otherCategoryCount;
    }

    // Grafikte kullanılacak veriyi oluştur
    const labels = Object.keys(updatedCategoryMap);
    const dataValues = Object.values(updatedCategoryMap);
    const backgroundColors = labels.map((_, i) => `hsl(${(i * 60) % 360}, 70%, 60%)`);

    const datasets = [{
        data: dataValues,
        backgroundColor: backgroundColors,
        borderWidth: 1
    }];

    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Var olan grafiği temizle

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels,
            datasets
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Ana Kategorilere Göre Dağılım'
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 20,
                        padding: 15
                    }
                },
                datalabels: {
                    color: 'white',
                    formatter: (value, context) => {
                        const total = dataValues.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${percentage}%`;
                    },
                    font: {
                        weight: 'bold',
                        size: 12
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
};

export const renderStoreCategoriesAreaChart = (data, containerId) => {
    const container = document.getElementById(containerId);
    container.innerHTML = ''; // Var olan grafiği temizle

    const canvas = document.createElement('canvas');
    container.appendChild(canvas);

    // Veriyi kategori ve tarihe göre grupla
    const categoryDateMap = {};
    const dateSet = new Set();

    // Data içindeki kategoriyi ve tarihi analiz et
    Object.entries(data).forEach(([date, categories]) => {
        dateSet.add(date);

        Object.entries(categories).forEach(([category, count]) => {
            if (!categoryDateMap[category]) categoryDateMap[category] = {};
            categoryDateMap[category][date] = (categoryDateMap[category][date] || 0) + count;
        });
    });

    // Tüm tarihleri sırala
    const sortedDates = Array.from(dateSet).sort();

    // Datasetleri hazırla
    const datasets = Object.keys(categoryDateMap).map((category, i) => {
        const dataPoints = sortedDates.map(date => categoryDateMap[category][date] || 0);
        return {
            label: category,
            data: dataPoints,
            fill: true,
            backgroundColor: `hsla(${(i * 60) % 360}, 70%, 60%, 0.4)`,  // Kategorilere göre renk
            borderColor: `hsl(${(i * 60) % 360}, 70%, 40%)`,  // Kategorilere göre renk
            tension: 0.3
        };
    });

    // Chart.js ile çizim yap
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: sortedDates,
            datasets: datasets
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Kategorilere Göre Zamanla Etkinlik Dağılımı'
                },
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 20,
                        padding: 15
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Tarih'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Etkinlik Sayısı'
                    }
                }
            }
        }
    });
};







export const renderTopUnitsTable = (data, containerId, totalEvents) => {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const top20 = data.sort((a, b) => b.Count - a.Count).slice(0, 20);

    // Başlık ekle
    const title = document.createElement('h3');
    title.innerText = 'En Çok Etkinlik Gösteren Birimler (İlk 20)';
    title.classList.add('text-xl', 'font-semibold', 'mb-4');
    container.appendChild(title);

    const table = document.createElement('table');
    table.classList.add('min-w-full', 'bg-white', 'border', 'border-gray-200', 'shadow-md', 'rounded-lg', 'overflow-hidden');

    const thead = document.createElement('thead');
    thead.classList.add('bg-gray-200', 'text-gray-700');

    const headerRow = document.createElement('tr');
    ['Sıra', 'İsim', 'Ana Kategori', 'Yüzde'].forEach(text => {
        const th = document.createElement('th');
        th.innerText = text;
        th.classList.add('py-3', 'px-6', 'border-b', 'text-left', 'font-medium');
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    top20.forEach((item, index) => {
        const row = document.createElement('tr');
        const percent = totalEvents ? ((item.Count / totalEvents) * 100).toFixed(1) + '%' : '0%';

        // Alt kategori: ilk virgülden önceki kelime, ilk harfi büyük
        let subCategory = '—';
        if (item.Description) {
            const firstWord = item.Description.split(',')[0].trim();
            subCategory = firstWord.charAt(0).toUpperCase() + firstWord.slice(1);
        }

        const values = [
            index + 1,
            item.Title,
            item.Cat_TR,
            percent
        ];

        values.forEach(val => {
            const td = document.createElement('td');
            td.innerText = val;
            td.classList.add('py-3', 'px-6', 'border-b', 'text-left');
            row.appendChild(td);
        });

        table.appendChild(row);
    });

    container.appendChild(table);
};



export const renderTopStoresTable = (data, containerId, totalEvents) => {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Toplam etkinlik sayısını konsola yazdır
    console.log('Store-Toplam Etkinlik Sayısı:', totalEvents);

    // Her bir başlık için etkinlik sayısını yazdır
    data.forEach(item => {
        console.log(`${item.Title}: ${item.Count} store-etkinlik`); // Count kullanıyoruz
    });

    const table = document.createElement('table');
    table.classList.add('min-w-full', 'bg-white', 'border', 'border-gray-200', 'shadow-md', 'rounded-lg', 'overflow-hidden');

    const thead = document.createElement('thead');
    thead.classList.add('bg-gray-200', 'text-gray-700');

    const title = document.createElement('h3');
    title.innerText = 'Birimlere Göre Dağılım (İlk 10)';
    title.classList.add('text-xl', 'font-semibold', 'mb-4');
    container.appendChild(title);

    const headerRow = document.createElement('tr');
    ['Sıra', 'İsim', 'Kategori', 'Yüzde'].forEach(text => {
        const th = document.createElement('th');
        th.innerText = text;
        th.classList.add('py-3', 'px-6', 'border-b', 'text-left', 'font-medium');
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    data.forEach((item, index) => {
        const row = document.createElement('tr');
        const percent = ((item.Count / totalEvents) * 100).toFixed(1) + '%';

        [index + 1, item.Title, item.Cat_TR, percent].forEach(val => {
            const td = document.createElement('td');
            td.innerText = val;
            td.classList.add('py-3', 'px-6', 'border-b', 'text-left');
            row.appendChild(td);
        });

        table.appendChild(row);
    });

    container.appendChild(table);
};


export const renderFoodPlacesTable = (data, containerId, totalEvents) => {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Toplam etkinlik sayısını konsola yazdır
    console.log('Toplam Etkinlik Sayısı:', totalEvents);

    // Her bir başlık için etkinlik sayısını yazdır
    data.forEach(item => {
        console.log(`${item.Title}: ${item.Count} etkinlik`); // Count kullanıyoruz
    });

    // Veriyi en çok etkinlik sayısına göre sırala
    const top10 = data.sort((a, b) => b.Count - a.Count).slice(0, 10); // Count ile sıralıyoruz

    const table = document.createElement('table');
    table.classList.add('min-w-full', 'bg-white', 'border', 'border-gray-200', 'shadow-md', 'rounded-lg', 'overflow-hidden');
    const thead = document.createElement('thead');
    thead.classList.add('bg-gray-200', 'text-gray-700');
    const title = document.createElement('h3');
    title.innerText = 'Yiyecek & İçecek Yerlerine Göre Dağılım (İlk 10)';
    title.classList.add('text-xl', 'font-semibold', 'mb-4');
    container.appendChild(title);

    const headerRow = document.createElement('tr');
    ['Sıra', 'İsim', 'Kategori', 'Yüzde'].forEach(text => {
        const th = document.createElement('th');
        th.innerText = text;
        th.classList.add('py-3', 'px-6', 'border-b', 'text-left', 'font-medium');
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    top10.forEach((item, index) => {
        const row = document.createElement('tr');

        // Yüzdeyi toplam etkinlik sayısına göre güvenli bir şekilde hesapla
        const percent = totalEvents > 0 ? ((item.Count / totalEvents) * 100).toFixed(1) + '%' : '0%'; // Count ile yüzdelik hesaplama

        // Verileri tablo satırına ekle
        [index + 1, item.Title, item.Cat_TR, percent].forEach(val => {
            const td = document.createElement('td');
            td.innerText = val;
            td.classList.add('py-3', 'px-6', 'border-b', 'text-left');
            row.appendChild(td);
        });

        table.appendChild(row);
    });

    container.appendChild(table);
};

export const renderServicesTable = (data, containerId, totalEvents) => {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // Toplam etkinlik sayısını konsola yazdır
    console.log('Toplam Etkinlik Sayısı:', totalEvents);

    // Her bir başlık için etkinlik sayısını yazdır
    data.forEach(item => {
        console.log(`${item.Title}: ${item.Count} etkinlik`); // Count kullanıyoruz
    });

    // Veriyi en çok etkinlik sayısına göre sırala
    const top10 = data.sort((a, b) => b.Count - a.Count).slice(0, 10); // Count ile sıralıyoruz

    const table = document.createElement('table');
    table.classList.add('min-w-full', 'bg-white', 'border', 'border-gray-200', 'shadow-md', 'rounded-lg', 'overflow-hidden');
    const thead = document.createElement('thead');
    thead.classList.add('bg-gray-200', 'text-gray-700');
    const title = document.createElement('h3');
    title.innerText = 'Hizmetlere Göre Dağılım (İlk 10)';
    title.classList.add('text-xl', 'font-semibold', 'mb-4');
    container.appendChild(title);

    const headerRow = document.createElement('tr');
    ['Sıra', 'İsim', 'Kategori', 'Yüzde'].forEach(text => {
        const th = document.createElement('th');
        th.innerText = text;
        th.classList.add('py-3', 'px-6', 'border-b', 'text-left', 'font-medium');
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    top10.forEach((item, index) => {
        const row = document.createElement('tr');

        // Yüzdeyi toplam etkinlik sayısına göre güvenli bir şekilde hesapla
        const percent = totalEvents > 0 ? ((item.Count / totalEvents) * 100).toFixed(1) + '%' : '0%'; // Count ile yüzdelik hesaplama

        // Verileri tablo satırına ekle
        [index + 1, item.Title, item.Cat_TR, percent].forEach(val => {
            const td = document.createElement('td');
            td.innerText = val;
            td.classList.add('py-3', 'px-6', 'border-b', 'text-left');
            row.appendChild(td);
        });

        table.appendChild(row);
    });

    container.appendChild(table);
};

export const renderFloorsTable = (data, containerId) => {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    // 📊 En yüksekten en düşüğe sırala (kiosk kullanım yüzdesine göre)
    data.sort((a, b) => parseFloat(b.kioskUsagePercent) - parseFloat(a.kioskUsagePercent));

    const table = document.createElement('table');
    table.classList.add('min-w-full', 'bg-white', 'border', 'border-gray-200', 'shadow-md', 'rounded-lg', 'overflow-hidden');

    const thead = document.createElement('thead');
    thead.classList.add('bg-gray-200', 'text-gray-700');

    const title = document.createElement('h3');
    title.innerText = 'Katlara Göre Dağılım';
    title.classList.add('text-xl', 'font-semibold', 'mb-4');
    container.appendChild(title);

    const headerRow = document.createElement('tr');
    ['Kat', 'Kiosk Kullanım Yüzdesi', 'Birim Aranma Yüzdesi'].forEach(text => {
        const th = document.createElement('th');
        th.innerText = text;
        th.classList.add('py-3', 'px-6', 'border-b', 'text-left', 'font-medium');
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    data.forEach(item => {
        const row = document.createElement('tr');
        const values = [
            item.floor,
            item.kioskUsagePercent + '%',
            item.unitSearchPercent + '%'
        ];

        values.forEach(val => {
            const td = document.createElement('td');
            td.innerText = val;
            td.classList.add('py-3', 'px-6', 'border-b', 'text-left');
            row.appendChild(td);
        });

        table.appendChild(row);
    });

    container.appendChild(table);
};



export const renderKiosksTable = (data, containerId) => {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    const table = document.createElement('table');
    table.classList.add('min-w-full', 'bg-white', 'border', 'border-gray-200', 'shadow-md', 'rounded-lg', 'overflow-hidden');

    const title = document.createElement('h3');
    title.innerText = 'Kiosklara Göre Dağılım';
    title.classList.add('text-xl', 'font-semibold', 'mb-4');
    container.appendChild(title);

    const thead = document.createElement('thead');
    thead.classList.add('bg-gray-200', 'text-gray-700');
    const headerRow = document.createElement('tr');
    ['Kiosk ID', 'Kat', 'Yüzde'].forEach(text => {
        const th = document.createElement('th');
        th.innerText = text;
        th.classList.add('py-3', 'px-6', 'border-b', 'text-left', 'font-medium');
        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    // Toplam action sayısını hesaplayalım
    const totalActions = data.reduce((total, item) => total + item.actions, 0);

    // Yüzdelik orana göre sıralama işlemi
    const sortedData = data.map(item => {
        // Yüzdeyi hesapla
        const percentage = ((item.actions / totalActions) * 100).toFixed(2);
        return { ...item, percentage: parseFloat(percentage) }; // item'e yüzdelik oranı ekle
    }).sort((a, b) => b.percentage - a.percentage); // Yüzdelik oranına göre büyükten küçüğe sıralama

    sortedData.forEach(item => {
        const row = document.createElement('tr');
        const values = [
            item.kiosk,
            item.floor,
            `${item.percentage}%` // Yüzdeyi kullan
        ];

        values.forEach(val => {
            const td = document.createElement('td');
            td.innerText = val;
            td.classList.add('py-3', 'px-6', 'border-b', 'text-left');
            row.appendChild(td);
        });

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    container.appendChild(table);
};


