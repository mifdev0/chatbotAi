# 🚂 Panduan Deploy ke Railway

## 📋 Persiapan

### 1. Pastikan Punya Akun
- **GitHub Account** → https://github.com
- **Railway Account** → https://railway.app (login pakai GitHub)

### 2. API Keys yang Dibutuhkan
- ✅ **Fonnte API Key** → https://fonnte.com
- ✅ **DeepSeek API Key** → https://platform.deepseek.com

---

## 🚀 Cara Deploy (2 Metode)

### **Metode 1: Via GitHub (Recommended)** ⭐

#### Step 1: Push ke GitHub
```bash
# Inisialisasi git (kalau belum)
git init

# Add semua file
git add .

# Commit
git commit -m "Initial commit - WhatsApp Bot AI"

# Buat repository baru di GitHub, lalu:
git remote add origin https://github.com/username/repo-name.git
git branch -M main
git push -u origin main
```

#### Step 2: Deploy di Railway
1. Buka **https://railway.app**
2. Klik **"New Project"**
3. Pilih **"Deploy from GitHub repo"**
4. Pilih repository kamu
5. Railway akan otomatis detect dan deploy

#### Step 3: Set Environment Variables
1. Di Railway dashboard, klik project kamu
2. Klik tab **"Variables"**
3. Tambahkan satu per satu:

```
FONNTE_API_KEY=isi_api_key_fonnte_kamu
DEEPSEEK_API_KEY=isi_api_key_deepseek_kamu
PORT=3000
SESSION_SECRET=buatRandomString123!@#
ADMIN_USERNAME=admin
ADMIN_PASSWORD=passwordKamuYangKuat123
DB_CONVERSATIONS=data/conversations.db
DB_KNOWLEDGE=data/knowledge.db
NODE_ENV=production
```

4. Klik **"Add"** untuk setiap variable
5. Railway akan **auto redeploy** setelah save

#### Step 4: Dapatkan URL
1. Klik tab **"Settings"**
2. Scroll ke **"Domains"**
3. Klik **"Generate Domain"**
4. Copy URL (contoh: `https://whatsapp-bot-production.up.railway.app`)

---

### **Metode 2: Via Railway CLI** (Alternatif)

#### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

#### Step 2: Login
```bash
railway login
```
Browser akan terbuka, login dengan GitHub.

#### Step 3: Deploy
```bash
# Di folder project
railway init

# Deploy
railway up
```

#### Step 4: Set Environment Variables
```bash
railway variables set FONNTE_API_KEY=xxx
railway variables set DEEPSEEK_API_KEY=xxx
railway variables set SESSION_SECRET=xxx
railway variables set ADMIN_USERNAME=admin
railway variables set ADMIN_PASSWORD=xxx
railway variables set PORT=3000
railway variables set NODE_ENV=production
```

#### Step 5: Buka Dashboard
```bash
railway open
```

---

## 🔧 Konfigurasi Webhook Fonnte

Setelah deploy, update webhook URL di Fonnte:

1. Login ke **https://fonnte.com**
2. Masuk ke **"Device Settings"**
3. Set **Webhook URL** ke:
   ```
   https://your-app-name.up.railway.app/webhook
   ```
4. Save

---

## ✅ Verifikasi Deploy Berhasil

### 1. Cek Logs
Di Railway dashboard:
- Klik tab **"Deployments"**
- Klik deployment terakhir
- Lihat logs, pastikan ada:
  ```
  [DB] Conversations database initialized
  [DB] Knowledge database initialized
  Server running on port 3000
  ```

### 2. Test Dashboard
Buka di browser:
```
https://your-app-name.up.railway.app/dashboard.html
```

Login dengan:
- Username: `admin` (atau sesuai ADMIN_USERNAME)
- Password: password yang kamu set

### 3. Test WhatsApp Bot
Kirim pesan ke nomor WhatsApp yang terhubung dengan Fonnte.

---

## 📊 Monitoring

### Cek Logs Real-time
```bash
railway logs
```

Atau di dashboard Railway → tab **"Deployments"** → klik deployment → lihat logs.

### Cek Database
Railway otomatis buat folder `data/` dan simpan database di sana.

---

## 🔄 Update Aplikasi

### Via GitHub (Auto Deploy)
```bash
# Edit code
git add .
git commit -m "Update feature"
git push

# Railway otomatis detect dan redeploy
```

### Via CLI
```bash
railway up
```

---

## 💰 Biaya

Railway memberikan:
- **$5 credit gratis** per bulan
- **500 jam gratis** untuk Hobby plan
- Bot ini pakai ~730 jam/bulan (24/7)

**Solusi:**
1. Pakai credit card untuk **Developer plan** ($5/bulan)
2. Atau pakai **Render** (gratis tapi sleep setelah 15 menit idle)

---

## 🐛 Troubleshooting

### Error: "Module not found"
```bash
# Pastikan dependencies terinstall
railway run npm install
```

### Error: "Port already in use"
Railway otomatis set PORT, pastikan di code pakai:
```javascript
const PORT = process.env.PORT || 3000;
```

### Database tidak persistent
Pastikan folder `data/` ada di project dan tidak di `.gitignore`.

### WebSocket tidak connect
Pastikan Railway generate domain dengan HTTPS (otomatis).

---

## 📞 Support

Kalau ada masalah:
1. Cek logs di Railway dashboard
2. Cek webhook URL di Fonnte sudah benar
3. Cek environment variables sudah lengkap

---

**Selamat! Bot WhatsApp kamu sudah online 24/7!** 🎉
