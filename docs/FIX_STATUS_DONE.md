# Changelog - Fix Status "Done"

## [Fix] 2026-05-11 - Status Chat Tidak Berubah ke "Selesai"

### 🐛 Bug yang Diperbaiki
Status chat tidak berubah menjadi "done" (selesai) setelah AI mengucapkan terima kasih dan mengirimkan link survey kepada user.

### 🔧 Perubahan Teknis

#### 1. `src/routes/webhook.js`
**Masalah:**
- Pengecekan status "done" dilakukan setelah pengecekan eskalasi
- Kondisi `if (isDone && !isEscalated)` mencegah status berubah jika ada flag eskalasi
- Hanya mencari teks exact case-sensitive

**Solusi:**
```javascript
// SEBELUM
const isEscalated = replyText.includes('menghubungkan Sobat dengan tim kami');
if (isEscalated) {
  db.updateStatus(phone, 'escalated');
  // ...
}

const isDone = replyText.includes('bit.ly/survey-layanan-ai');
if (isDone && !isEscalated) {  // ❌ Tidak akan jalan jika ada eskalasi
  db.updateStatus(phone, 'done');
  // ...
}

// SESUDAH
const isDone = replyText.toLowerCase().includes('bit.ly/survey-layanan-ai') || 
               replyText.toLowerCase().includes('survey-layanan-ai');
if (isDone) {  // ✅ Prioritas pertama, langsung set done
  db.updateStatus(phone, 'done');
  db.resetMenuState(phone);
  broadcast('status_change', { phone, status: 'done' });
  console.log(`[SELESAI] ${name} (${phone})`);
}
else {  // ✅ Eskalasi hanya dicek jika BUKAN done
  const isEscalated = replyText.includes('menghubungkan Sobat dengan tim kami');
  if (isEscalated) {
    db.updateStatus(phone, 'escalated');
    // ...
  }
}
```

**Improvement:**
- ✅ Pengecekan `isDone` diprioritaskan (dicek duluan)
- ✅ Case-insensitive matching dengan `.toLowerCase()`
- ✅ Mencari 2 variasi: `bit.ly/survey-layanan-ai` ATAU `survey-layanan-ai`
- ✅ Eskalasi hanya dicek jika bukan done (menggunakan `else`)

#### 2. `src/services/ai.js`
**Masalah:**
- Prompt kurang jelas tentang format link survey
- AI mungkin menulis link dengan format berbeda

**Solusi:**
```javascript
// SEBELUM
=== ALUR PENYELESAIAN ===
- Jika user jawab "sudah" / "selesai" → ucapkan terima kasih + kirim link survei: https://bit.ly/survey-layanan-ai
- Jika user jawab "belum" → coba bantu sekali lagi, jika tetap tidak bisa → eskalasi

// SESUDAH
=== ALUR PENYELESAIAN ===
- Jika user jawab "sudah" / "selesai" / "terselesaikan" → ucapkan terima kasih + WAJIB kirim link survei: https://bit.ly/survey-layanan-ai
- Jika user jawab "belum" → coba bantu sekali lagi, jika tetap tidak bisa → eskalasi
- Link survey HARUS ditulis PERSIS: https://bit.ly/survey-layanan-ai (jangan diubah formatnya)
```

**Improvement:**
- ✅ Menambahkan kata kunci "terselesaikan" sebagai trigger
- ✅ Menegaskan dengan kata "WAJIB" dan "HARUS"
- ✅ Instruksi eksplisit: "jangan diubah formatnya"

### 📊 Test Results

| Test Case | Input User | AI Response | Status Change | Result |
|-----------|-----------|-------------|---------------|--------|
| 1 | "Sudah selesai" | Terima kasih + link survey | ai → done | ✅ PASS |
| 2 | "Sudah" | Terima kasih + link survey | ai → done | ✅ PASS |
| 3 | "Terselesaikan" | Terima kasih + link survey | ai → done | ✅ PASS |
| 4 | Link dengan huruf besar | "SURVEY-LAYANAN-AI" | ai → done | ✅ PASS |

### 🎯 Impact
- ✅ Status chat otomatis berubah ke "done" setelah survey dikirim
- ✅ Dashboard menampilkan status "Selesai" dengan badge hijau
- ✅ User tidak perlu manual mengubah status
- ✅ Statistik "Selesai" di dashboard terupdate otomatis

### 📝 Files Changed
- `src/routes/webhook.js` - Logic pengecekan status
- `src/services/ai.js` - Prompt AI untuk link survey
- `README.md` - Update feature list
- `TEST_STATUS_FIX.md` - Test case documentation

### 🚀 Deployment
Tidak ada perubahan dependency atau environment variable. Cukup restart server:
```bash
npm start
```

### 🔍 Monitoring
Cek log console untuk memastikan fix berjalan:
```
[SELESAI] Nama User (628xxx)
```

Cek dashboard untuk melihat status berubah ke hijau "Selesai".

---
**Fixed by:** Kiro AI Assistant  
**Date:** 2026-05-11  
**Version:** 1.0.1
