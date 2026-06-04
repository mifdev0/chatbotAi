# 🖥️ Panduan Deploy ke VPS

## 📋 Persiapan

### Spesifikasi VPS Minimum:
- **CPU:** 1 Core (bot pakai ~5-15%)
- **RAM:** 512 MB (bot pakai ~150-250 MB)
- **Storage:** 10 GB (bot pakai ~500 MB)
- **OS:** Ubuntu 22.04 LTS

### Yang Dibutuhkan:
- ✅ VPS (Niagahoster, DigitalOcean, Vultr, dll)
- ✅ Fonnte API Key
- ✅ DeepSeek API Key
- ✅ SSH Client (PowerShell/PuTTY)

---

## 🚀 Step-by-Step Deploy

### Step 1: Login ke VPS

**Windows (PowerShell):**
```powershell
ssh root@IP_VPS_KAMU
# Masukkan password
```

**Atau pakai PuTTY:**
- Download: https://putty.org
- Masukkan IP Address → Open
- Login: `root` + password

---

### Step 2: Update System

```bash
apt update && apt upgrade -y
```

---

### Step 3: Install Node.js

```bash
# Install Node.js 20.x LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verifikasi
node -v   # v20.x.x
npm -v    # 10.x.x
```

---

### Step 4: Install PM2 & Git

```bash
# Install PM2 (Process Manager)
npm install -g pm2

# Install Git
apt install -y git

# Verifikasi
pm2 -v
git --version
```

---

### Step 5: Clone Project

**Jika sudah di GitHub:**
```bash
cd ~
git clone https://github.com/username/repo-name.git
cd repo-name
```

**Jika belum (Upload Manual):**
```bash
# Di komputer lokal: zip project (tanpa node_modules)
# Upload via SFTP/SCP ke VPS
# Di VPS:
unzip whatsapp-bot.zip
cd whatsapp-bot
```

---

### Step 6: Install Dependencies

```bash
npm install
```

---

### Step 7: Setup Environment Variables

```bash
nano .env
```

Isi dengan (Ctrl+X, Y, Enter untuk save):
```env
FONNTE_API_KEY=your_fonnte_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
PORT=3000
SESSION_SECRET=randomString123!@#
ADMIN_USERNAME=admin
ADMIN_PASSWORD=yourSecurePassword
DB_CONVERSATIONS=data/conversations.db
DB_KNOWLEDGE=data/knowledge.db
NODE_ENV=production
```

---

### Step 8: Buat Folder Data

```bash
mkdir -p data
```

---

### Step 9: Test Run

```bash
npm start
```

Jika muncul:
```
[DB] Conversations database initialized
[DB] Knowledge database initialized
Server running on port 3000
```

**BERHASIL!** Tekan Ctrl+C untuk stop.

---

### Step 10: Jalankan dengan PM2 (24/7)

```bash
# Start bot
pm2 start server.js --name whatsapp-bot

# Lihat status
pm2 status

# Save konfigurasi
pm2 save

# Auto start saat VPS reboot
pm2 startup
# Copy-paste command yang muncul, lalu jalankan
```

---

## 🌐 Setup Domain & SSL (Opsional)

### Jika Punya Domain (contoh: botwa.com)

#### 1. Arahkan Domain ke VPS
Di DNS provider:
```
Type: A
Name: @
Value: IP_VPS_KAMU
TTL: Auto
```

#### 2. Install Nginx
```bash
apt install -y nginx
```

#### 3. Konfigurasi Nginx
```bash
nano /etc/nginx/sites-available/whatsapp-bot
```

Isi:
```nginx
server {
    listen 80;
    server_name botwa.com www.botwa.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Save, lalu:
```bash
ln -s /etc/nginx/sites-available/whatsapp-bot /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### 4. Install SSL (HTTPS)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d botwa.com -d www.botwa.com
```

Pilih: **Redirect HTTP to HTTPS**

---

## 🔧 Konfigurasi Webhook Fonnte

Login ke Fonnte → Device Settings → Webhook URL:

**Jika pakai domain:**
```
https://botwa.com/webhook
```

**Jika pakai IP langsung:**
```
http://IP_VPS:3000/webhook
```

---

## ✅ Verifikasi

### 1. Cek Status Bot
```bash
pm2 status
```

### 2. Cek Logs
```bash
pm2 logs whatsapp-bot
```

### 3. Test Dashboard
Buka browser:
```
https://botwa.com/dashboard.html
```
atau
```
http://IP_VPS:3000/dashboard.html
```

### 4. Test WhatsApp
Kirim pesan ke nomor WhatsApp yang terhubung dengan Fonnte.

---

## 🔄 Update Bot

```bash
cd ~/repo-name
git pull
npm install
pm2 restart whatsapp-bot
```

---

## 📊 Monitoring

### Perintah PM2 Penting:
```bash
pm2 status              # Lihat status
pm2 logs whatsapp-bot   # Lihat logs real-time
pm2 restart whatsapp-bot # Restart bot
pm2 stop whatsapp-bot   # Stop bot
pm2 monit               # Monitor CPU & RAM
```

---

## 🐛 Troubleshooting

### Bot Tidak Jalan
```bash
pm2 logs whatsapp-bot
pm2 restart whatsapp-bot
```

### Port 3000 Sudah Dipakai
```bash
lsof -i :3000
kill -9 <PID>
```

### Database Error
```bash
mkdir -p data
chmod 755 data
```

---

## 🔒 Keamanan (Recommended)

### 1. Ganti Password Root
```bash
passwd
```

### 2. Setup Firewall
```bash
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable
```

---

## 💰 Estimasi Biaya

| Item | Harga |
|------|-------|
| VPS (Niagahoster) | Rp 15.000 - 30.000/bulan |
| Domain (opsional) | Rp 100.000/tahun |
| SSL | GRATIS (Let's Encrypt) |

---

## ✅ Checklist

- [ ] Login SSH ke VPS
- [ ] Install Node.js, PM2, Git
- [ ] Clone/Upload project
- [ ] Install dependencies
- [ ] Setup `.env`
- [ ] Test run
- [ ] Start dengan PM2
- [ ] Setup auto start
- [ ] (Opsional) Setup domain + SSL
- [ ] Update webhook Fonnte
- [ ] Test kirim pesan WhatsApp

---

**Selamat! Bot WhatsApp kamu sudah online 24/7!** 🎉
