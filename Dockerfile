# Nginx Alpine imajını kullan (hafif ve hızlı)
FROM nginx:alpine

# Nginx konfigürasyon dosyasını kopyala
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Tüm frontend dosyalarını nginx'in serve edeceği dizine kopyala
COPY . /usr/share/nginx/html

# Port 80'i aç
EXPOSE 80

# Nginx'i başlat
CMD ["nginx", "-g", "daemon off;"]

