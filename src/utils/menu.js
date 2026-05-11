// ─── Menu Utama ────────────────────────────────────────────────────────────────
// Setiap item punya: label (teks menu) dan topik (keyword untuk retrieve knowledge)
const MENU_ITEMS = [
  { label: 'Lupa Password / Reset Akun',    topik: 'Lupa Password Akun' },
  { label: 'Verifikasi 2 Langkah (2FA)',    topik: 'Verifikasi 2 Langkah (2FA)' },
  { label: 'Login Akun Layanan',            topik: 'Login Akun' },
  { label: 'Masalah Koneksi Internet',      topik: 'Internet' },
  { label: 'Panduan Layanan Digital',       topik: 'Layanan Digital' },
  { label: 'Masalah lain / Chat dengan Admin', topik: null }, // eskalasi manual
];

function buildMenuText() {
  const lines = MENU_ITEMS.map((item, i) => `${i + 1}. ${item.label}`);
  return (
    `Halo Sobat! 👋 Selamat datang di *Asisten AI*.\n\n` +
    `Silakan pilih topik kendala Anda dengan membalas *angka* berikut:\n\n` +
    lines.join('\n') +
    `\n\nKetik angka pilihan Anda (contoh: *1*)`
  );
}

function getMenuItem(index) {
  return MENU_ITEMS[index - 1] || null;
}

function isValidMenuChoice(input) {
  const num = parseInt(input.trim(), 10);
  return !isNaN(num) && num >= 1 && num <= MENU_ITEMS.length;
}

module.exports = {
  MENU_ITEMS,
  buildMenuText,
  getMenuItem,
  isValidMenuChoice,
};
